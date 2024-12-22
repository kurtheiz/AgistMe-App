import { useInfiniteQuery } from '@tanstack/react-query';
import { agistmentService } from '../services/agistment.service';
import { SearchResponse } from '../types/search';
import { PriceUtils } from '../utils/prices';
import { decodeSearchHash } from '../utils/searchHashUtils';

export type SortOption = 'default' | 'low-to-high' | 'high-to-low';

function sortAgistments(results: SearchResponse['results'], searchHash: string, sortOption: SortOption) {
  if (sortOption === 'default') return results;

  // Get the search criteria from the hash
  const searchCriteria = searchHash ? decodeSearchHash(searchHash) : undefined;
  
  // Get prices using PriceUtils with the current search criteria
  const pricesWithIds = results.map(agistment => {
    const priceInfo = PriceUtils.getPriceDisplay(agistment, {
      paddockTypes: searchCriteria?.paddockTypes
    });
    return {
      id: agistment.id,
      minPrice: priceInfo.minPrice,
      maxPrice: priceInfo.maxPrice
    };
  });
  
  // Sort based on the price values from PriceUtils
  const sortedResults = [...results].sort((a, b) => {
    const priceInfoA = pricesWithIds.find(p => p.id === a.id);
    const priceInfoB = pricesWithIds.find(p => p.id === b.id);
    
    // For low to high: Contact for price (-1) should be last
    if (priceInfoA?.minPrice === -1) return 1;
    if (priceInfoB?.minPrice === -1) return -1;
    return (priceInfoA?.minPrice || 0) - (priceInfoB?.minPrice || 0);
  });

  // For high to low, just reverse the low to high results
  return sortOption === 'high-to-low' ? sortedResults.reverse() : sortedResults;
}

export function useAgistmentSearch(searchHash: string, sortOption: SortOption = 'default') {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['agistments', searchHash],
    initialPageParam: null,
    queryFn: async ({ pageParam = null }) => {
      const response = await agistmentService.searchAgistments(searchHash, pageParam as string);
      
      return {
        ...response,
        results: response.results
      };
    },
    select: (data) => {
      // Sort all pages together
      const allResults = data.pages.flatMap(page => page.results);
      const sortedResults = sortAgistments(allResults, searchHash, sortOption);
      
      // Return the data in the same format but with sorted results
      return {
        pages: [{
          ...data.pages[0],
          results: sortedResults
        }],
        pageParams: data.pageParams
      };
    },
    getNextPageParam: (lastPage: SearchResponse) => lastPage.nextToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!searchHash,
  });
}
