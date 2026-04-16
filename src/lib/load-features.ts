import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface FeatureRegistry {
  features: { id: string; slugs: { fr: string; en: string } }[];
}

export interface FeatureContent {
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; title: string; lead: string; cta_label: string; cta_url: string };
  problem: {
    eyebrow: string; title: string; lead: string;
    cards: { title: string; text: string; icon: string }[];
  };
  solution: {
    eyebrow: string; title: string; lead: string;
    steps: { title: string; text: string }[];
  };
  benefits: {
    eyebrow: string; title: string;
    cards: { title: string; text: string; icon: string }[];
  };
  use_cases: {
    eyebrow: string; title: string;
    cards: { title: string; text: string; icon: string }[];
  };
  faq: { question: string; answer: string }[];
  related_features: { slug: string; label: string }[];
}

const DATA_DIR = path.resolve('src/data');
const CONTENT_DIR = path.resolve('src/content/features');

export function loadRegistry(): FeatureRegistry {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'features.yaml'), 'utf-8');
  return yaml.load(raw) as FeatureRegistry;
}

export function loadFeatureContent(lang: 'fr' | 'en', slug: string): FeatureContent {
  const filePath = path.join(CONTENT_DIR, lang, `${slug}.yaml`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as FeatureContent;
}

export function getAllFeatureSlugs(lang: 'fr' | 'en'): string[] {
  const registry = loadRegistry();
  return registry.features
    .map((f) => f.slugs[lang])
    .filter((slug) => fs.existsSync(path.join(CONTENT_DIR, lang, `${slug}.yaml`)));
}

export function findMirrorSlug(lang: 'fr' | 'en', slug: string): string {
  const registry = loadRegistry();
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const feature = registry.features.find((f) => f.slugs[lang] === slug);
  if (!feature) throw new Error(`Feature not found for slug "${slug}" in lang "${lang}"`);
  return feature.slugs[otherLang];
}

export function findFeatureId(lang: 'fr' | 'en', slug: string): string {
  const registry = loadRegistry();
  const feature = registry.features.find((f) => f.slugs[lang] === slug);
  if (!feature) throw new Error(`Feature not found for slug "${slug}" in lang "${lang}"`);
  return feature.id;
}
