import { useInfiniteQuery } from '@tanstack/react-query';
import { agistmentService } from '../services/agistment.service';
import { SearchResponse } from '../types/search';

export function useAgistmentSearch(searchHash: string) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['agistments', searchHash],
    queryFn: async ({ pageParam = null }) => {
      const response = await agistmentService.searchAgistments(searchHash, pageParam);
      return response;
    },
    getNextPageParam: (lastPage: SearchResponse) => lastPage.nextToken || undefined,
    // Keep previous data while fetching new data
    keepPreviousData: true,
    // Keep the data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache the data for 30 minutes
    cacheTime: 30 * 60 * 1000,
    // Maintain scroll position when returning to this query
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!searchHash,
  });
}
