import { getYoutubeVideosByChannelId } from '@/lib/queries/youtube/youtube-queries';
import { YoutubeChannelView } from './youtube-channel-view';
import { Suspense } from 'react';
import { ErrorState } from '@/components/global/error-state';

export async function YoutubeChannel({ channelId }: { channelId: string }) {
  const result = await getYoutubeVideosByChannelId(channelId);

  if (!result.success || !result.data) {
    return <ErrorState heading="Error" description={result.message} goBack />;
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <YoutubeChannelView videos={result.data} />
    </Suspense>
  );
}
