import { useInfiniteQuery } from '@tanstack/react-query';
import { agistmentService } from '../services/agistment.service';
import { SearchResponse } from '../types/search';

export function useAgistmentSearch(searchHash: string) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['agistments', searchHash],
    initialPageParam: null,
    queryFn: async ({ pageParam = null }) => {
      const response = await agistmentService.searchAgistments(searchHash, pageParam as string);
      return response;
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
