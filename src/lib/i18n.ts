// Server-side i18n dictionary — the single source of copy for every shared
// component (Nav, Footer, Hero, Demo, Hub, Compliance, Pricing, Testimonials,
// BookDemo, Faq, FinalCta). public/main.js renders no text of its own; the one
// script that needs strings at runtime (the booking flow) receives them through
// a JSON island rendered from here.
export type Lang = 'fr' | 'en';

export function getLang(pathname: string): Lang {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path.startsWith('/en') ? 'en' : 'fr';
}

type Dict = Record<string, string>;

const fr: Dict = {
  'nav.language': 'Langue',
  'nav.login': 'Se connecter',
  'cta.book_demo': 'Réserver une démo',

  'footer.col.product': 'Produit',
  'footer.book_demo': 'Réserver une démo',
  'footer.pricing': 'Tarifs',
  'footer.terms': 'CGU',
  'cta.store_sub': 'Disponible sur',

  'hero.title':
    'Moins de saisie, plus de rendez-vous.<br /><em>Vos commerciaux enfin à 100&nbsp;% sur le terrain.</em>',
  'hero.sub':
    "Reedly transforme chaque retour terrain en information immédiatement partagée avec les équipes concernées. Identifiez ce qui stimule ou freine les ventes de vos produits, et les facteurs qui influencent les choix de vos agences partenaires.",

  'demo.title': 'Parlez. Reedly structure.<br /><em>Vos équipes avancent.</em>',
  'demo.lead':
    "Votre commercial se concentre sur l'échange. Reedly transforme automatiquement chaque rendez-vous en <b>un compte rendu clair et structuré</b>, puis le partage directement avec vos équipes et <b>dans vos outils</b>.",
  'demo.label_record': 'Transcription pendant ou après le RDV',
  'demo.label_report': 'Compte rendu en 2 minutes',

  'hub.title':
    'Derrière chaque chiffre, il y a une raison.<br /><em>Reedly la met en lumière.</em>',
  'hub.lead':
    'Reedly <b>rassemble et structure les retours de vos commerciaux</b> pour vous donner une lecture claire de ce qui influence réellement <b>vos performances.</b>',
  'hub.benefit1.title': 'Une vision unifiée de tout le terrain',
  'hub.benefit1.text':
    'Tous les retours de vos commerciaux réunis au même endroit : <b>attentes des agences, freins à la vente, opportunités et signaux en faveur de la concurrence.</b>',
  'hub.benefit2.title': 'Tendances, opportunités, risques',
  'hub.benefit2.text':
    "Reedly agrège les signaux du terrain en synthèses sur la période de votre choix. <b>Détectez les évolutions du terrain</b> avant qu'elles ne se reflètent dans vos chiffres.",
  'hub.benefit3.title': 'Décryptez les freins à la vente',
  'hub.benefit3.text':
    "<b>Identifiez</b> les causes d'un ralentissement des ventes, d'un stop vente ou du<b> désengagement d'une agence.</b>",
  'hub.max.url': 'hub.reedly.ai/max',
  'hub.max.greeting': 'Salut !',
  'hub.max.greeting_sub': "Qu'est-ce que tu veux creuser aujourd'hui ?",
  'hub.max.intro':
    "Pose une question, ou demande-moi d'agir : je fouille les données terrain de ton équipe et je peux créer des actions, emails ou relances pour toi.",
  'hub.max.kpi_team': 'Équipe',
  'hub.max.kpi_reports': 'Comptes-rendus cette semaine',
  'hub.max.brief_label': 'Briefing matinal',
  'hub.max.brief_text': 'Opportunités et risques repérés dans les comptes-rendus d\'hier',
  'hub.max.insights_label': 'Max insights',
  'hub.max.insights_text': 'Explore les opportunités du moment',
  'hub.max.composer': 'Pourquoi le Pérou se vend moins ces deux derniers mois ?',

  'compliance.title': 'Transcrire le terrain,<br /><em>en toute conformité.</em>',
  'compliance.lead':
    'Vos commerciaux transcrivent de vraies conversations client. Voici les garanties qui encadrent chaque rendez-vous, du consentement à la suppression.',
  'compliance.item1': "Données hébergées dans l'UE",
  'compliance.item2': 'DPA disponible sur demande',
  'compliance.item3': 'Liste des sous-traitants publiée',
  'compliance.item4': 'Chiffrement au repos et en transit',
  'compliance.item5': 'Suppression sur demande sous 30 jours',
  'compliance.item6': 'Consentement des participants intégré au parcours',

  'bookdemo.title': '15 minutes pour voir<br /><em>Reedly en action.</em>',
  'bookdemo.lead':
    'Une démonstration adaptée à votre équipe, votre organisation et vos enjeux terrain.',
  'bookdemo.role.label': 'Rôle',
  'bookdemo.role.select': 'Choisir…',
  'bookdemo.role.director': 'Directeur / Responsable commercial',
  'bookdemo.role.owner': 'Dirigeant / Gérant',
  'bookdemo.role.rep': 'Commercial terrain',
  'bookdemo.role.other': 'Autre',
  'bookdemo.team.label': "Taille de l'équipe",
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
  'bookdemo.email.label': 'Email',
  'bookdemo.email.ph': 'vous@votre-organisation.fr',
  'bookdemo.submit': 'Voir les créneaux disponibles',
  'bookdemo.cal.pickday': 'Choisissez un jour',
  'bookdemo.cal.pickslot': 'Choisissez un créneau',
  'bookdemo.cal.tznote': 'Créneaux affichés dans votre fuseau horaire.',
  'bookdemo.cal.loading': 'Chargement des disponibilités…',
  'bookdemo.cal.name': 'Votre nom',
  'bookdemo.cal.note': 'Un mot sur votre besoin',
  'bookdemo.cal.confirm': 'Confirmer le rendez-vous',
  'bookdemo.cal.back_form': '← Retour',
  'bookdemo.cal.back': '← Changer de créneau',
  'bookdemo.cal.empty': "Aucun créneau disponible pour l'instant. Écrivez-nous et on cale ça.",
  'bookdemo.cal.error': 'Impossible de charger les créneaux. Réessayez dans un instant.',
  'bookdemo.cal.booking': 'Confirmation en cours…',
  'bookdemo.cal.slot_taken': "Ce créneau vient d'être pris. Choisissez-en un autre.",
  'bookdemo.cal.success_title': "C'est réservé.",
  'bookdemo.cal.success_body':
    'Une invitation Google Agenda avec le lien Meet vient de partir sur votre email.',
  'bookdemo.cal.meet': 'Ouvrir le lien Google Meet',

  'pricing.title': 'Un prix par commercial.<br /><em>Zéro surprise.</em>',
  'pricing.lead':
    "Facturé à votre organisation, à la taille réelle de l'équipe qui anime votre réseau d'agences.",
  'pricing.billing.monthly': 'Mensuel',
  'pricing.billing.annual': 'Annuel (-14%)',
  'pricing.billing.aria': 'Facturation',
  'pricing.team.badge': 'Le plus populaire',
  'pricing.team.plan': 'Team',
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
  'pricing.large.plan': 'ENTREPRISE',
  'pricing.large.subtitle': '16+ commerciaux',
  'pricing.large.price': 'Sur devis',
  'pricing.large.feat1': 'Tout le plan Équipe',
  'pricing.large.feat2': 'Vocabulaire métier sur mesure',
  'pricing.large.feat3': 'Multi-équipes / multi-secteurs',
  'pricing.large.feat4': 'Account manager dédié',
  'pricing.large.feat5': 'Formation & onboarding sur site',
  'pricing.contact_us': 'Nous contacter',

  'faq.title': 'Toutes vos questions. <em>Répondues.</em>',
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

  // ── V2 landing: sections added by the design refresh ──
  'cta.try_free': 'Essayer gratuitement',

  'tm.title': 'Avec REEDLY,<br /><em>Leur quotidien est simplifié.</em>',
  'tm.prev': 'Témoignage précédent',
  'tm.next': 'Témoignage suivant',
  'tm.q1':
    "Reedly, c'est un outil pensé pour les commerciaux terrain : simple, puissant et vraiment adapté à nos besoins.",
  'tm.n1': 'Maryam B.',
  'tm.r1': 'Fondatrice',
  'tm.q2':
    "J'adore ! Je trouve ça stupéfiant dans le bon sens : ça retient bien les informations, tout est bien catégorisé et c'est un vrai gain de temps au quotidien. Totalement validé à 100 % !",
  'tm.n2': 'Margaux P.',
  'tm.r2': 'Commerciale TO',
  'tm.q3':
    "Reedly est un assistant IA conçu pour les commerciaux terrain qui leur fait gagner un temps précieux au quotidien.",
  'tm.n3': 'Angelique C.',
  'tm.r3': 'Commerciale TO',
  'tm.q4':
    "Enfin un outil qui simplifie vraiment le quotidien des commerciaux : moins d'administratif, des CRM à jour et plus de temps pour l'essentiel.",
  'tm.n4': 'Isabelle V.',
  'tm.r4': 'Accompagnatrice en transformation de la relation client',

  'final.title': 'Prêt à vous lancer<em>&nbsp;?</em>',

  'footer.tagline': 'La première intelligence terrain<br />du tourisme',
  'footer.col.features': 'Fonctionnalités',
  'footer.feature.transcription': 'Transcription IA',
  'footer.feature.hub': 'Hub Manager',
  'footer.col.social': 'Réseaux sociaux',
  'footer.legal_notice': 'Mentions légales',
  'footer.privacy_long': 'Politique de confidentialité',
  'footer.cookies': 'Politique des cookies',
  'footer.copy_short': '© {year} Copyright. Tous droits réservés.',

  'lang.fr': 'French',
  'lang.en': 'English',
};

