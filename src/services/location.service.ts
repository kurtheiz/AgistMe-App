import { Location } from '../types/agistment';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

class LocationService {
  private client: any;
  private readonly PLACE_INDEX = import.meta.env.VITE_AWS_PLACE_INDEX;
  private readonly REGION = import.meta.env.VITE_AWS_REGION;
  private readonly MAX_RESULTS = 50;

  constructor() {
    this.client = new any({
      region: this.REGION,
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: this.REGION },
        identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID
      })
    });
  }

  private formatPlace(place: Location): Location {
    // If we have a neighborhood, use it as the municipality
    if (place.Neighborhood && place.Municipality === 'Melbourne') {
      return {
        ...place,
        Municipality: place.Neighborhood
      };
    }
    return place;
  }

  private isValidSuburb(place: Location): boolean {
    if (!place || !place.Region || place.Country !== 'AUS') {
      return false;
    }

    // Must be a suburb/municipality (not a POI or street)
    if (place.Categories?.some(cat => 
      cat === 'PointOfInterestType' || 
      cat === 'StreetType' || 
      cat === 'AddressRangeType'
    )) {
      return false;
    }

    // Must have either Municipality or Neighborhood
    return Boolean(place.Municipality || place.Neighborhood);
  }

  async searchSuburbs(searchText: string): Promise<Location[]> {
    if (searchText.length < 3) return [];
    
    try {
      const isNumeric = /^\d+$/.test(searchText);

      const params = {
        IndexName: this.PLACE_INDEX,
        // For numeric searches, prefix with "Postcode"
        Text: isNumeric ? `Postcode ${searchText}` : searchText,
        MaxResults: this.MAX_RESULTS,
        FilterCountries: ['AUS'],
        FilterBBox: undefined,
        Language: 'en'
      };

      const command = new any(params);
      const response = await this.client.send(command);
      
      if (!response.Results || response.Results.length === 0) {
        // Try alternative format if no results
        if (isNumeric) {
          const altParams = {
            ...params,
            Text: `${searchText} Postcode`
          };
          const altCommand = new any(altParams);
          const altResponse = await this.client.send(altCommand);
          if (altResponse.Results && altResponse.Results.length > 0) {
            response.Results = altResponse.Results;
          }
        }
        if (!response.Results || response.Results.length === 0) {
          return [];
        }
      }

      const validResults = response.Results
        .map(result => result.Place as Location)
        .filter(place => this.isValidSuburb(place))
        .map(place => this.formatPlace(place));

      // For numeric searches, ensure postcode matches and sort
      if (isNumeric) {
        return validResults
          .filter(place => place.PostalCode?.startsWith(searchText))
          .sort((a, b) => {
            // Sort by exact postal code match first
            const aExact = a.PostalCode === searchText;
            const bExact = b.PostalCode === searchText;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            // Then by suburb name
            return (a.Municipality || '').localeCompare(b.Municipality || '');
          });
      }

      // For text searches, sort by municipality name
      return validResults.sort((a, b) => {
        const aName = (a.Municipality || '').toLowerCase();
        const bName = (b.Municipality || '').toLowerCase();
        const searchLower = searchText.toLowerCase();

        // Prioritize exact matches and starts with
        const aStartsWith = aName.startsWith(searchLower);
        const bStartsWith = bName.startsWith(searchLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return aName.localeCompare(bName);
      });

    } catch (error) {
      console.error('Error searching suburbs:', error);
      throw error;
    }
  }
}

export const locationService = new LocationService();
