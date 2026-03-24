export default {
  niche: {
    domain: 'commerciaux terrain B2B',
    product:
      'Reedly — app qui enregistre les RDV terrain et génère des comptes-rendus automatiques par IA',
    audiences: [
      'commerciaux terrain',
      'directeurs commerciaux',
      'sales managers B2B',
    ],
    themes: [
      // Thèmes terrain/commercial → Laura
      { topic: 'productivité commerciale terrain', author: 'laura' },
      { topic: 'comptes-rendus et rapports de visite', author: 'laura' },
      { topic: 'coaching commercial', author: 'laura' },
      { topic: 'organisation des tournées', author: 'laura' },
      { topic: 'négociation terrain', author: 'laura' },
      { topic: 'CRM et suivi client', author: 'laura' },
      // Thèmes tech/outils → Ludovic
      { topic: 'IA pour la vente B2B', author: 'ludovic' },
      { topic: 'outils pour forces de vente', author: 'ludovic' },
      { topic: 'automatisation et intégrations CRM', author: 'ludovic' },
      { topic: 'analyse de données commerciales', author: 'ludovic' },
    ],
  },

  generation: {
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 4096,
    charCount: { min: 800, max: 1500 },
  },

  styleExamples: [
    'src/content/blog/compte-rendu-reunion-client-automatique.md',
    'src/content/blog/rapport-visite-client-automatise-ia.md',
  ],
};
