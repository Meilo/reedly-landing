import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import config from './blog-config.mjs';

const BLOG_DIR = path.resolve('src/content/blog');

function getExistingArticles() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  const articles = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;

    const frontmatter = match[1];
    const title = frontmatter.match(/title:\s*"(.+)"/)?.[1] ?? '';
    const slug = file.replace('.md', '');
    articles.push({ slug, title });
  }

  return articles;
}

export async function generateTopic() {
  const existing = getExistingArticles();
  const existingTitles = existing.map((a) => `- ${a.title}`).join('\n');
  const existingSlugs = existing.map((a) => a.slug);

  const themesStr = config.niche.themes
    .map((t) => `- "${t.topic}" (auteur: ${t.author})`)
    .join('\n');

  const client = new Anthropic();

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await client.messages.create({
      model: config.generation.model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Tu es un stratège de contenu SEO pour "${config.niche.product}".

Domaine : ${config.niche.domain}
Audiences cibles : ${config.niche.audiences.join(', ')}

Thèmes disponibles (chaque thème a un auteur assigné) :
${themesStr}

Articles déjà publiés (NE PAS proposer un sujet similaire) :
${existingTitles}

Propose UN SEUL nouveau sujet d'article de blog. Le sujet doit :
- Être pertinent pour l'audience cible
- Ne pas dupliquer un article existant
- Avoir un angle concret et actionnable (pas de généralités)
- Viser un mot-clé longue traîne recherché par des commerciaux terrain

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de commentaire) :
{
  "theme": "le thème choisi parmi la liste",
  "author": "l'auteur associé au thème (laura ou ludovic)",
  "titleFr": "Titre en français (accrocheur, max 70 caractères)",
  "titleEn": "Title in English (engaging, max 70 chars)",
  "slugFr": "slug-en-francais-sans-accents",
  "slugEn": "slug-in-english",
  "descriptionFr": "Meta description FR (max 155 caractères)",
  "descriptionEn": "Meta description EN (max 155 chars)",
  "keywordsFr": ["mot clé 1", "mot clé 2", "mot clé 3"],
  "keywordsEn": ["keyword 1", "keyword 2", "keyword 3"]
}`,
        },
      ],
    });

    let text = response.content[0].text.trim();
    // Nettoyer les blocs markdown ```json ... ``` si présents
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    const topic = JSON.parse(text);

    // Vérification anti-doublon par slug
    if (
      existingSlugs.includes(topic.slugFr) ||
      existingSlugs.includes(topic.slugEn)
    ) {
      console.log(`Slug en doublon, tentative ${attempt + 1}/3...`);
      continue;
    }

    return topic;
  }

  throw new Error('Impossible de générer un sujet unique après 3 tentatives');
}
