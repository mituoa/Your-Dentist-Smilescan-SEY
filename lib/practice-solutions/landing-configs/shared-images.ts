/**
 * Vorschau-Bilder — thematisch zugeordnet, Marketing-kompatibel.
 * Eigene Screenshots: `public/landing/catalog/{id}.webp` + USE_LOCAL_LANDING_PREVIEWS = true
 */
export const USE_LOCAL_LANDING_PREVIEWS = false;

export const LANDING_IMG = {
  smilescan:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85",
  aligner:
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1600&q=85",
  implantologie:
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1600&q=85",
  implantDigital:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=85",
  prophylaxe:
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=85",
  kinder:
    "https://images.unsplash.com/photo-1631217868264-e5b1a5fe1c89?auto=format&fit=crop&w=1600&q=85",
  parodontologie:
    "https://images.unsplash.com/photo-1588776814546-1ffca47267a5?auto=format&fit=crop&w=1600&q=85",
  aesthetik:
    "https://images.unsplash.com/photo-1629909613654-28e377b93888?auto=format&fit=crop&w=1600&q=85",
  bleaching:
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1600&q=85",
  oralHealth:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85",
  endodontie:
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1600&q=85",
  praxiswebsite:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85",
  karriere:
    "https://plus.unsplash.com/premium_photo-1661425438470-9f34812a9486?auto=format&fit=crop&w=1600&q=85",
  standort:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
  ratgeber:
    "https://images.unsplash.com/photo-1579684385127-1ef15d508a1e?auto=format&fit=crop&w=1600&q=85",
  vorherNachher:
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1600&q=85",
  individuell:
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=85",
  default:
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=85",
} as const;

export type LandingImageKey = keyof typeof LANDING_IMG;

export function landingCatalogPreview(
  catalogId: string,
  remoteFallback: string
): string {
  if (USE_LOCAL_LANDING_PREVIEWS) {
    return `/landing/catalog/${catalogId}.webp`;
  }
  return remoteFallback;
}
