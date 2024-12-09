export const GOOGLE_MAPS_CONFIG = {
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places', 'maps', 'geometry', 'drawing'] as const,
  version: 'weekly',
  language: 'en',
  region: 'AU'
};
