import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://devrim-1283.github.io';
  const tr = await getCollection('posts');
  const en = await getCollection('en-posts');

  const urls = [
    `${base}/`,
    `${base}/en/`,
    ...tr.map((p) => `${base}/posts/${p.slug}/`),
    ...en.map((p) => `${base}/en/posts/${p.slug}/`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
