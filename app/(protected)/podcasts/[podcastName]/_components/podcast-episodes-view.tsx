'use client';

import { RefreshData } from '@/components/global/refresh-data';
import { mergePodcastEpisodes } from '@/lib/helpers';
import { ApplePodcastEpisode } from '@/lib/queries/apple/apple-types';
import { SpotifyEpisode } from '@/lib/queries/spotify/spotify-types';
import { Podcast } from 'lucide-react';
import { PodcastEpisodeCard } from './podcast-episode-card';

interface Props {
  podcastInfo: any;
  appleEpisodes: ApplePodcastEpisode[];
  spotifyEpisodes: SpotifyEpisode[];
}

export function PodcastEpisodesView({
  podcastInfo,
  appleEpisodes,
  spotifyEpisodes,
}: Props) {
  const mergedEpisodes = mergePodcastEpisodes(appleEpisodes, spotifyEpisodes);

  const image = podcastInfo?.images?.[0]?.url;

  return (
    <div>
      <div className="flex gap-4">
        {image ? (
          <img
            src={image}
            alt={podcastInfo?.name}
            className="size-40 rounded-lg object-cover"
          />
        ) : (
          <Podcast className="size-40 rounded-lg object-cover" />
        )}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{podcastInfo?.name}</h3>
          <p>{podcastInfo?.publisher}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Recent Episodes</h4>
          <RefreshData />
        </div>

        {mergedEpisodes.map((episode, index) => (
          <div key={index}>
            <PodcastEpisodeCard
              episode={episode.apple}
              spotifyLink={episode.spotify?.external_urls.spotify}
              previewUrl={episode.spotify?.audio_preview_url}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
