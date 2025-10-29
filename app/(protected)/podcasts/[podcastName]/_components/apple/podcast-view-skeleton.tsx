import { Skeleton } from '@/components/ui/skeleton';

export function PodcastViewSkeleton() {
  return (
    <div>
      {/* Header section with image and info */}
      <div className="flex gap-4">
        <Skeleton className="size-40 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Recent Episodes section */}
      <div className="mt-10">
        <Skeleton className="h-5 w-32" />

        <div className="mt-5 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2 border-b pb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />

              <div className="flex items-center justify-between py-6 w-full">
                <Skeleton className="h-10 w-9 lg:w-48" />
                <Skeleton className="h-10 w-md rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
