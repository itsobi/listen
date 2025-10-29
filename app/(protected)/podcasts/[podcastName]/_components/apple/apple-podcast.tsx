import {
  getApplePodcast,
  getApplePodcastEpisodes,
} from '@/lib/queries/apple/apple-podcasts-queries';

import { ApplePodcastView } from './apple-podcast-view';

export async function ApplePodcast({ podcastName }: { podcastName: string }) {
  const pageName = decodeURIComponent(podcastName);

  const { exists, podcast } = await getApplePodcast(pageName);
  const { episodes } = await getApplePodcastEpisodes(pageName);

  if (!exists) {
    return <div>Podcast not found</div>;
  }
  return <ApplePodcastView podcast={podcast} episodes={episodes} />;
}
