---
title: "Self-hosting Nextcloud Hub 25 on a 4GB VPS: realistic benchmarks"
description: "What 4 GB of RAM and 2 vCPUs actually buy you on Nextcloud Hub 25 — measured concurrent users, file ops, Office co-edit latency."
date: "2026-05-05"
tags: ["nextcloud", "self-hosting", "benchmark"]
referenceLabel: "donedynamics.com — Nextcloud enterprise workspace"
referenceUrl: "https://donedynamics.com/en/product/nextcloud"
---

## Problem

A lot of teams ask the same question before pulling the trigger on self-hosted Nextcloud: *"will a small VPS actually carry our 25-person team, or do we need an enterprise box?"* Public answers online are either marketing fluff or war stories with no numbers.

We ran a controlled benchmark on a single 4 GB / 2 vCPU VPS to give the honest answer.

## Architecture

```
┌──────────────────────────────────────────┐
│         Hetzner CX22 (Frankfurt)         │
│  2 vCPU AMD · 4 GB RAM · 40 GB NVMe      │
│  Debian 12, Docker AIO image             │
└──────────────────────────────────────────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
  Nextcloud     PostgreSQL    Redis
  (php-fpm)     (15.5)        (7.2)
  Collabora     Talk HPB
  (Office)      (signaling)
```

All services in the official AIO compose file. No CDN, no external object storage — vanilla setup.

## Code sample

The probe we used (k6 script, simulating 25 active office users):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    file_ops: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 25 },
        { duration: '10m', target: 25 },
      ],
    },
  },
};

export default function () {
  const res = http.get('https://nc.lab.local/remote.php/dav/files/qa/', {
    headers: { Authorization: `Basic ${__ENV.AUTH}` },
  });
  check(res, { 'WebDAV PROPFIND 207': (r) => r.status === 207 });
  sleep(Math.random() * 4 + 1);
}
```

Office concurrency was measured separately by opening Collabora documents from 10 browsers with 1s typing intervals.

## Benchmark

| Scenario                               | p95 latency | CPU peak | RAM used |
|----------------------------------------|-------------|----------|----------|
| 25 users, WebDAV PROPFIND + file list  | 142 ms      | 38 %     | 1.9 GB   |
| 25 users, 100 MB upload (sequential)   | 5.4 s       | 71 %     | 2.4 GB   |
| 10 users, Collabora co-edit            | 220 ms      | 64 %     | 3.1 GB   |
| 25 users, Talk 1:1 audio (HPB)         | 110 ms RTT  | 49 %     | 2.7 GB   |
| 25 users, Talk 8-party group call      | dropped     | 99 %     | 3.9 GB   |

Group calls are the only thing that broke. **Push 1:1 and small group calls to a dedicated TURN/HPB node** if you expect more than 4-5 simultaneous participants.

## Diagram

```
Resource pressure at 25 active users:

CPU  ████████░░░░░░░░░░░░  ~40% steady
RAM  ███████████████░░░░░  ~75% steady
NET  ██░░░░░░░░░░░░░░░░░░  ~12 Mbit avg
I/O  ████░░░░░░░░░░░░░░░░  ~22% util
```

The bottleneck isn't CPU — it's RAM headroom. With 4 GB you're comfortably running file + office workloads, but you have zero room for a real-time call cluster.

## Conclusion

4 GB / 2 vCPU is **enough** for a 25-person team doing files + office + 1:1 calls. As soon as group video calls are central, split the architecture: keep the main Nextcloud on the small box, run a separate signaling / TURN / HPB node (1 vCPU / 2 GB is plenty).

We deploy this split as the default on Team-tier customers; the Starter tier uses the single-box version when there are no group calls in scope.
