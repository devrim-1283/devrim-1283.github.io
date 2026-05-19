import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://devrim-1283.github.io',
  integrations: [tailwind()],
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
});
