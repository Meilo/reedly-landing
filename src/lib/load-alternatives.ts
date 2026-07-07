import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface AlternativeRegistry {
  alternatives: { id: string; competitor: string; slug: string }[];
}

export interface AlternativeContent {
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; title: string; lead: string; cta_label: string; cta_url: string };
  verdict: { title: string; text: string };
  comparison: {
    eyebrow: string;
    title: string;
    lead: string;
    columns: { reedly: string; competitor: string };
    rows: { need: string; reedly: string; competitor: string }[];
  };
  value_blocks: {
    eyebrow: string;
    title: string;
    blocks: { title: string; tagline?: string; text: string; icon: string; items?: string[] }[];
  };
  privacy: { text: string };
  fair: {
    eyebrow: string;
    title: string;
    lead: string;
    cards: { title: string; text: string; icon: string }[];
  };
  faq: { question: string; answer: string }[];
  related: { href: string; label: string }[];
}

const DATA_DIR = path.resolve('src/data');
const CONTENT_DIR = path.resolve('src/content/alternatives');

export function loadAlternativeRegistry(): AlternativeRegistry {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'alternatives.yaml'), 'utf-8');
  return yaml.load(raw) as AlternativeRegistry;
}

export function loadAlternativeContent(lang: 'fr' | 'en', slug: string): AlternativeContent {
  const filePath = path.join(CONTENT_DIR, lang, `${slug}.yaml`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as AlternativeContent;
}

export function getAllAlternativeSlugs(lang: 'fr' | 'en'): string[] {
  const registry = loadAlternativeRegistry();
  return registry.alternatives
    .map((a) => a.slug)
    .filter((slug) => fs.existsSync(path.join(CONTENT_DIR, lang, `${slug}.yaml`)));
}
