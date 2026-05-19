# Done Dynamics — Engineering (GitHub Pages)

Backlink / engineering blog satellite site for [donedynamics.com](https://donedynamics.com), hosted free on GitHub Pages.

- **Stack**: Astro 4 + Tailwind + content collections (markdown)
- **i18n**: TR (default, `/`) + EN (`/en/`)
- **Format**: every post follows `H1 → Problem → Architecture → Code sample → Benchmark → Diagram → Conclusion → Reference link`
- **Backlink strategy**: nav, footer, and post-end "Reference" card all link back to donedynamics.com (deep links to the relevant service page).

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # ./dist
```

## Deploy

GitHub Pages mode: **Settings → Pages → Build and deployment → Source: GitHub Actions** (not "Deploy from a branch").

Push to `master` or `main` and `.github/workflows/deploy.yml` will:

1. `npm ci`
2. `npm run build`
3. upload `./dist` as a Pages artifact
4. deploy to `https://<username>.github.io/`

### URL setup

This config targets the **root user domain**: `https://devrim-1283.github.io`.

Repository name **must be exactly** `devrim-1283.github.io` for the root domain to work. If you put the code in a differently-named repo, switch `astro.config.mjs → site` to `https://devrim-1283.github.io/<repo-name>` and add `base: '/<repo-name>'`.

### Private repo

Private repos can publish public Pages sites **only on GitHub Pro / Team / Enterprise**. The "This repository is private but the published site will be public" banner you see means your account already supports it. Free accounts must make the repo public.

## Adding a new post

TR posts live in `src/content/posts/*.md`, EN in `src/content/en-posts/*.md`. Frontmatter:

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

Body must use the post format (Problem → Architecture → Code sample → Benchmark → Diagram → Conclusion). The `Reference` card is rendered automatically by the layout from the frontmatter.

## Why this exists

Pure backlink farms get penalised. This site exists because:

- It's a real engineering blog with original measurements,
- Every post genuinely references the matching service page on donedynamics.com,
- The domain authority of `github.io` is high and the dofollow links it sends to donedynamics.com are clean.
