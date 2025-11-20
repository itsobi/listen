'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/convex/_generated/api';
import { checkProPlanStatus } from '@/lib/actions';
import { formatDate, getEpisodeDuration } from '@/lib/helpers';
import { ApplePodcastEpisode } from '@/lib/queries/apple/apple-types';
import { IconBrandApple, IconBrandSpotify } from '@tabler/icons-react';
import { useMutation, useQuery } from 'convex/react';
import { Bot, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface EpisodeActionsProps {
  appleLink: string;
  spotifyLink: string | undefined;
}

function EpisodeActions({ appleLink, spotifyLink }: EpisodeActionsProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = async (link: string) => {
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
            variant="outline"
            size={'sm'}
            onClick={() => handleCopy(appleLink)}
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
              variant="outline"
              size={'sm'}
              onClick={() => handleCopy(spotifyLink)}
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
  const { hours, minutes } = getEpisodeDuration(episode.trackTimeMillis);
  const router = useRouter();
  const agentAlreadyGenerated = useQuery(
    api.agentsGenerated.agentAlreadyGenerated,
    {
      trackId: episode.trackId,
    }
  );
  const generateListenAgent = useMutation(api.workflowTools.kickoffWorkflow);

  const handleGenerateListenAgent = async () => {
    if (agentAlreadyGenerated?.isAlreadyGenerated) {
      router.push(`/listen-agent/${episode.trackId.toString()}`);
      return;
    }

    const isOnProPlan = await checkProPlanStatus();
    if (!isOnProPlan && (agentAlreadyGenerated?.agentCount ?? 0) >= 1) {
      toast.error(
        'Sorry, you must be on the Pro plan to generate more Listen Agents.'
      );
      return;
    }

    await generateListenAgent({
      episodeTitle: episode.trackName,
      episodeDescription: episode.description,
      episodeImageUrl: episode.artworkUrl600,
      releaseDate: episode.releaseDate,
      status: 'in-progress',
      trackId: episode.trackId,
      audioUrl: episode.episodeUrl,
    });
    router.push(`/listen-agent`);
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {formatDate(episode.releaseDate)}
          </p>
          <span className="text-muted-foreground">•</span>
          <p className="text-sm text-muted-foreground">
            {hours > 0 ? `${hours}h` : ''} {minutes}m
          </p>
        </div>
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
            <Button
              variant="outline"
              className="font-semibold"
              onClick={handleGenerateListenAgent}
            >
              <Bot className="animate-pulse" />
              <span className="hidden lg:inline lg:animate-pulse">
                Listen Agent
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="lg:hidden">
            <p>Listen Agent</p>
          </TooltipContent>
        </Tooltip>
        {previewUrl ? (
          <audio src={previewUrl} controls className="max-w-md rounded" />
        ) : null}
      </div>
    </div>
  );
}
