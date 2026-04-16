import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Anthropic from '@anthropic-ai/sdk';
import config from './feature-config.mjs';

const REGISTRY_PATH = path.resolve('src/data/features.yaml');
const CONTENT_DIR = path.resolve('src/content/features');
const ICON_NAMES = [
  'microphone', 'document', 'clock', 'users', 'brain', 'globe',
  'building', 'flask', 'chart', 'download', 'shield', 'search',
  'zap', 'target', 'layers', 'music', 'alert', 'shuffle', 'compass', 'book',
];

function loadRegistry() {
  return yaml.load(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

function loadStyleExamples() {
  return config.styleExamples
    .map((p) => {
      const full = path.resolve(p);
      if (!fs.existsSync(full)) return null;
      return fs.readFileSync(full, 'utf-8');
    })
    .filter(Boolean);
}

function buildPrompt(featureCtx, lang, examples, relatedFeatures) {
  const isEn = lang === 'en';
  const name = isEn ? featureCtx.nameEn : featureCtx.nameFr;
  const description = isEn ? featureCtx.descriptionEn : featureCtx.descriptionFr;
  const keywords = isEn ? featureCtx.keywordsEn : featureCtx.keywordsFr;

  const styleSnippets = examples
    .map((ex, i) => `--- Style example ${i + 1} ---\n${ex.slice(0, 1500)}`)
    .join('\n\n');

  const relatedList = relatedFeatures
    .map((r) => `- slug: "${r.slug}", label: "${r.label}"`)
    .join('\n');

  return `You are an expert SEO content writer and product marketer for B2B SaaS tools.

Product: ${config.product.name} — ${config.product.description}
Product URL: ${config.product.url}
Target audiences: ${config.product.audiences.join(', ')}

Feature to write about: "${name}"
Feature description: ${description}
Target keywords: ${keywords.join(', ')}

Here are style examples from the existing site (match this tone — direct, concrete, professional but accessible, no generic AI jargon):

${styleSnippets}

Write a COMPLETE YAML file for a feature landing page in ${isEn ? 'English' : 'French'}.
${isEn ? "Write natively in English — do NOT translate from French." : "Écris nativement en français — ne traduis PAS de l'anglais."}

CRITICAL RULES:
- The H1 (hero.title) MUST contain the primary keyword. Use <br /> and <em> tags for emphasis like the existing site.
- seo.title must be max 60 characters and include "Reedly"
- seo.description must be max 155 characters
- problem.cards must have EXACTLY 3 items
- solution.steps must have EXACTLY 3 items
- benefits.cards must have 4-6 items
- use_cases.cards must have 3-4 items
- faq must have 4-6 items answering real "People Also Ask" questions
- All icon fields must use ONLY from this list: ${ICON_NAMES.join(', ')}
- NEVER invent features that Reedly doesn't have
- ${isEn ? 'hero.cta_url should be "/en#trial"' : 'hero.cta_url should be "/fr#trial"'}

Related features to link to:
${relatedList}

Output ONLY valid YAML (no markdown fences, no comments, no explanation). Start directly with "seo:".

YAML schema to fill:

seo:
  title: string
  description: string
  keywords: [string, string, string]
hero:
  eyebrow: string
  title: string
  lead: string
  cta_label: string
  cta_url: string
problem:
  eyebrow: string
  title: string
  lead: string
  cards:
    - title: string
      text: string
      icon: string
solution:
  eyebrow: string
  title: string
  lead: string
  steps:
    - title: string
      text: string
benefits:
  eyebrow: string
  title: string
  cards:
    - title: string
      text: string
      icon: string
use_cases:
  eyebrow: string
  title: string
  cards:
    - title: string
      text: string
      icon: string
faq:
  - question: string
    answer: string
related_features:
  - slug: string
    label: string`;
}

async function generateFeatureContent(featureId, lang) {
  const registry = loadRegistry();
  const feature = registry.features.find((f) => f.id === featureId);
  if (!feature) throw new Error(`Feature "${featureId}" not found in registry`);

  const featureCtx = config.featureContext[featureId];
  if (!featureCtx) throw new Error(`No context defined for feature "${featureId}" in feature-config.mjs`);

  const examples = loadStyleExamples();

  const relatedFeatures = (featureCtx.relatedIds || []).map((relId) => {
    const rel = registry.features.find((f) => f.id === relId);
    const relCtx = config.featureContext[relId];
    return {
      slug: rel.slugs[lang],
      label: lang === 'en' ? relCtx.nameEn : relCtx.nameFr,
    };
  });

  const prompt = buildPrompt(featureCtx, lang, examples, relatedFeatures);

  const client = new Anthropic();
  const response = await client.messages.create({
    model: config.generation.model,
    max_tokens: config.generation.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  let yamlText = response.content[0].text.trim();
  yamlText = yamlText.replace(/^```(?:yaml)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  const parsed = yaml.load(yamlText);
  if (!parsed?.seo || !parsed?.hero || !parsed?.problem || !parsed?.faq) {
    throw new Error(`Invalid YAML structure returned for ${featureId} (${lang})`);
  }

  const slug = feature.slugs[lang];
  const dir = path.join(CONTENT_DIR, lang);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.yaml`);
  fs.writeFileSync(filePath, yamlText, 'utf-8');

  console.log(`  ✓ ${lang.toUpperCase()} written: ${filePath}`);
  return { slug, filePath };
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');
  const langFlag = args.find((a) => a.startsWith('--lang='));
  const langs = langFlag ? [langFlag.split('=')[1]] : ['fr', 'en'];

  const registry = loadRegistry();
  let featureIds;

  if (isAll) {
    featureIds = registry.features.map((f) => f.id);
  } else {
    const id = args.find((a) => !a.startsWith('--'));
    if (!id) {
      console.error('Usage: node scripts/generate-feature.mjs <feature-id> [--lang=fr|en]');
      console.error('       node scripts/generate-feature.mjs --all');
      console.error(`\nAvailable features: ${registry.features.map((f) => f.id).join(', ')}`);
      process.exit(1);
    }
    featureIds = [id];
  }

  console.log('=== Generating feature landing page content ===\n');

  for (const featureId of featureIds) {
    console.log(`Feature: ${featureId}`);
    for (const lang of langs) {
      await generateFeatureContent(featureId, lang);
    }
    console.log();
  }

  console.log('=== Done ===');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
