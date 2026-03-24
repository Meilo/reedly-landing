import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import config from './blog-config.mjs';

const BLOG_DIR = path.resolve('src/content/blog');

function loadStyleExamples() {
  return config.styleExamples
    .map((p) => {
      const full = path.resolve(p);
      if (!fs.existsSync(full)) return null;
      return fs.readFileSync(full, 'utf-8');
    })
    .filter(Boolean);
}

function buildPrompt(topic, lang, examples) {
  const isEn = lang === 'en';
  const title = isEn ? topic.titleEn : topic.titleFr;
  const description = isEn ? topic.descriptionEn : topic.descriptionFr;
  const keywords = isEn ? topic.keywordsEn : topic.keywordsFr;
  const slug = isEn ? topic.slugEn : topic.slugFr;
  const mirror = isEn ? topic.slugFr : topic.slugEn;
  const today = new Date().toISOString().split('T')[0];
  const readingTime = 5;

  const frontmatter = `---
title: "${title}"
description: "${description}"
date: ${today}
lang: ${lang}
mirror: ${mirror}
keywords: [${keywords.map((k) => `"${k}"`).join(', ')}]
readingTime: ${readingTime}
author: ${topic.author}
---`;

  const styleSnippets = examples
    .map((ex, i) => `--- Exemple ${i + 1} ---\n${ex.slice(0, 2000)}`)
    .join('\n\n');

  return {
    frontmatter,
    userPrompt: `Tu es un rédacteur expert pour un blog destiné aux ${config.niche.domain}.
Produit : ${config.niche.product}

Voici des exemples d'articles existants pour t'imprégner du STYLE (ton direct, anecdotes terrain, chiffres concrets, vécu) :

${styleSnippets}

Rédige un article de blog en ${isEn ? 'anglais' : 'français'} sur le sujet suivant :
Titre : "${title}"
Description : "${description}"
Mots-clés à intégrer naturellement : ${keywords.join(', ')}

Contraintes :
- Entre ${config.generation.charCount.min} et ${config.generation.charCount.max} caractères (corps uniquement, sans le frontmatter)
- Style : direct, concret, anecdotes terrain, pas de jargon IA générique
- Structure : intro accrocheuse, 2-4 sous-titres (##), conclusion avec ouverture
- ${isEn ? "Write natively in English, don't translate from French" : "Écris nativement en français, pas de traduction"}
- Ne mentionne PAS Reedly directement dans le corps de l'article (le CTA est géré séparément)

Réponds UNIQUEMENT avec le corps Markdown de l'article (sans frontmatter, sans blocs de code). Commence directement par le premier paragraphe.`,
  };
}

export async function generateArticle(topic) {
  const examples = loadStyleExamples();
  const client = new Anthropic();
  const results = {};

  for (const lang of ['fr', 'en']) {
    const { frontmatter, userPrompt } = buildPrompt(topic, lang, examples);

    const response = await client.messages.create({
      model: config.generation.model,
      max_tokens: config.generation.maxTokens,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const body = response.content[0].text.trim();
    const slug = lang === 'en' ? topic.slugEn : topic.slugFr;
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    const fullContent = `${frontmatter}\n\n${body}\n`;

    fs.writeFileSync(filePath, fullContent, 'utf-8');
    console.log(`Article ${lang.toUpperCase()} écrit : ${filePath} (${body.length} caractères)`);

    results[lang] = { slug, filePath, charCount: body.length };
  }

  return results;
}
