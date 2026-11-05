import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Every collection has `draft`. Drafts show in `npm run dev` and never ship to production.

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    category: z.enum(['City Hall', 'Now open', 'Schools', 'Getting around', 'Community', 'Sports', 'Food']),
    author: z.string().default('Go La Habra'),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const restaurants = defineCollection({
  loader: file('src/data/restaurants.json'),
  schema: z.object({
    name: z.string(),
    cuisine: z.string(),
    price: z.enum(['$', '$$', '$$$']),
    street: z.string(),
    tags: z.array(z.enum(['Open late', 'Kid friendly', 'Date night', 'Big portions', 'Study spot', 'Weekend pick', 'Breakfast'])).default([]),
    take: z.string(),
    website: z.url().optional(),
    photo: z.string().optional(),
    photoAlt: z.string().optional(),
    added: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const schools = defineCollection({
  loader: file('src/data/schools.json'),
  schema: z.object({
    name: z.string(),
    mascot: z.string(),
    order: z.number(),
  }),
});

const games = defineCollection({
  loader: file('src/data/games.json'),
  schema: z.object({
    school: z.enum(['lhhs', 'sonora', 'wchs']),
    opponent: z.string(),
    date: z.coerce.date(),
    time: z.string().optional(),
    home: z.boolean(),
    status: z.enum(['upcoming', 'final']),
    us: z.number().int().optional(),
    them: z.number().int().optional(),
    label: z.string().optional(),
    recap: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: file('src/data/events.json'),
  schema: z.object({
    name: z.string(),
    date: z.coerce.date(),
    time: z.string().optional(),
    place: z.string(),
    link: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news, restaurants, schools, games, events };
