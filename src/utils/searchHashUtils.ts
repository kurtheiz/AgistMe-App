import { SearchRequest } from '../types/search';
import { LocationType } from '../types/suburb';

interface CompressedSuburb {
  i: string; // id
  n: string; // suburb name
  p: string; // postcode
  t: string; // state
  r: string; // region
  g: string; // geohash
  l: LocationType; // locationType
}

interface CompressedSearch {
  s: CompressedSuburb[]; // suburbs
  r: number; // radius
  pt: string[]; // paddockTypes
  sp: number; // spaces
  mp: number; // maxPrice
  a: boolean; // hasArena
  ry: boolean; // hasRoundYard
  f: string[]; // facilities
  ct: string[]; // careTypes
}

/**
 * Converts a search criteria object into a compressed hash string
 * @param criteria The search criteria to convert
 * @returns A base64 encoded string representing the search criteria
 */
export const encodeSearchHash = (criteria: SearchRequest): string => {
  try {
    const compressed: CompressedSearch = {
      s: criteria.suburbs.map(s => ({
        i: s.id,
        n: s.suburb,
        p: s.postcode,
        t: s.state,
        r: s.region,
        g: s.geohash,
        l: s.locationType
      })),
      r: criteria.radius || 0,
      pt: criteria.paddockTypes || [],
      sp: criteria.spaces || 0,
      mp: criteria.maxPrice || 0,
      a: criteria.hasArena || false,
      ry: criteria.hasRoundYard || false,
      f: criteria.facilities || [],
      ct: criteria.careTypes || []
    };

    return btoa(JSON.stringify(compressed));
  } catch (error) {
    console.error('Error encoding search hash:', error);
    return '';
  }
};

/**
 * Converts a compressed hash string back into a search criteria object
 * @param hash The base64 encoded search hash
 * @returns A SearchRequest object
 */
export const decodeSearchHash = (hash: string): SearchRequest => {
  try {
    const decodedSearch = JSON.parse(atob(hash));
    
    // Convert compressed format to full format
    if (decodedSearch.s && Array.isArray(decodedSearch.s)) {
      return {
        suburbs: decodedSearch.s.map((s: CompressedSuburb) => ({
          id: s.i?.replace(/['\"]/g, ''),
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
