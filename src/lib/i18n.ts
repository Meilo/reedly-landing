// Server-side i18n dictionary for shared home/pricing components (Nav, Footer,
// Hero, Demo, Hub, Compliance, BookDemo, Pricing, Faq, FinalCta).
//
// Source of truth: the FR/EN dictionaries at the top of public/main.js (`T`).
// That client-side copy stays in place for interactive scripts (booking
// calendar, pricing billing toggle, Hub composer typing animation) that read
// strings dynamically via window._reedlyT. This module mirrors the *effective*
// values (public/main.js redefines a few keys later in each dictionary; the
// later definition wins) so server-rendered HTML matches what the client
// would otherwise swap in.
export type Lang = 'fr' | 'en';

export function getLang(pathname: string): Lang {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path.startsWith('/en') ? 'en' : 'fr';
}

type Dict = Record<string, string>;

const fr: Dict = {
  'nav.pricing': 'Tarifs',
  'nav.theme': 'Thème',
  'nav.theme_light': 'Clair',
  'nav.theme_dark': 'Sombre',
  'nav.theme_system': 'Système',
  'nav.language': 'Langue',
  'nav.login': 'Se connecter',
  'nav.open_menu': 'Ouvrir le menu',
  'cta.book_demo': 'Réserver une démo',

  'footer.col.product': 'Produit',
  'footer.book_demo': 'Réserver une démo',
  'footer.pricing': 'Tarifs',
  'footer.blog': 'Blog',
  'footer.col.legal': 'Légal',
  'footer.privacy': 'Confidentialité',
  'footer.terms': 'CGU',
  'footer.contact': 'Contact',
  'footer.copy': '© {year} Reedly. Tous droits réservés.',
  'footer.stores.label': 'Pour vos commerciaux',
  'cta.store_sub': 'Disponible sur',
  'notify.title': 'Bientôt disponible',
  'notify.text':
    "L'application n'est pas encore sur les stores. Laissez votre email pour être prévenu(e) dès sa sortie.",
  'notify.placeholder': 'votre@email.com',
  'notify.cta': 'Me prévenir',

  'hero.kicker': 'La première intelligence terrain du tourisme',
  'hero.title': 'Pourquoi cette agence de voyage<br /><em>ne vous vend pas ?</em>',
  'hero.sub':
    "Reedly transforme chaque retour terrain en information immédiatement partagée avec les équipes concernées. Identifiez ce qui stimule ou freine les ventes de vos produits, et les facteurs qui influencent les choix de vos agences partenaires.",
  'hero.trust1': 'Aucune saisie pour vos commerciaux',
  'hero.trust2': 'Pensé pour le tourisme B2B',
  'hero.trust3': 'Vos données restent en Europe',

  'cta.title': 'Donnez enfin de la valeur à vos remontées terrain.',
  'cta.sub':
    'Reedly transforme les échanges clients en informations structurées pour mieux comprendre, décider et agir.',

  'demo.eyebrow': 'De la visite à vos outils',
  'demo.title': 'Parlez. Reedly structure.<br /><em>Vos équipes avancent.</em>',
  'demo.lead':
    "Votre commercial se concentre sur l'échange. Reedly transforme automatiquement chaque rendez-vous en un compte rendu clair et structuré, puis le partage directement avec vos équipes et dans vos outils.",
  'demo.label_record': 'Enregistrement en agence',
  'demo.label_report': 'Compte rendu en 2 minutes',

  'hub.eyebrow': 'Une vision à 360°',
  'hub.title':
    'Derrière chaque chiffre, il y a une raison.<br /><em>Reedly la met en lumière.</em>',
  'hub.lead':
    'Reedly rassemble et structure les retours de vos commerciaux pour vous donner une lecture claire de ce qui influence réellement vos performances.',
  'hub.benefit1.title': 'Une vision unifiée de tout le terrain',
  'hub.benefit1.text':
    'Tous les retours de vos commerciaux réunis au même endroit : attentes des agences, freins à la vente, opportunités et signaux en faveur de la concurrence.',
  'hub.benefit2.title': 'Tendances, opportunités, risques',
  'hub.benefit2.text':
    "Reedly agrège les signaux du terrain en synthèses sur la période de votre choix. Détectez les évolutions du terrain avant qu'elles ne se reflètent dans vos chiffres.",
  'hub.benefit3.title': 'Décryptez les freins à la vente',
  'hub.benefit3.text':
    "Identifiez les causes d'un ralentissement des ventes, d'un stop vente ou du désengagement d'une agence.",
  'hub.max.url': 'hub.reedly.ai/max',
  'hub.max.greeting': 'Salut Sophie !',
  'hub.max.greeting_sub': "Qu'est-ce que tu veux creuser aujourd'hui ?",
  'hub.max.intro':
    "Pose une question, ou demande-moi d'agir : je fouille les données terrain de ton équipe et je peux créer des actions, emails ou relances pour toi.",
  'hub.max.today': "Aujourd'hui",
  'hub.max.kpi_team': 'Équipe',
  'hub.max.kpi_reports': 'Comptes-rendus cette semaine',
  'hub.max.brief_label': 'Briefing matinal',
  'hub.max.brief_text': 'Opportunités et risques repérés dans les comptes-rendus d\'hier',
  'hub.max.insights_label': 'Max insights',
  'hub.max.insights_text': 'Explore les opportunités du moment',
  'hub.max.ask_col': 'Demander à Max',
  'hub.max.ask1': "Fais-moi le bilan de l'équipe cette semaine",
  'hub.max.ask2': 'Quels clients sont à risque ?',
  'hub.max.ask3': "Montre-moi les actions en retard dans l'équipe",
  'hub.max.ask4': "Quelles opportunités ressortent des récents rendez-vous ?",
  'hub.max.act_col': 'Agir avec Max',
  'hub.max.act_badge': 'Max le fait pour toi',
  'hub.max.act1': 'Rédige un email pour un client',
  'hub.max.act2': 'Crée une action de suivi',
  'hub.max.act3': 'Programme une relance',
  'hub.max.act4': "Crée une directive d'équipe",
  'hub.max.composer': 'Pourquoi le Pérou se vend moins ces deux derniers mois ?',
  'hub.max.nav.context': 'Contexte',
  'hub.max.nav.reports': 'Comptes-rendus',
  'hub.max.nav.syntheses': 'Synthèses',
  'hub.max.nav.clients': 'Clients',
  'hub.max.nav.routes': 'Tournées',
  'hub.max.nav.actions': 'Actions',
  'hub.max.nav.directives': 'Directives',

  'compliance.eyebrow': 'Conformité & sécurité',
  'compliance.title': 'Transcrire le terrain,<br /><em>en toute conformité.</em>',
  'compliance.lead':
    'Vos commerciaux transcrivent de vraies conversations client. Voici les garanties qui encadrent chaque rendez-vous, du consentement à la suppression.',
  'compliance.panel': 'Conformité RGPD',
  'compliance.item1': "Données hébergées dans l'UE",
  'compliance.item2': 'DPA disponible sur demande',
  'compliance.item3': 'Liste des sous-traitants publiée',
  'compliance.item4': 'Chiffrement au repos et en transit',
  'compliance.item5': 'Suppression sur demande sous 30 jours',
  'compliance.item6': 'Consentement des participants intégré au parcours',

  'bookdemo.eyebrow': 'Réserver une démo',
  'bookdemo.title': '15 minutes pour voir<br /><em>Reedly en action.</em>',
  'bookdemo.lead':
    'Une démonstration adaptée à votre équipe, votre organisation et vos enjeux terrain.',
  'bookdemo.intro':
    "Découvrez concrètement comment Reedly peut simplifier les comptes rendus, centraliser les remontées terrain et donner à vos managers une vision plus claire de l'activité commerciale.",
  'bookdemo.role.label': 'Votre poste',
  'bookdemo.role.select': 'Choisir…',
  'bookdemo.role.director': 'Directeur / Responsable commercial',
  'bookdemo.role.owner': 'Dirigeant / Gérant',
  'bookdemo.role.rep': 'Commercial terrain',
  'bookdemo.role.other': 'Autre',
  'bookdemo.team.label': "Taille de l'équipe commerciale",
  'bookdemo.team.select': 'Choisir…',
  'bookdemo.team.1': '1 commercial',
  'bookdemo.team.2_5': '2 à 5',
  'bookdemo.team.6_15': '6 à 15',
  'bookdemo.team.16': '16+',
  'bookdemo.sector.label': 'Secteur',
  'bookdemo.sector.select': 'Choisir…',
  'bookdemo.sector.to': 'Tour-opérateur / Voyagiste',
  'bookdemo.sector.agency': 'Agence de voyages',
  'bookdemo.sector.dmc': 'Réceptif / DMC',
  'bookdemo.sector.mice': 'MICE & événementiel',
  'bookdemo.sector.transport': 'Transport & mobilité',
  'bookdemo.sector.cruise': 'Croisière',
  'bookdemo.sector.hospitality': 'Hôtellerie & hébergement',
  'bookdemo.sector.leisure': 'Loisirs & billetterie',
  'bookdemo.sector.other': 'Autre secteur',
  'bookdemo.email.label': 'Email professionnel',
  'bookdemo.email.ph': 'vous@votre-organisation.fr',
  'bookdemo.submit': 'Voir les créneaux disponibles →',
  'bookdemo.hint': 'Aucune carte bancaire · réponse sous 24h',
  'bookdemo.cal.pickday': 'Choisissez un jour',
  'bookdemo.cal.pickslot': 'Choisissez un créneau',
  'bookdemo.cal.tznote': 'Créneaux affichés dans votre fuseau horaire.',
  'bookdemo.cal.loading': 'Chargement des disponibilités…',
  'bookdemo.cal.name': 'Votre nom',
  'bookdemo.cal.note': 'Un mot sur votre besoin',
  'bookdemo.cal.confirm': 'Confirmer le rendez-vous',
  'bookdemo.cal.back_form': '← Retour',
  'bookdemo.cal.success_title': "C'est réservé.",
  'bookdemo.cal.success_body':
    'Une invitation Google Agenda avec le lien Meet vient de partir sur votre email.',
  'bookdemo.cal.meet': 'Ouvrir le lien Google Meet',

  'pricing.eyebrow': 'Tarifs',
  'pricing.title': 'Un prix par commercial.<br /><em>Zéro surprise.</em>',
  'pricing.lead':
    "Facturé à votre organisation, à la taille réelle de l'équipe qui anime votre réseau d'agences.",
  'pricing.billing.monthly': 'Mensuel',
  'pricing.billing.annual': 'Annuel (-14%)',
  'pricing.billing.note.monthly':
    'Prix affichés par mois. Facturation annuelle disponible avec 14 % de réduction.',
  'pricing.billing.aria': 'Facturation',
  'pricing.note': 'Sans engagement · résiliable à tout moment',
  'pricing.team.badge': 'Le plus choisi',
  'pricing.team.plan': 'Équipe',
  'pricing.team.subtitle': 'À partir de 3 commerciaux',
  'pricing.team.per': '/ commercial / mois',
  'pricing.team.feat1': 'Application iOS et Android',
  'pricing.team.feat2': 'Comptes rendus IA illimités',
  'pricing.team.feat3': 'Synthèses stratégiques périodiques',
  'pricing.team.feat4': 'Hub manager · vision 360° de l\'équipe',
  'pricing.team.feat5': 'Identification des interlocuteurs',
  'pricing.team.feat6': 'Fiches agences auto-enrichies',
  'pricing.team.feat7': "Analyse IA transversale de l'équipe",
  'pricing.team.feat8': 'Connecteurs CRM connus',
  'pricing.team.feat9': 'Assistant IA (Max)',
  'pricing.team.feat10': 'Support prioritaire',
  'pricing.book_demo': 'Réserver une démo →',
  'pricing.large.plan': 'Entreprise',
  'pricing.large.subtitle': '16+ commerciaux',
  'pricing.large.price': 'Sur devis',
  'pricing.large.feat1': 'Tout le plan Équipe',
  'pricing.large.feat2': 'Vocabulaire métier sur mesure',
  'pricing.large.feat3': 'Multi-équipes / multi-secteurs',
  'pricing.large.feat4': 'Account manager dédié',
  'pricing.large.feat5': 'Formation & onboarding sur site',
  'pricing.contact_us': 'Nous contacter →',

  'faq.eyebrow': 'FAQ',
  'faq.title': 'Questions fréquentes.',
  'faq.q1': 'À quels métiers du tourisme Reedly s\'adresse-t-il ?',
  'faq.a1':
    "Aux tour-opérateurs, voyagistes et réceptifs dont les commerciaux animent un réseau d'agences de voyage. Et aux directions commerciales qui veulent savoir, agence par agence, ce qui se dit vraiment sur le terrain, sans multiplier les réunions de reporting.",
  'faq.q2': "L'app fonctionne-t-elle hors connexion ?",
  'faq.a2':
    "Oui. Votre commercial mène son rendez-vous sans réseau, en agence comme sur la route : l'app tient hors ligne. La transcription et le compte rendu, eux, font appel à nos modèles IA et ont besoin d'une connexion. Ils se génèrent automatiquement dès que le réseau revient.",
  'faq.q3': 'En combien de temps le compte rendu est-il prêt ?',
  'faq.a3':
    "Moins de 2 minutes après une visite d'une heure. Votre commercial repart de l'agence avec un compte rendu déjà structuré en 11 sections, avant même de reprendre la route vers le point de vente suivant.",
  'faq.q4': 'Les données audio sont-elles conservées ?',
  'faq.a4':
    "Non, jamais. La voix n'est ni enregistrée ni conservée : elle sert uniquement à produire la retranscription, à partir de laquelle le compte rendu est généré. Seul le rapport structuré reste dans votre espace Reedly. C'est un principe non négociable : privacy by design.",
  'faq.q5': "Qu'est-ce que le Hub et qui l'utilise ?",
  'faq.a5':
    "Le Hub est l'interface web réservée aux managers et aux directions commerciales. Il réunit tous les comptes rendus de vos commerciaux, les synthèses par destination ou par région, et l'activité de chaque membre du réseau. Les commerciaux n'utilisent que l'app mobile ; le Hub est votre poste de pilotage. Il est inclus dans le plan Équipe.",
  'faq.q6': 'La transcription tient-elle dans un environnement bruyant ?',
  'faq.a6':
    "Oui. Reedly s'appuie sur des modèles entraînés sur des conditions réelles : accueil d'agence animé, comptoir, plusieurs voix en même temps. C'est pensé pour une visite en agence, pas pour un bureau silencieux.",

  'about.eyebrow': "Qu'est-ce que Reedly ?",
  'about.title': 'Le compte rendu<br /><em>ne devrait plus être une tâche.</em>',
  'about.text1':
    "Reedly est une application mobile iOS et Android conçue pour les commerciaux terrain B2B. Pendant le rendez-vous, Reedly retranscrit la conversation. Après l'échange, le commercial peut compléter son compte rendu en dictant simplement les informations essentielles.",
  'about.text2':
    "À partir de cette retranscription, Reedly génère automatiquement un rapport commercial structuré en 11 rubriques : résumé exécutif, profil client, besoins, objections, engagements, prochaines étapes, opportunités, risques, recommandations et autres informations clés du rendez-vous. Le compte rendu est disponible en moins de deux minutes.",
  'about.text3':
    "La voix n'est ni enregistrée ni conservée : seule la retranscription est utilisée pour générer le compte rendu.",
  'about.text4':
    "Les rapports de toute l'équipe sont ensuite centralisés dans le Hub Reedly, l'interface web dédiée aux managers commerciaux. Ils disposent ainsi d'une vision consolidée du terrain, de synthèses par territoire et d'un suivi de l'activité commerciale, semaine après semaine.",
};

