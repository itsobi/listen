import { PageHeading } from '@/components/global/page-heading';
import { ApplePodcast } from './_components/apple/apple-podcast';

import { Suspense } from 'react';
import { PodcastViewSkeleton } from './_components/apple/podcast-view-skeleton';
import { SpotifyPodcast } from './_components/spotify/spotify-podcast';
import { ErrorState } from '@/components/global/error-state';

export default async function PodcastNamePage({
  params,
  searchParams,
}: {
  params: Promise<{ podcastName: string }>;
  searchParams: Promise<{ provider: string }>;
}) {
  const { podcastName } = await params;
  const { provider } = await searchParams;

  const podName = decodeURIComponent(podcastName);

  if (provider === 'apple') {
    return (
      <>
        <PageHeading title={`${podName} - Apple`} />
        <Suspense fallback={<PodcastViewSkeleton />}>
          <ApplePodcast podcastName={podName} />
        </Suspense>
      </>
    );
  }

  if (provider === 'spotify') {
    return (
      <>
        <PageHeading title={`${podName} - Spotify`} />
        <Suspense fallback={<PodcastViewSkeleton />}>
          <SpotifyPodcast podcastName={podName} />
        </Suspense>
      </>
    );
  }

  return (
    <ErrorState
      heading="404 - Page Not Found"
      description="The page you're looking for doesn't exist."
      linkText="Go back home"
      linkHref="/"
    />
  );
}
