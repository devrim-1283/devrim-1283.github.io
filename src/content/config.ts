import { defineCollection, z } from 'astro:content';

const post = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.array(z.string()).default([]),
  referenceLabel: z.string().optional(),
  referenceUrl: z.string().url().optional(),
});

export const collections = {
  posts: defineCollection({ type: 'content', schema: post }),
  'en-posts': defineCollection({ type: 'content', schema: post }),
};
