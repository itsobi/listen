import { ErrorState } from '@/components/global/error-state';
import { getSpotifyEpisodes } from '@/lib/queries/spotify/spotify-podcast-queries';
import { SpotifyPodcastView } from './spotify-podcast-view';

export async function SpotifyPodcast({ podcastName }: { podcastName: string }) {
  const decodedPodcastName = decodeURIComponent(podcastName);
  const { podcastInfo, episodes, success, message } = await getSpotifyEpisodes(
    decodedPodcastName
  );

  const title: string | undefined = podcastInfo?.name;
  const publisher: string | undefined = podcastInfo?.publisher;
  const image: string | undefined = podcastInfo?.images?.[0]?.url;

  if (!success) {
    return <ErrorState heading="Error" description={message} goBack={true} />;
  }
  return (
    <SpotifyPodcastView
      title={title}
      publisher={publisher}
      image={image}
      episodes={episodes}
    />
  );
}
