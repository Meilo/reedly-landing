import { generateTopic } from './generate-topic.mjs';
import { generateArticle } from './generate-article.mjs';

async function main() {
  console.log('=== Génération automatique d\'article de blog ===\n');

  console.log('1. Génération du sujet...');
  const topic = await generateTopic();
  console.log(`   Sujet : ${topic.titleFr}`);
  console.log(`   Thème : ${topic.theme}`);
  console.log(`   Auteur : ${topic.author}\n`);

  console.log('2. Rédaction des articles FR + EN...');
  const results = await generateArticle(topic);
  console.log();

  console.log('=== Terminé ===');
  console.log(`   FR : src/content/blog/${results.fr.slug}.md (${results.fr.charCount} car.)`);
  console.log(`   EN : src/content/blog/${results.en.slug}.md (${results.en.charCount} car.)`);
}

main().catch((err) => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
