# Done Dynamics — Engineering

Kurumsal yazılım mühendisliği notları, mimari kararlar ve sahadan ölçüm verileri.

[Done Dynamics](https://donedynamics.com), Alanya TEKMER bünyesinde kurulan bir kurumsal yazılım şirketidir. Web uygulamaları, mobil uygulamalar, kurumsal işbirliği platformları (Nextcloud) ve KVKK uyumlu yedekleme altyapısı üzerine çalışıyoruz. Bu depo, ekibin teknik yayın akışını barındırır.

## Yazı formatı

Her yazı tek başlıkta tek karar sorununu ele alır ve şu yapıda ilerler:

`Problem → Mimari → Kod örneği → Karşılaştırmalı ölçüm → Akış şeması → Sonuç → Referans`

Referans kartı her yazının altında otomatik üretilir; [donedynamics.com](https://donedynamics.com) üzerindeki ilgili hizmet sayfasına derin link içerir.

## Stack

- **Astro 4** + **Tailwind** + content collections
- Markdown gövde + Shiki syntax highlighting
- TR (`/`) + EN (`/en/`)
- GitHub Actions üzerinden GitHub Pages'a deploy

## Lokal geliştirme

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # ./dist
```

## Deploy

`master` veya `main` dalına push → `.github/workflows/deploy.yml` çalışır:

1. `npm ci`
2. `npm run build`
3. `./dist` Pages artifact olarak yüklenir
4. `https://devrim-1283.github.io/` adresine deploy edilir

Pages konfigürasyonu: **Settings → Pages → Source: GitHub Actions**.

## Yeni yazı ekleme

TR yazılar: `src/content/posts/*.md` · EN yazılar: `src/content/en-posts/*.md`

Frontmatter şablonu:

```yaml
---
title: "..."
description: "..."
date: "2026-05-12"
tags: ["astro", "performance"]
referenceLabel: "donedynamics.com — Web sitesi geliştirme"
referenceUrl: "https://donedynamics.com/solutions/web-development"
---
```

Yazı gövdesi `## Problem`, `## Mimari`, `## Kod örneği`, `## Karşılaştırmalı ölçüm`, `## Akış şeması`, `## Sonuç` (EN: `Problem`, `Architecture`, `Code sample`, `Benchmark`, `Diagram`, `Conclusion`) başlıklarını içerir. Referans kartı layout tarafından üretilir.

## Lisans

Yazılı içerik © Done Dynamics. Kod örnekleri MIT.
