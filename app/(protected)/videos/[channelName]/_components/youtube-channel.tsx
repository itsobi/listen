import {
  getYoutubeChannelStats,
  getYoutubeVideosByChannelId,
} from '@/lib/queries/youtube/youtube-queries';
import { YoutubeChannelView } from './youtube-channel-view';
import { ErrorState } from '@/components/global/error-state';

export async function YoutubeChannel({
  channelId,
  channelName,
}: {
  channelId: string;
  channelName: string;
}) {
  const result = await getYoutubeVideosByChannelId(channelId);
  const statsResult = await getYoutubeChannelStats(channelId);

  if (!result.success || !result.data) {
    return <ErrorState heading="Error" description={result.message} goBack />;
  }

  return (
    <YoutubeChannelView
      channelName={channelName}
      videos={result.data}
      stats={statsResult.data}
    />
  );
}