const en: Dict = {
  'nav.language': 'Language',
  'nav.login': 'Log in',
  'cta.book_demo': 'Book a demo',

  'footer.col.product': 'Product',
  'footer.book_demo': 'Book a demo',
  'footer.pricing': 'Pricing',
  'footer.terms': 'Terms',
  'cta.store_sub': 'Available on',

  'hero.title':
    'Less data entry, more face time.<br /><em>Keep your field reps where they sell best.</em>',
  'hero.sub':
    "Reedly turns every field report into information that's instantly shared with the relevant teams. Identify what drives or holds back your product sales, and the factors that shape your partner agencies' choices.",

  'demo.title': 'You talk. Reedly structures.<br /><em>Your teams move forward.</em>',
  'demo.lead':
    'Your rep stays focused on the conversation. Reedly automatically turns every meeting into <b>a clear, structured report</b>, then shares it straight with your teams and <b>inside your tools</b>.',
  'demo.label_record': 'Transcription during or after the meeting',
  'demo.label_report': 'Report in 2 minutes',

  'hub.title': "Behind every number, there's a reason.<br /><em>Reedly brings it to light.</em>",
  'hub.lead':
    "Reedly <b>gathers and structures your reps' field feedback</b> to give you a clear read on what really drives <b>your performance.</b>",
  'hub.benefit1.title': 'A unified view of the whole field',
  'hub.benefit1.text':
    "Every rep's field feedback in one place: <b>what agencies expect, what blocks sales, opportunities, and signals favoring the competition.</b>",
  'hub.benefit2.title': 'Trends, opportunities, risks',
  'hub.benefit2.text':
    'Reedly aggregates field signals into syntheses over any period. <b>Spot shifts in the field</b> before they show up in your numbers.',
  'hub.benefit3.title': 'Decode what is blocking sales',
  'hub.benefit3.text':
    '<b>Identify</b> what is behind a sales slowdown, a stop-sale, or<b> an agency disengaging.</b>',
  'hub.max.url': 'hub.reedly.ai/max',
  'hub.max.greeting': 'Hi Sophie!',
  'hub.max.greeting_sub': 'What do you want to dig into today?',
  'hub.max.intro':
    "Ask a question, or tell me to act: I dig through your team's field data and I can create actions, emails or follow-ups for you.",
  'hub.max.kpi_team': 'Team',
  'hub.max.kpi_reports': 'Reports this week',
  'hub.max.brief_label': 'Morning briefing',
  'hub.max.brief_text': "Opportunities and risks spotted in yesterday's reports",
  'hub.max.insights_label': 'Max insights',
  'hub.max.insights_text': 'Explore the opportunities of the moment',
  'hub.max.composer': 'Why is Peru selling less over the past two months?',

  'compliance.title': 'Transcribe the field,<br /><em>fully compliant.</em>',
  'compliance.lead':
    'Your reps transcribe real client conversations. Here are the guarantees around every meeting, from consent to deletion.',
  'compliance.item1': 'Data hosted in the EU',
  'compliance.item2': 'DPA available on request',
  'compliance.item3': 'Subprocessor list published',
  'compliance.item4': 'Encryption at rest and in transit',
  'compliance.item5': 'Deletion on request within 30 days',
  'compliance.item6': 'Participant consent built into the flow',

  'bookdemo.title': '15 minutes to see<br /><em>Reedly in action.</em>',
  'bookdemo.lead':
    'A demo tailored to your team, your organization and your field challenges.',
  'bookdemo.role.label': 'Role',
  'bookdemo.role.select': 'Choose…',
  'bookdemo.role.director': 'Sales director / manager',
  'bookdemo.role.owner': 'Owner / CEO',
  'bookdemo.role.rep': 'Field sales rep',
  'bookdemo.role.other': 'Other',
  'bookdemo.team.label': 'Sales team size',
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
  'bookdemo.email.label': 'Email',
  'bookdemo.email.ph': 'you@your-organization.com',
  'bookdemo.submit': 'See available slots',
  'bookdemo.cal.pickday': 'Pick a day',
  'bookdemo.cal.pickslot': 'Pick a time',
  'bookdemo.cal.tznote': 'Times shown in your timezone.',
  'bookdemo.cal.loading': 'Loading availability…',
  'bookdemo.cal.name': 'Your name',
  'bookdemo.cal.note': 'A word about your need',
  'bookdemo.cal.confirm': 'Confirm the meeting',
  'bookdemo.cal.back_form': '← Back',
  'bookdemo.cal.back': '← Change slot',
  'bookdemo.cal.empty': "No slots available right now. Drop us a line and we'll sort it out.",
  'bookdemo.cal.error': 'Could not load slots. Please try again in a moment.',
  'bookdemo.cal.booking': 'Confirming…',
  'bookdemo.cal.slot_taken': 'That slot was just taken. Please pick another.',
  'bookdemo.cal.success_title': "You're booked.",
  'bookdemo.cal.success_body':
    'A Google Calendar invite with the Meet link is on its way to your email.',
  'bookdemo.cal.meet': 'Open the Google Meet link',

  'pricing.title': 'One price per rep.<br /><em>Zero surprises.</em>',
  'pricing.lead':
    'Billed to your organization, at the real size of the team that runs your agency network.',
  'pricing.billing.monthly': 'Monthly',
  'pricing.billing.annual': 'Yearly (-14%)',
  'pricing.billing.aria': 'Billing',
  'pricing.team.badge': 'Most popular',
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
  'pricing.large.plan': 'Enterprise',
  'pricing.large.subtitle': '16+ reps',
  'pricing.large.price': 'Custom quote',
  'pricing.large.feat1': 'Everything in Team',
  'pricing.large.feat2': 'Custom business vocabulary',
  'pricing.large.feat3': 'Multi-team / multi-sector',
  'pricing.large.feat4': 'Dedicated account manager',
  'pricing.large.feat5': 'On-site training & onboarding',
  'pricing.contact_us': 'Contact us',

  'faq.title': 'All your questions. <em>Answered.</em>',
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

  // ── V2 landing: sections added by the design refresh ──
  'cta.try_free': 'Try it free',

  'tm.title': 'With REEDLY,<br /><em>Their day-to-day gets simpler.</em>',
  'tm.prev': 'Previous testimonial',
  'tm.next': 'Next testimonial',
  'tm.q1':
    'Reedly is a tool built for field sales reps: simple, powerful and genuinely suited to what we need.',
  'tm.n1': 'Maryam B.',
  'tm.r1': 'Founder',
  'tm.q2':
    "I love it! It's astonishing in the best way: it captures the information well, everything is neatly categorized and it saves real time every day. Fully approved, 100%!",
  'tm.n2': 'Margaux P.',
  'tm.r2': 'Tour operator sales rep',
  'tm.q3':
    'Reedly is an AI assistant designed for field sales reps that saves them precious time every day.',
  'tm.n3': 'Angelique C.',
  'tm.r3': 'Tour operator sales rep',
  'tm.q4':
    'Finally a tool that really simplifies a rep\'s day: less admin, CRMs kept up to date and more time for what matters.',
  'tm.n4': 'Isabelle V.',
  'tm.r4': 'Customer relationship transformation consultant',

  'final.title': 'Ready to get started<em>&nbsp;?</em>',

  'footer.tagline': 'The first field intelligence<br />for tourism',
  'footer.col.features': 'Features',
  'footer.feature.transcription': 'AI Transcription',
  'footer.feature.hub': 'Manager Hub',
  'footer.col.social': 'Social',
  'footer.legal_notice': 'Legal notice',
  'footer.privacy_long': 'Privacy policy',
  'footer.cookies': 'Cookie policy',
  'footer.copy_short': '© {year} Copyright. All rights reserved.',

  'lang.fr': 'French',
  'lang.en': 'English',
};

export const dict: Record<Lang, Dict> = { fr, en };

export function t(lang: Lang, key: string): string {
  return dict[lang][key] ?? dict.fr[key] ?? key;
}
