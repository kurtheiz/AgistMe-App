export const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse max-w-5xl mx-auto py-6">
      {/* Profile Photo Skeleton */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-6 px-4 sm:px-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>

        {/* Contact Fields */}
        <div className="space-y-4">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>

        {/* Location Field */}
        <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />

        {/* Horses Section */}
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
