// Photography for the product pages. Keyed by feature id so both language
// versions of a page always show the same visuals.
export interface FeatureImage {
  src: string;
  altFr: string;
  altEn: string;
  /** Framing override; the canvas crops the Manager Hub portrait higher. */
  objectPosition?: string;
}

const HERO: Record<string, FeatureImage> = {
  'ai-transcription': {
    src: '/images/rep-listening.webp',
    altFr: 'Commerciale terrain en rendez-vous',
    altEn: 'Field sales rep in a client meeting',
  },
  'manager-hub': {
    src: '/images/portrait-a.webp',
    altFr: 'Directeur commercial',
    altEn: 'Sales director',
    objectPosition: '50% 20%',
  },
};

// Backdrop of the "who uses it" role panel. The canvas does not reuse the hero
// photo here.
const ROLES: Record<string, FeatureImage> = {
  'manager-hub': {
    src: '/images/rep-transcribing.webp',
    altFr: 'Directrice commerciale dans son bureau',
    altEn: 'Sales director in her office',
    objectPosition: '70% 18%',
  },
};

const USE_CASES: FeatureImage[] = [
  {
    src: '/images/field-rep.webp',
    altFr: 'Commerciale terrain en rendez-vous',
    altEn: 'Field sales rep in a client meeting',
  },
  {
    src: '/images/industrial-meeting.webp',
    altFr: 'Rendez-vous en environnement industriel',
    altEn: 'Meeting in an industrial setting',
  },
  {
    src: '/images/rep-transcribing.webp',
    altFr: 'Directeur commercial',
    altEn: 'Sales director',
  },
  {
    src: '/images/discovery-presentation.webp',
    altFr: 'Présentation à plusieurs interlocuteurs en rendez-vous',
    altEn: 'Presenting to several stakeholders in a meeting',
  },
];

const FALLBACK = HERO['ai-transcription'];

export function heroImage(featureId: string, lang: 'fr' | 'en') {
  const image = HERO[featureId] ?? FALLBACK;
  return {
    src: image.src,
    alt: lang === 'fr' ? image.altFr : image.altEn,
    objectPosition: image.objectPosition,
  };
}

export function rolesImage(featureId: string, lang: 'fr' | 'en') {
  const image = ROLES[featureId] ?? HERO[featureId] ?? FALLBACK;
  return {
    src: image.src,
    alt: lang === 'fr' ? image.altFr : image.altEn,
    objectPosition: image.objectPosition,
  };
}

export function useCaseImages(lang: 'fr' | 'en') {
  return USE_CASES.map((image) => ({
    src: image.src,
    alt: lang === 'fr' ? image.altFr : image.altEn,
  }));
}
