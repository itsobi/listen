'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SpotifyEpisode } from '@/lib/queries/spotify/spotify-types';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconBrandSpotifyFilled } from '@tabler/icons-react';
import { Check, Copy, Podcast, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  title: string | undefined;
  publisher: string | undefined;
  image: string | undefined;
  episodes: SpotifyEpisode[];
}

export function SpotifyPodcastView({
  title,
  publisher,
  image,
  episodes,
}: Props) {
  const [copiedEpisodeId, setCopiedEpisodeId] = useState<string | null>(null);

  const handleCopy = async (episodeUrl: string, episodeId: string) => {
    try {
      await navigator.clipboard.writeText(episodeUrl);
      setCopiedEpisodeId(episodeId);

      setTimeout(() => setCopiedEpisodeId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopiedEpisodeId(null);
      toast.error('Unable to copy episode link');
    }
  };
  return (
    <div>
      <div className="flex gap-4">
        {image ? (
          <img
            src={image}
            alt={title}
            className="size-40 rounded-lg object-cover"
          />
        ) : (
          <Podcast className="size-40 rounded-lg object-cover" />
        )}
        <div className="space-y-1">
          <IconBrandSpotifyFilled className="size-4" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <p>{publisher}</p>
        </div>
      </div>
      <div className="mt-10">
        <h4 className="font-semibold">Recent Episodes</h4>

        <div className="mt-5 space-y-4">
          {episodes.map((episode, index) => (
            <div
              key={episode.id}
              className={cn(
                'space-y-2 border-b pb-4',
                index === episodes.length - 1 && 'border-b-0'
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {formatDate(episode.release_date)}
                  {/* {episode.release_date} */}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={'sm'}
                      onClick={() =>
                        handleCopy(episode.external_urls.spotify, episode.id)
                      }
                    >
                      {copiedEpisodeId === episode.id ? <Check /> : <Copy />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {copiedEpisodeId === episode.id
                        ? 'Copied'
                        : 'Copy episode link'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <h5 className="font-semibold line-clamp-2">{episode.name}</h5>
              <p className="text-sm text-muted-foreground line-clamp-5">
                {episode.description}
              </p>

              <div className="flex items-center justify-between py-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="font-semibold">
                      <Sparkles className="animate-pulse" />
                      <span className="hidden lg:inline lg:animate-pulse">
                        Activate Listen Helper
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="lg:hidden">
                    <p>Activate Listen Helper</p>
                  </TooltipContent>
                </Tooltip>
                {episode.audio_preview_url ? (
                  <audio
                    src={episode.audio_preview_url}
                    controls
                    className="max-w-md rounded"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
