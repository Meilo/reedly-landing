import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Developer docs, served by Starlight. Content lives one level deeper
// (src/content/docs/docs/) so Starlight owns `/docs/*` only and leaves the
// marketing routes (`/`, `/fr/*`, `/en/*`) alone — the documented "Starlight at
// a subpath" pattern.
const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    lang: z.enum(['fr', 'en']),
    mirror: z.string(),
    keywords: z.array(z.string()),
    readingTime: z.number(),
    author: z.enum(['laura', 'ludovic']),
  }),
});

export const collections = { blog, docs };
