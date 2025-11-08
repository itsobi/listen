import { PageHeading } from '@/components/global/page-heading';
import { Suspense } from 'react';

import { PodcastEpisodes } from './_components/podcast-episodes';
import { PodcastSkeleton } from './_components/podcast-skeleton';

export default async function PodcastNamePage({
  params,
}: {
  params: Promise<{ podcastName: string }>;
}) {
  const { podcastName } = await params;

  return (
    <>
      <PageHeading title={decodeURIComponent(podcastName)} />
      <Suspense fallback={<PodcastSkeleton />}>
        <PodcastEpisodes name={decodeURIComponent(podcastName)} />
      </Suspense>
    </>
  );
}
