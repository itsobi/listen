import { getApplePodcastEpisodes } from '@/lib/queries/apple/apple-podcasts-queries';
import { ApplePodcastView } from './apple-podcast-view';
import { ErrorState } from '@/components/global/error-state';

export async function ApplePodcast({ podcastName }: { podcastName: string }) {
  const pageName = decodeURIComponent(podcastName);

  const { episodes, success, message, name, publisher, image } =
    await getApplePodcastEpisodes(pageName);

  if (!success) {
    return <ErrorState heading="Error" description={message} goBack={true} />;
  }
  return (
    <ApplePodcastView
      name={name}
      publisher={publisher}
      image={image}
      episodes={episodes}
    />
  );
}
