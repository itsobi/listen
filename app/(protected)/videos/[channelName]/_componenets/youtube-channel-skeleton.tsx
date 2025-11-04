import { Skeleton } from '@/components/ui/skeleton';

function VideoCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 flex flex-col">
      {/* Thumbnail skeleton */}
      <Skeleton className="w-full h-40 rounded-lg" />

      {/* Title and description skeleton */}
      <div className="mt-4 space-y-2 flex-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Date skeleton */}
      <div className="flex items-center gap-2 mt-4">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function YoutubeChannelSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <VideoCardSkeleton />
      <VideoCardSkeleton />
      <VideoCardSkeleton />
      <VideoCardSkeleton />
      <VideoCardSkeleton />
    </div>
  );
}
