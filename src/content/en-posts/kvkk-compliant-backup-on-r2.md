---
title: "A KVKK-compliant backup architecture on Cloudflare R2"
description: "How we keep Türkiye-resident customer data inside the country while still using R2 — bucket policy, residency, encryption and audit trail."
date: "2026-04-18"
tags: ["kvkk", "backup", "cloudflare", "r2"]
referenceLabel: "donedynamics.com — Backup & object storage"
referenceUrl: "https://donedynamics.com/en/solutions/backup-storage"
---

## Problem

KVKK (Türkiye's GDPR-equivalent) is strict about data residency for Turkish residents' personal data. R2 is attractive — flat egress pricing, S3-compatible API, fits Cloudflare-fronted apps — but R2 has no explicit Türkiye region.

We needed a structure that uses R2 for the operational benefits while staying defensible under a KVKK audit: encryption keys held by us, data location tightly controlled, audit log preserved.

## Architecture

```
┌──────────────────────────────────────────────┐
│  Origin (Hetzner FSN1, EU — DPA in place)    │
│  ├── customer Postgres / object data         │
│  └── restic client (KMS-held passphrase)     │
└─────────────────────────┬────────────────────┘
                          │  ciphertext only
                          ▼
┌──────────────────────────────────────────────┐
│  Cloudflare R2 (EU jurisdiction binding)     │
│  ├── bucket: dd-backups-prod                 │
│  ├── lifecycle: 90d to cold tier             │
│  └── access: scoped API token, IP-pinned     │
└──────────────────────────────────────────────┘
```

Two things make this defensible:

1. **The plaintext never leaves Hetzner EU.** restic encrypts before R2 sees a byte.
2. **The passphrase lives in our own HSM-backed KMS**, not in R2 metadata.

If R2 is subpoenaed, the bytes are useless without our key.

## Code sample

```python
# /opt/dd/backup.py — production-shape excerpt
import os, subprocess
from pathlib import Path
from kms_client import fetch_passphrase  # internal lib

def run_backup(tenant: str, source: Path) -> None:
    pw = fetch_passphrase(f"restic/{tenant}")
    env = {
        **os.environ,
        "RESTIC_PASSWORD": pw,
        "RESTIC_REPOSITORY": f"s3:{R2_ENDPOINT}/dd-backups-prod/{tenant}",
        "AWS_ACCESS_KEY_ID": R2_KEY,
        "AWS_SECRET_ACCESS_KEY": R2_SECRET,
    }
    subprocess.run(
        ["restic", "backup", str(source),
         "--tag", tenant, "--host", os.uname().nodename],
        env=env, check=True,
    )
```

Passphrase is fetched per-tenant, lives in process memory only for the duration of the backup, never written to disk.

## Benchmark

Daily run, 22 tenants, ~80 GB total source:

| Step                       | Time   | Bytes uploaded |
|----------------------------|--------|----------------|
| restic backup (incremental)| 3m 41s | 280 MB         |
| restic verify (--read-data 5)| 1m 12s | —            |
| restic forget --prune       | 0m 18s | —             |

R2 egress for an annual restore drill: **~80 GB**, costs $0 (Cloudflare's flat egress model). Same drill on AWS S3 would cost ~$7.20.

## Diagram

```
KVKK audit checklist:

[✓] Data residency: ciphertext-only at R2, plaintext stays in EU
[✓] Encryption at rest: AES-256 via restic
[✓] Encryption in transit: HTTPS to R2, TLS 1.3
[✓] Access log: Cloudflare R2 audit log + restic snapshot history
[✓] Key custody: HSM-backed KMS, separated from data plane
[✓] Right to erasure: restic forget --tag <tenant> --prune
[✓] Restore test: monthly automated drill, reported to customer
```

This is the same checklist we present to customers' legal/compliance team during onboarding.

## Conclusion

You don't need an in-Türkiye S3 to be KVKK-compliant — what matters is who holds the **key** and where the **plaintext** lives. With encryption pushed to the client and keys held in our KMS, R2 becomes an opaque ciphertext store. The cost and DX wins are real, and the audit story is cleaner than most "Türkiye-only" setups we've reviewed.

This pattern is the default on every backup engagement we run.
