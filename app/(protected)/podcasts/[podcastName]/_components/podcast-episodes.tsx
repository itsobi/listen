import { ErrorState } from '@/components/global/error-state';
import { getApplePodcastEpisodes } from '@/lib/queries/apple/apple-podcasts-queries';
import { getSpotifyEpisodes } from '@/lib/queries/spotify/spotify-podcast-queries';
import { PodcastEpisodesView } from './podcast-episodes-view';

export async function PodcastEpisodes({ name }: { name: string }) {
  const podcastName = decodeURIComponent(name);

  const {
    episodes: appleEpisodes,
    success: appleSuccess,
    message: appleMessage,
    name: appleName,
    publisher: applePublisher,
    image: appleImage,
  } = await getApplePodcastEpisodes(podcastName);

  const {
    podcastInfo: spotifyPodcastInfo,
    episodes: spotifyEpisodes,
    success: spotifySuccess,
    message: spotifyMessage,
  } = await getSpotifyEpisodes(podcastName);

  if (!appleSuccess) {
    return (
      <ErrorState heading="Error" description={appleMessage} goBack={true} />
    );
  }

  if (!spotifySuccess) {
    return (
      <ErrorState heading="Error" description={spotifyMessage} goBack={true} />
    );
  }
  return (
    <PodcastEpisodesView
      podcastInfo={spotifyPodcastInfo}
      appleEpisodes={appleEpisodes}
      spotifyEpisodes={spotifyEpisodes}
    />
  );
}
