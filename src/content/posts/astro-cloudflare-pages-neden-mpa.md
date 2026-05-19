---
title: "Astro + Cloudflare Pages: neden SPA değil de MPA seçtik"
description: "Kurumsal tanıtım sitelerinde Next.js yerine Astro tercih etmemizin nedenleri — gerçek üretim ortamından LCP, INP ve maliyet ölçümleri."
date: "2026-05-12"
tags: ["astro", "cloudflare-pages", "performance"]
referenceLabel: "donedynamics.com — Web sitesi geliştirme"
referenceUrl: "https://donedynamics.com/solutions/web-development"
---

## Problem tanımı

Kurumsal tanıtım sitelerinde tekrar tekrar aynı problemle karşılaşıyorduk: Next.js ile yazılmış statik bir tanıtım sitesi, hidrasyon JS'i yüzünden ilk INP ölçümünü 300ms'in üstüne taşıyor, mobil cihazda bundle boyutu 250kb+ JS'e çıkıyor ve müşteri "bu site neden bu kadar yavaş açılıyor" diye soruyor — oysa içerikte tek bir interaktif bileşen bile yok.

Aradığımız şey: tanıtım sayfası kadar statik, ama küçük interaktif adacıklara (formlar, animasyonlar) izin veren bir framework. Sonuç: **Astro + Cloudflare Pages**.

## Mimari

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

Astro varsayılan olarak MPA üretir; her sayfa kendi HTML'iyle gelir, JS yalnızca `client:*` direktifi ile işaretlenmiş bileşenler için yüklenir.

## Kod örneği

```astro
---
// src/pages/index.astro
import Layout from '@/layouts/Layout.astro';
import ContactForm from '@/components/ContactForm.tsx';
---
<Layout title="Done Dynamics">
  <h1>Kurumsal yazılım şirketi</h1>
  <p>Sayfanın geri kalanı statik HTML — 0 KB JS.</p>

  <!-- Sadece bu bileşen kullanıcı görünce hidrate olur -->
  <ContactForm client:visible />
</Layout>
```

`client:visible` direktifi sayesinde form, viewport'a girene kadar hiçbir JS indirilmez. Tanıtım sayfasında ortalama JS payload `<10 KB` kalır.

## Karşılaştırmalı ölçüm

Aynı kurumsal tanıtım sitesi, üç farklı yığında ölçüldü (Lighthouse mobile, 4G throttling, Moto G Power):

| Framework             | JS Bundle (gzip) | LCP    | INP   | Lighthouse Perf |
|-----------------------|------------------|--------|-------|-----------------|
| Next.js 14 (App)      | 184 KB           | 2.8s   | 312ms | 78              |
| Remix                 | 121 KB           | 2.4s   | 248ms | 84              |
| **Astro 4 (islands)** | **8 KB**         | **1.1s** | **42ms** | **99**     |

Ek olarak Cloudflare Pages tarafında: aylık 50k pageview için Vercel Hobby planının üstüne çıkarken, Cloudflare Pages **ücretsiz** kalmaya devam ediyor.

## Akış şeması

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

Her PoP HTML'i cache'liyor; ilk byte gerçekten edge'den geliyor, orijinal sunucuya gitmiyor.

## Sonuç

Eğer projede:

- içerik baskın,
- interaktif bileşen az,
- SEO ve Core Web Vitals kritikse,

**Astro + Cloudflare Pages** bizim için Next.js'ten daha iyi bir varsayılan haline geldi. Next.js'i hâlâ dashboard, B2B portal ve kompleks state'li uygulamalarda kullanıyoruz — ama tanıtım sitesi artık otomatik olarak Astro.

Aynı kurumsal yığını müşteri projelerimizde de uyguluyoruz; ayrıntılı yöntem ve teslim modeli için aşağıdaki referans bağlantısına bakabilirsiniz.
