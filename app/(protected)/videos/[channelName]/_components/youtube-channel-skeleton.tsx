import { Skeleton } from '@/components/ui/skeleton';

function ChannelStatsSkeleton() {
  return (
    <>
      {/* Mobile layout */}
      <div className="flex flex-col gap-4 mb-10 lg:hidden">
        <div className="flex items-center justify-center">
          <Skeleton className="size-40 rounded-lg" />
        </div>

        <div className="my-4">
          <div className="flex items-center justify-center gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center"
              >
                <Skeleton className="size-6 mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex gap-4 mb-10">
        <Skeleton className="size-40 rounded-lg" />

        <div className="flex items-end gap-12 flex-wrap lg:w-full">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="size-6 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function VideoCardSkeleton() {
  return (
    <>
      {/* Mobile layout */}
      <div className="flex flex-col items-start w-full border rounded-lg p-4 shadow-sm lg:hidden">
        <Skeleton className="w-full aspect-[16/9] rounded-lg" />

        <div className="mt-4 space-y-2 flex-1 w-full">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="flex items-center justify-between w-full mt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="size-10 rounded-lg" />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex flex-col items-start w-full border rounded-lg p-4 shadow-sm">
        <Skeleton className="w-full aspect-[16/9] rounded-lg" />

        <div className="mt-4 space-y-2 flex-1 w-full">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </>
  );
}

export function YoutubeChannelSkeleton() {
  return (
    <div>
      <ChannelStatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VideoCardSkeleton />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
      </div>
    </div>
  );
}
