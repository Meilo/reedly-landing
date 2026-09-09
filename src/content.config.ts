import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Developer docs, served by Starlight. Content lives one level deeper
// (src/content/docs/docs/) so Starlight owns `/docs/*` only and leaves the
// marketing routes (`/`, `/fr/*`, `/en/*`) alone — the documented "Starlight at
// a subpath" pattern.
const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });


export const collections = { docs };
