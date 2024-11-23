import { SuburbResponse, LocationType } from '../types/suburb';
import { AUSTRALIAN_STATES } from '../utils/australianStates';
import { indexDBService } from './indexdb.service';

interface OptimizedPostcodes {
  s: { [key: string]: number[] };
  e: Array<{
    l: string;
    s: string;
    p: string;
    r?: string;
    g: string;
  }>;
}

export class SuburbService {
  private optimizedPostcodes: OptimizedPostcodes | null = null;

  private async ensurePostcodesLoaded() {
    if (this.optimizedPostcodes) return;

    // Try to get from IndexDB first
    this.optimizedPostcodes = await indexDBService.getPostcodes();
    
    if (!this.optimizedPostcodes) {
      // If not in IndexDB, fetch from file and store
      const response = await fetch('/optimized_postcodes.json');
      this.optimizedPostcodes = await response.json();
      await indexDBService.storePostcodes(this.optimizedPostcodes);
    }
  }

  async searchSuburbs(query: string, limit: number = 10, includeRegions: boolean = false): Promise<SuburbResponse> {
    try {
      if (!query || query.length < 3) {
        return { suburbs: [], count: 0 };
      }

      await this.ensurePostcodesLoaded();
      if (!this.optimizedPostcodes) {
        throw new Error('Failed to load postcodes data');
      }

      console.log('Searching for:', query);
      const normalizedQuery = query.toLowerCase();
      
      // Search suburbs using optimized postcodes
      const matchingIndexes = this.optimizedPostcodes.s[normalizedQuery] || [];
      const matchingSuburbs = matchingIndexes.map(idx => {
        const entry = this.optimizedPostcodes!.e[idx];
        return {
          id: `SUBURB#${entry.s}#${entry.r?.toUpperCase() || ''}#${entry.l.toUpperCase()}#${entry.p}`,
          suburb: entry.l,
          state: entry.s,
          postcode: entry.p,
          region: entry.r || '',
          geohash: entry.g,
          locationType: LocationType.SUBURB
        };
      }).filter(entry => entry.suburb.toLowerCase().startsWith(normalizedQuery));

      // Search by postcode
      const postcodeMatches = this.optimizedPostcodes.e
        .filter(entry => entry.p.toString().startsWith(query))
        .map(entry => ({
          id: `SUBURB#${entry.s}#${entry.r?.toUpperCase() || ''}#${entry.l.toUpperCase()}#${entry.p}`,
          suburb: entry.l,
          state: entry.s,
          postcode: entry.p,
          region: entry.r || '',
          geohash: entry.g,
          locationType: LocationType.SUBURB
        }));

      // Also search by region name if includeRegions is true
      if (includeRegions) {
        // If the query matches any state name or abbreviation, include matching states
        const matchingStates = AUSTRALIAN_STATES.filter(state => 
          state.state.toLowerCase().startsWith(normalizedQuery) || 
          state.suburb.toLowerCase().startsWith(normalizedQuery)
        ).map(state => ({
          id: `SUBURB#${state.state.toUpperCase()}`,
          suburb: state.suburb,
          state: state.state,
          postcode: '',
          region: '',
          geohash: '',
          locationType: LocationType.STATE
        }));

        // Search for unique regions with matching names
        const matchingRegions = this.optimizedPostcodes.e
          .filter(entry => entry.r && entry.r.toLowerCase().startsWith(normalizedQuery))
          .reduce((unique, entry) => {
            const regionKey = `${entry.r}-${entry.s}`;
            if (!unique.has(regionKey)) {
              unique.set(regionKey, {
                id: `SUBURB#${entry.s}#${(entry.r || '').toUpperCase()}`,
                suburb: entry.r || '',
                state: entry.s,
                postcode: '',
                region: entry.r || '',
                geohash: entry.g,
                locationType: LocationType.REGION
              });
            }
            return unique;
          }, new Map())
          .values();

        // Combine all results and limit to the requested number
        const allResults = [...matchingStates, ...matchingRegions, ...matchingSuburbs, ...postcodeMatches];
        
        return {
          suburbs: allResults.slice(0, limit),
          count: allResults.length
        };
      }

      // Return suburbs and postcode matches if regions not requested
      const allResults = [...matchingSuburbs, ...postcodeMatches];
      return {
        suburbs: allResults.slice(0, limit),
        count: allResults.length
      };
    } catch (error) {
      console.error('Failed to search suburbs:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const suburbService = new SuburbService();
