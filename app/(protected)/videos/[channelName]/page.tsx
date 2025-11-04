import { ErrorState } from '@/components/global/error-state';
import { PageHeading } from '@/components/global/page-heading';
import { Suspense } from 'react';
import { YoutubeChannel } from './_componenets/youtube-channel';
import { YoutubeChannelSkeleton } from './_componenets/youtube-channel-skeleton';

export default async function VideoNamePage({
  params,
  searchParams,
}: {
  params: Promise<{ channelName: string }>;
  searchParams: Promise<{ provider: string; channelId: string }>;
}) {
  const { channelName } = await params;
  const { provider, channelId } = await searchParams;

  const decodedChannelName = decodeURIComponent(channelName);

  if (provider === 'youtube' && channelId) {
    return (
      <>
        <PageHeading title={`${decodedChannelName} - YouTube`} />

        <Suspense fallback={<YoutubeChannelSkeleton />}>
          <YoutubeChannel channelId={channelId} />
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