const en: Dict = {
  'nav.pricing': 'Pricing',
  'nav.theme': 'Theme',
  'nav.theme_light': 'Light',
  'nav.theme_dark': 'Dark',
  'nav.theme_system': 'System',
  'nav.language': 'Language',
  'nav.login': 'Log in',
  'nav.open_menu': 'Open menu',
  'cta.book_demo': 'Book a demo',

  'footer.col.product': 'Product',
  'footer.book_demo': 'Book a demo',
  'footer.pricing': 'Pricing',
  'footer.blog': 'Blog',
  'footer.col.legal': 'Legal',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.contact': 'Contact',
  'footer.copy': '© {year} Reedly. All rights reserved.',
  'footer.stores.label': 'For your reps',
  'cta.store_sub': 'Available on',
  'notify.title': 'Coming soon',
  'notify.text':
    "The app isn't on the stores yet. Leave your email to be notified as soon as it launches.",
  'notify.placeholder': 'your@email.com',
  'notify.cta': 'Notify me',

  'hero.kicker': 'The first field intelligence in tourism',
  'hero.title': "Why isn't this travel agency<br /><em>selling you?</em>",
  'hero.sub':
    "Reedly turns every field report into information that's instantly shared with the relevant teams. Identify what drives or holds back your product sales, and the factors that shape your partner agencies' choices.",
  'hero.trust1': 'No data entry for your reps',
  'hero.trust2': 'Built for tourism B2B',
  'hero.trust3': 'Your data stays in Europe',

  'cta.title': 'Finally get real value from your field feedback.',
  'cta.sub':
    'Reedly turns client conversations into structured information, so you can understand, decide and act.',

  'demo.eyebrow': 'From the visit to your tools',
  'demo.title': 'You talk. Reedly structures.<br /><em>Your teams move forward.</em>',
  'demo.lead':
    'Your rep stays focused on the conversation. Reedly automatically turns every meeting into a clear, structured report, then shares it straight with your teams and inside your tools.',
  'demo.label_record': 'Recording in the agency',
  'demo.label_report': 'Report in 2 minutes',

  'hub.eyebrow': 'A 360° view',
  'hub.title': "Behind every number, there's a reason.<br /><em>Reedly brings it to light.</em>",
  'hub.lead':
    "Reedly gathers and structures your reps' field feedback to give you a clear read on what really drives your performance.",
  'hub.benefit1.title': 'A unified view of the whole field',
  'hub.benefit1.text':
    "Every rep's field feedback in one place: what agencies expect, what blocks sales, opportunities, and signals favoring the competition.",
  'hub.benefit2.title': 'Trends, opportunities, risks',
  'hub.benefit2.text':
    'Reedly aggregates field signals into syntheses over any period. Spot shifts in the field before they show up in your numbers.',
  'hub.benefit3.title': 'Decode what is blocking sales',
  'hub.benefit3.text':
    'Identify what is behind a sales slowdown, a stop-sale, or an agency disengaging.',
  'hub.max.url': 'hub.reedly.ai/max',
  'hub.max.greeting': 'Hi Sophie!',
  'hub.max.greeting_sub': 'What do you want to dig into today?',
  'hub.max.intro':
    "Ask a question, or tell me to act: I dig through your team's field data and I can create actions, emails or follow-ups for you.",
  'hub.max.today': 'Today',
  'hub.max.kpi_team': 'Team',
  'hub.max.kpi_reports': 'Reports this week',
  'hub.max.brief_label': 'Morning briefing',
  'hub.max.brief_text': "Opportunities and risks spotted in yesterday's reports",
  'hub.max.insights_label': 'Max insights',
  'hub.max.insights_text': 'Explore the opportunities of the moment',
  'hub.max.ask_col': 'Ask Max',
  'hub.max.ask1': "Give me the team's recap this week",
  'hub.max.ask2': 'Which clients are at risk?',
  'hub.max.ask3': "Show me the team's overdue actions",
  'hub.max.ask4': 'What opportunities are emerging from recent meetings?',
  'hub.max.act_col': 'Act with Max',
  'hub.max.act_badge': 'Max does it for you',
  'hub.max.act1': 'Draft an email for a client',
  'hub.max.act2': 'Create a follow-up action',
  'hub.max.act3': 'Schedule a follow-up',
  'hub.max.act4': 'Create a team directive',
  'hub.max.composer': 'Why is Peru selling less over the past two months?',
  'hub.max.nav.context': 'Context',
  'hub.max.nav.reports': 'Reports',
  'hub.max.nav.syntheses': 'Syntheses',
  'hub.max.nav.clients': 'Clients',
  'hub.max.nav.routes': 'Territories',
  'hub.max.nav.actions': 'Actions',
  'hub.max.nav.directives': 'Directives',

  'compliance.eyebrow': 'Compliance & security',
  'compliance.title': 'Transcribe the field,<br /><em>fully compliant.</em>',
  'compliance.lead':
    'Your reps transcribe real client conversations. Here are the guarantees around every meeting, from consent to deletion.',
  'compliance.panel': 'GDPR compliance',
  'compliance.item1': 'Data hosted in the EU',
  'compliance.item2': 'DPA available on request',
  'compliance.item3': 'Subprocessor list published',
  'compliance.item4': 'Encryption at rest and in transit',
  'compliance.item5': 'Deletion on request within 30 days',
  'compliance.item6': 'Participant consent built into the flow',

  'bookdemo.eyebrow': 'Book a demo',
  'bookdemo.title': '15 minutes to see<br /><em>Reedly in action.</em>',
  'bookdemo.lead':
    'A demo tailored to your team, your organization and your field challenges.',
  'bookdemo.intro':
    'See exactly how Reedly can simplify meeting reports, centralize field feedback and give your managers a clearer view of sales activity.',
  'bookdemo.role.label': 'Your role',
  'bookdemo.role.select': 'Choose…',
  'bookdemo.role.director': 'Sales director / manager',
  'bookdemo.role.owner': 'Owner / CEO',
  'bookdemo.role.rep': 'Field sales rep',
  'bookdemo.role.other': 'Other',
  'bookdemo.team.label': 'Sales team size',
  'bookdemo.team.select': 'Choose…',
  'bookdemo.team.1': '1 rep',
  'bookdemo.team.2_5': '2 to 5',
  'bookdemo.team.6_15': '6 to 15',
  'bookdemo.team.16': '16+',
  'bookdemo.sector.label': 'Industry',
  'bookdemo.sector.select': 'Select…',
  'bookdemo.sector.to': 'Tour operator',
  'bookdemo.sector.agency': 'Travel agency',
  'bookdemo.sector.dmc': 'DMC / Inbound',
  'bookdemo.sector.mice': 'MICE & events',
  'bookdemo.sector.transport': 'Transport & mobility',
  'bookdemo.sector.cruise': 'Cruise',
  'bookdemo.sector.hospitality': 'Hospitality & lodging',
  'bookdemo.sector.leisure': 'Leisure & ticketing',
  'bookdemo.sector.other': 'Other sector',
  'bookdemo.email.label': 'Work email',
  'bookdemo.email.ph': 'you@your-organization.com',
  'bookdemo.submit': 'See available slots →',
  'bookdemo.hint': 'No credit card · reply within 24h',
  'bookdemo.cal.pickday': 'Pick a day',
  'bookdemo.cal.pickslot': 'Pick a time',
  'bookdemo.cal.tznote': 'Times shown in your timezone.',
  'bookdemo.cal.loading': 'Loading availability…',
  'bookdemo.cal.name': 'Your name',
  'bookdemo.cal.note': 'A word about your need',
  'bookdemo.cal.confirm': 'Confirm the meeting',
  'bookdemo.cal.back_form': '← Back',
  'bookdemo.cal.success_title': "You're booked.",
  'bookdemo.cal.success_body':
    'A Google Calendar invite with the Meet link is on its way to your email.',
  'bookdemo.cal.meet': 'Open the Google Meet link',

  'pricing.eyebrow': 'Pricing',
  'pricing.title': 'One price per rep.<br /><em>Zero surprises.</em>',
  'pricing.lead':
    'Billed to your organization, at the real size of the team that runs your agency network.',
  'pricing.billing.monthly': 'Monthly',
  'pricing.billing.annual': 'Yearly (-14%)',
  'pricing.billing.note.monthly':
    'Prices are displayed per month. Yearly billing is available with a 14% discount.',
  'pricing.billing.aria': 'Billing',
  'pricing.note': 'No commitment · cancel anytime',
  'pricing.team.badge': 'Most chosen',
  'pricing.team.plan': 'Team',
  'pricing.team.subtitle': 'From 3 reps',
  'pricing.team.per': '/ rep / month',
  'pricing.team.feat1': 'iOS & Android app',
  'pricing.team.feat2': 'Unlimited AI reports',
  'pricing.team.feat3': 'Periodic strategic syntheses',
  'pricing.team.feat4': 'Manager Hub · 360° team view',
  'pricing.team.feat5': 'Speaker identification',
  'pricing.team.feat6': 'Auto-enriched agency records',
  'pricing.team.feat7': 'Cross-team AI analysis',
  'pricing.team.feat8': 'Connectors to major CRMs',
  'pricing.team.feat9': 'AI assistant (Max)',
  'pricing.team.feat10': 'Priority support',
  'pricing.book_demo': 'Book a demo →',
  'pricing.large.plan': 'Enterprise',
  'pricing.large.subtitle': '16+ reps',
  'pricing.large.price': 'Custom quote',
  'pricing.large.feat1': 'Everything in Team',
  'pricing.large.feat2': 'Custom business vocabulary',
  'pricing.large.feat3': 'Multi-team / multi-sector',
  'pricing.large.feat4': 'Dedicated account manager',
  'pricing.large.feat5': 'On-site training & onboarding',
  'pricing.contact_us': 'Contact us →',

  'faq.eyebrow': 'FAQ',
  'faq.title': 'Frequently asked questions.',
  'faq.q1': 'Which tourism businesses is Reedly for?',
  'faq.a1':
    "For tour operators, wholesalers and DMCs whose reps manage a network of travel agencies. And for sales leadership who want to know, agency by agency, what's really being said in the field, without piling on reporting meetings.",
  'faq.q2': 'Does the app work offline?',
  'faq.a2':
    "Yes. Your rep runs the meeting with no network, in the agency or on the road: the app holds offline. Transcription and the report do call our AI models, so they need a connection. Both generate automatically as soon as the network is back.",
  'faq.q3': 'How fast is the report ready?',
  'faq.a3':
    'Under 2 minutes after a one-hour visit. Your rep leaves the agency with a report already structured into 11 sections, before even driving to the next point of sale.',
  'faq.q4': 'Is audio data retained?',
  'faq.a4':
    "No, never. The voice is neither recorded nor stored: it only serves to produce the transcript, from which the report is generated. Only the structured report stays in your Reedly space. This is a non-negotiable principle: privacy by design.",
  'faq.q5': 'What is the Hub and who uses it?',
  'faq.a5':
    "The Hub is the web interface reserved for managers and sales leadership. It brings together every rep's reports, syntheses by destination or region, and each network member's activity. Reps use only the mobile app; the Hub is your control center. It's included in the Team plan.",
  'faq.q6': 'Does transcription hold up in a noisy environment?',
  'faq.a6':
    "Yes. Reedly relies on models trained on real-world conditions: a busy agency front desk, a counter, several voices at once. It's built for an agency visit, not a quiet office.",

  'about.eyebrow': 'What is Reedly?',
  'about.title': 'Writing the report<br /><em>should no longer be a chore.</em>',
  'about.text1':
    'Reedly is an iOS and Android mobile app built for B2B field sales reps. During the meeting, Reedly transcribes the conversation. Afterwards, the rep can complete the report by simply dictating the essential information.',
  'about.text2':
    'From that transcript, Reedly automatically generates a sales report structured into 11 sections: executive summary, client profile, needs, objections, commitments, next steps, opportunities, risks, recommendations and other key information from the meeting. The report is available in under two minutes.',
  'about.text3':
    'The voice is neither recorded nor stored: only the transcript is used to generate the report.',
  'about.text4':
    "The whole team's reports are then centralized in the Reedly Hub, the web interface dedicated to sales managers. They get a consolidated view of the field, syntheses by territory, and sales activity tracking, week after week.",
};

export const dict: Record<Lang, Dict> = { fr, en };

export function t(lang: Lang, key: string): string {
  return dict[lang][key] ?? dict.fr[key] ?? key;
}
