/**
 * Schema.org graph for the whole site.
 *
 * Every node carries a stable `@id` so the nodes emitted across pages and
 * across the separate `ld+json` blocks (the FAQ component emits its own)
 * describe the same entities rather than a new anonymous one each time.
 */

export const SITE = 'https://www.reedly.ai';

export const ORG_ID = `${SITE}/#organization`;
export const SITE_ID = `${SITE}/#website`;
export const APP_ID = `${SITE}/#software`;

export type Lang = 'fr' | 'en';

type Node = Record<string, unknown>;

const APP_STORE = 'https://apps.apple.com/fr/app/reedly-compte-rendu-client-ia/id6760261826';
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.reedly.app';

const ref = (id: string) => ({ '@id': id });

export function organization(): Node {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Reedly',
    legalName: 'LEL Studio',
    url: SITE,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE}/#logo`,
      url: `${SITE}/logo-512.png`,
      width: 512,
      height: 512,
      caption: 'Reedly',
    },
    image: ref(`${SITE}/#logo`),
    email: 'contact@reedly.ai',
    telephone: '+33601147568',
    vatID: 'FR34852099191',
    taxID: '852099191',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '4 passage Saint-Jacques',
      postalCode: '83210',
      addressLocality: 'Solliès-Pont',
      addressCountry: 'FR',
    },
    knowsLanguage: ['fr', 'en'],
    sameAs: [
      'https://www.linkedin.com/company/reedly/',
      'https://www.instagram.com/reedly.ai/',
      APP_STORE,
      PLAY_STORE,
      'https://github.com/reedlyio',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'contact@reedly.ai',
        availableLanguage: ['fr', 'en'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@reedly.ai',
        telephone: '+33601147568',
        availableLanguage: ['fr', 'en'],
      },
    ],
  };
}

export function website(lang: Lang): Node {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: 'Reedly',
    alternateName: ['Reedly AI', 'reedly.ai'],
    url: SITE,
    publisher: ref(ORG_ID),
    inLanguage: lang,
  };
}

/**
 * The product. `withOffers` stays false everywhere the prices are not on the
 * page: the structured data must not claim a price the visitor cannot see.
 */
export function softwareApplication(lang: Lang, withOffers = false): Node {
  const node: Node = {
    '@type': 'SoftwareApplication',
    '@id': APP_ID,
    name: 'Reedly',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: lang === 'fr' ? 'Compte rendu de visite commerciale' : 'Field sales reporting',
    operatingSystem: 'iOS, Android',
    url: SITE,
    description:
      lang === 'fr'
        ? "L'agent IA qui transforme vos rendez-vous terrain en rapports structurés en moins de 2 minutes."
        : 'The AI agent that turns your field meetings into structured reports in under 2 minutes.',
    publisher: ref(ORG_ID),
    inLanguage: ['fr', 'en'],
    installUrl: [APP_STORE, PLAY_STORE],
    softwareHelp: { '@type': 'CreativeWork', url: `${SITE}/docs` },
  };

  if (!withOffers) return node;

  const currency = lang === 'fr' ? 'EUR' : 'USD';
  const home = `${SITE}/${lang}#pricing`;
  const seats = {
    '@type': 'QuantitativeValue',
    minValue: 3,
    unitText: lang === 'fr' ? 'commerciaux' : 'reps',
  };

  node.featureList =
    lang === 'fr'
      ? [
          'Application iOS et Android',
          'Comptes rendus IA illimités',
          'Synthèses stratégiques périodiques',
          'Hub manager · vision 360° de l’équipe',
          'Identification des interlocuteurs',
          'Fiches clients auto-enrichies',
          'Connecteurs CRM connus',
        ]
      : [
          'iOS & Android app',
          'Unlimited AI reports',
          'Periodic strategic syntheses',
          'Manager Hub · 360° team view',
          'Speaker identification',
          'Auto-enriched client records',
          'Connectors to major CRMs',
        ];

  node.offers = [
    {
      '@type': 'Offer',
      '@id': `${SITE}/#offer-team-monthly`,
      name: lang === 'fr' ? 'Team · mensuel' : 'Team · monthly',
      price: '49',
      priceCurrency: currency,
      url: home,
      availability: 'https://schema.org/InStock',
      eligibleQuantity: seats,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '49',
        priceCurrency: currency,
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitCode: 'MON',
        },
        unitText: lang === 'fr' ? 'par commercial et par mois' : 'per rep per month',
      },
    },
    {
      '@type': 'Offer',
      '@id': `${SITE}/#offer-team-annual`,
      name: lang === 'fr' ? 'Team · annuel' : 'Team · yearly',
      price: '42',
      priceCurrency: currency,
      url: home,
      availability: 'https://schema.org/InStock',
      eligibleQuantity: seats,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '42',
        priceCurrency: currency,
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitCode: 'MON',
        },
        unitText:
          lang === 'fr'
            ? 'par commercial et par mois, facturé annuellement'
            : 'per rep per month, billed annually',
      },
    },
  ];

  return node;
}

export interface Crumb {
  name: string;
  /** Absolute path. Omitted on the last crumb, as Google expects. */
  path?: string;
}

export function breadcrumbList(url: string, crumbs: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: `${SITE}${crumb.path}` } : {}),
    })),
  };
}

export interface WebPageInput {
  url: string;
  name: string;
  description: string;
  lang: Lang;
  dateModified?: string;
  hasBreadcrumb?: boolean;
  about?: boolean;
}

export function webPage(input: WebPageInput): Node {
  return {
    '@type': 'WebPage',
    '@id': `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    isPartOf: ref(SITE_ID),
    about: input.about ? ref(APP_ID) : ref(ORG_ID),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE}/og-image.png`,
    },
    inLanguage: input.lang,
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.hasBreadcrumb ? { breadcrumb: ref(`${input.url}#breadcrumb`) } : {}),
  };
}

/** Emitted by whichever FAQ component renders, never by the layout. */
export function faqPage(url: string, lang: Lang, items: { q: string; a: string }[]): Node {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    inLanguage: lang,
    isPartOf: ref(`${url}#webpage`),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
