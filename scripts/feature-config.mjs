export default {
  product: {
    name: 'Reedly',
    description:
      "Reedly est la première intelligence terrain du tourisme B2B. Une application mobile iOS et Android pour les commerciaux qui animent un réseau d'agences de voyage : pendant le rendez-vous, elle retranscrit la conversation en arrière-plan avec plus de 95% de précision ; le commercial peut aussi dicter son compte rendu juste après l'échange. La voix n'est ni enregistrée ni conservée : seule la retranscription sert à générer automatiquement un rapport structuré en 11 sections, en moins de 2 minutes. Le Hub web réunit ensuite les rapports de toute l'équipe et produit des synthèses par territoire et par destination pour les directions commerciales.",
    url: 'https://www.reedly.ai',
    audiences: ['commerciaux terrain B2B du tourisme', 'directeurs commerciaux', 'sales managers'],
  },

  featureContext: {
    'ai-transcription': {
      nameFr: 'Transcription IA',
      nameEn: 'AI Transcription',
      descriptionFr: "Transcription automatique de la conversation avec plus de 95% de précision. Fonctionne avec les accents, le vocabulaire métier sectoriel, et en environnement bruyant. Modèles Deepgram et Voxtral.",
      descriptionEn: 'Automatic conversation transcription with 95%+ accuracy. Works with accents, sector-specific vocabulary, and noisy environments. Deepgram and Voxtral models.',
      keywordsFr: ['transcription automatique réunion', 'transcription IA rendez-vous commercial', 'transcription vocale professionnelle'],
      keywordsEn: ['automatic meeting transcription', 'AI business meeting transcription', 'professional voice transcription'],
    },
    'manager-hub': {
      nameFr: 'Hub Manager',
      nameEn: 'Manager Hub',
      descriptionFr: "Interface web pour les directeurs commerciaux. Dashboard centralisé avec tous les rapports de l'équipe, synthèses par territoire et par destination, statistiques membres, gestion d'équipe.",
      descriptionEn: 'Web interface for sales directors. Centralized dashboard with all team reports, syntheses by territory and destination, member stats, team management.',
      keywordsFr: ['tableau de bord manager commercial', 'hub directeur commercial', 'pilotage équipe vente terrain'],
      keywordsEn: ['sales manager dashboard', 'commercial director hub', 'field sales team management'],
    },
  },

  generation: {
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 8192,
  },

  styleExamples: [
    'src/components/Hero.astro',
    'src/components/Demo.astro',
    'src/components/Hub.astro',
  ],
};
