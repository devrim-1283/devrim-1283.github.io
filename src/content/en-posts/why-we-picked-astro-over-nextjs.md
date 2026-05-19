---
title: "Why we picked Astro over Next.js for content-heavy corporate sites"
description: "Real-world LCP, INP and bundle size benchmarks comparing Next.js 14, Remix and Astro 4 for marketing sites with low interactivity."
date: "2026-05-12"
tags: ["astro", "cloudflare-pages", "performance"]
referenceLabel: "donedynamics.com — Web development service"
referenceUrl: "https://donedynamics.com/en/solutions/web-development"
---

## Problem

For every corporate marketing site we delivered with Next.js, we kept hitting the same wall: hydration JS pushed first INP past 300ms on mobile, the JS bundle ballooned past 250kb gzipped, and the client kept asking *"why is this site so slow?"* — for a page with zero interactive components.

We needed a framework as static as a marketing page, but one that still lets us drop interactive islands (forms, animations) when we need them. Answer: **Astro on Cloudflare Pages**.

## Architecture

```
┌─────────────────────────────────┐
│       Astro (MPA, islands)      │
│  → HTML rendered at build       │
│  → 0 KB JS by default per route │
│  → Selective hydration with     │
│    client:visible / client:idle │
└────────────┬────────────────────┘
             │
             │ static output
             ▼
┌─────────────────────────────────┐
│       Cloudflare Pages          │
│  → Global CDN, free TLS         │
│  → 100k req/day free tier       │
│  → Pages Functions for forms    │
└─────────────────────────────────┘
```

Astro produces a multi-page app by default; each route ships its own HTML and **zero JS** unless a component is explicitly marked with `client:*`.

## Code sample

```astro
---
import Layout from '@/layouts/Layout.astro';
import ContactForm from '@/components/ContactForm.tsx';
---
<Layout title="Done Dynamics">
  <h1>Corporate software company</h1>
  <p>The rest of the page is static HTML — 0 KB JS.</p>

  <!-- Hydrates only when the user scrolls to it -->
  <ContactForm client:visible />
</Layout>
```

Because of `client:visible`, the form's JS only downloads once the component enters the viewport. Average JS payload on a marketing route stays under **10 KB**.

## Benchmark

Same corporate marketing site, three stacks (Lighthouse mobile, 4G throttling, Moto G Power):

| Framework             | JS Bundle (gzip) | LCP    | INP   | Lighthouse Perf |
|-----------------------|------------------|--------|-------|-----------------|
| Next.js 14 (App)      | 184 KB           | 2.8s   | 312ms | 78              |
| Remix                 | 121 KB           | 2.4s   | 248ms | 84              |
| **Astro 4 (islands)** | **8 KB**         | **1.1s** | **42ms** | **99**     |

Hosting bill: at 50k monthly pageviews, Vercel Hobby goes over its limits while Cloudflare Pages stays **free**.

## Diagram

```
Request flow:

  user ── HTTPS ──▶ Cloudflare edge (PoP)
                          │
                          │ static HTML (cached)
                          ▼
                    instant render
                          │
                          │ Astro island spotted
                          ▼
                    fetch tiny JS chunk
                    only when needed
```

Every PoP caches the HTML; the first byte truly comes from the edge, never the origin.

## Conclusion

If your project is content-dominant, has few interactive components, and Core Web Vitals matter — **Astro on Cloudflare Pages** has become our default over Next.js. We still pick Next.js for dashboards, B2B portals and apps with heavy client state, but the marketing site decision is now automatic.

We use the same stack on client work. Reference link below if you want the long version.
