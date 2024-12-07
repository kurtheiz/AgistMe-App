import { SearchRequest } from '../types/search';

export const decodeSearchHash = (hash: string): SearchRequest => {
  try {
    const decodedSearch = JSON.parse(atob(hash));
    
    // Convert old format to new format if necessary
    if (decodedSearch.s && Array.isArray(decodedSearch.s)) {
      return {
        suburbs: decodedSearch.s.map((s: any) => ({
          id: s.i,
          suburb: s.n,
          postcode: s.p,
          state: s.t,
          region: s.r,
          geohash: s.g,
          locationType: s.l
        })),
        radius: decodedSearch.r || 0,
        paddockTypes: decodedSearch.pt || [],
        spaces: decodedSearch.sp || 0,
        maxPrice: decodedSearch.mp || 0,
        hasArena: decodedSearch.a || false,
        hasRoundYard: decodedSearch.ry || false,
        facilities: decodedSearch.f || [],
        careTypes: decodedSearch.ct || []
      };
    }
    
    return decodedSearch;
  } catch (error) {
    console.error('Error decoding search hash:', error);
    return {
      suburbs: [],
      radius: 0,
      paddockTypes: [],
      spaces: 0,
      maxPrice: 0,
      hasArena: false,
      hasRoundYard: false,
      facilities: [],
      careTypes: []
    };
  }
};
