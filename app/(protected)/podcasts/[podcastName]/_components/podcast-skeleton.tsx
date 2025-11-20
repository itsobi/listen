export function PodcastSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-4">
        {/* Image skeleton */}
        <div className="size-40 rounded-lg bg-gray-200 dark:bg-gray-800" />

        {/* Podcast info skeleton */}
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="h-6 w-64 rounded bg-gray-200 dark:bg-gray-800" />
          {/* Publisher skeleton */}
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Episode card skeletons */}
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            {/* Episode image skeleton */}
            <div className="size-20 shrink-0 rounded bg-gray-200 dark:bg-gray-800" />

            {/* Episode info skeleton */}
            <div className="flex-1 space-y-2">
              {/* Title */}
              <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
              {/* Description line 1 */}
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
              {/* Description line 2 */}
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
              {/* Date/duration */}
              <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
