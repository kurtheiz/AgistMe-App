interface Location {
  address?: string;
  suburb: string;
  state: string;
  postCode?: string;
}

/**
 * Generates a Google Maps search URL for a given location
 * @param location Location object containing address details
 * @returns Google Maps search URL
 */
export const getGoogleMapsUrl = (location: Location): string => {
  if (!location) return '#';
  
  const parts = [
    location.address,
    location.suburb,
    location.state,
    location.postCode
  ].filter(Boolean);
  
  const query = parts.join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};
