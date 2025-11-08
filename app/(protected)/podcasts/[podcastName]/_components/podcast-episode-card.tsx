'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate } from '@/lib/helpers';
import { ApplePodcastEpisode } from '@/lib/queries/apple/apple-types';
import {
  IconAppleFilled,
  IconBrandApple,
  IconBrandSpotify,
} from '@tabler/icons-react';
import { Check, Copy, Loader, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EpisodeActionsProps {
  appleLink: string;
  spotifyLink: string | undefined;
}

function EpisodeActions({ appleLink, spotifyLink }: EpisodeActionsProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = async (provider: 'apple' | 'spotify', link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedUrl(link);

      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopiedUrl(null);
      toast.error('Unable to copy episode link');
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={'sm'}
            onClick={() => handleCopy('apple', appleLink)}
          >
            {copiedUrl === appleLink ? <Check /> : <IconBrandApple />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copiedUrl === appleLink ? 'Copied' : 'Copy episode link'}</p>
        </TooltipContent>
      </Tooltip>
      {!!spotifyLink && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={'sm'}
              onClick={() => handleCopy('spotify', spotifyLink)}
            >
              {copiedUrl === spotifyLink ? <Check /> : <IconBrandSpotify />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copiedUrl === spotifyLink ? 'Copied' : 'Copy episode link'}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

interface PodcastEpisodeCardProps {
  episode: ApplePodcastEpisode | undefined;
  spotifyLink: string | undefined;
  previewUrl: string | undefined;
}

export function PodcastEpisodeCard({
  episode,
  spotifyLink,
  previewUrl,
}: PodcastEpisodeCardProps) {
  if (!episode) return null;

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {formatDate(episode.releaseDate)}
        </p>
        <EpisodeActions
          appleLink={episode.trackViewUrl}
          spotifyLink={spotifyLink}
        />
      </div>
      <h5 className="font-semibold line-clamp-2">{episode.trackName}</h5>
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
        {previewUrl ? (
          <audio src={previewUrl} controls className="max-w-md rounded" />
        ) : null}
      </div>
    </div>
  );
}
