export function PropertyCardSkeleton() {
  return (
    <div className="relative w-full h-full">
      <div className="overflow-hidden bg-white flex flex-col h-full w-full
                    shadow-lg border border-neutral-200 rounded-none sm:rounded-lg">
        {/* Property Name Header Skeleton */}
        <div className="w-full bg-primary-600/30 text-center relative p-4">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <div className="h-7 sm:h-8 w-3/4 mx-auto bg-primary-400/30 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Photo Skeleton */}
        <div className="relative aspect-[16/9] bg-neutral-200 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-neutral-300 rounded-lg"></div>
          </div>
        </div>

        {/* Location Skeleton */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-200 bg-white">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-neutral-300 rounded animate-pulse"></div>
          <div className="h-5 sm:h-6 w-2/3 bg-neutral-300 rounded animate-pulse"></div>
        </div>

        {/* Availability Info Skeleton */}
        <div className="px-5 py-4 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              {/* Paddocks Skeleton */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-12 sm:h-14 bg-neutral-200 rounded-lg animate-pulse"></div>
                <div className="mt-2 w-12 sm:w-14 h-4 bg-neutral-200 rounded animate-pulse"></div>
              </div>
              {/* Shared Skeleton */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-12 sm:h-14 bg-neutral-200 rounded-lg animate-pulse"></div>
                <div className="mt-2 w-12 sm:w-14 h-4 bg-neutral-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-10 h-10 bg-neutral-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Facilities Skeleton */}
        <div className="p-5 bg-white">
          <div className="flex flex-wrap gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
