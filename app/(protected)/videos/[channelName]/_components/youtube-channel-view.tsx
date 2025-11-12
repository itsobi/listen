'use client';

import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tooltip } from '@/components/ui/tooltip';
import { api } from '@/convex/_generated/api';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  YoutubeChannelStats,
  YoutubeVideo,
} from '@/lib/queries/youtube/youtube-types';
import {
  formatDate,
  decodeHtmlEntities,
  formatStatNumber,
} from '@/lib/helpers';
import { IconBrandYoutubeFilled } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import {
  Calendar,
  ExternalLink,
  Eye,
  TvMinimalPlay,
  UserRoundCheck,
  Video,
} from 'lucide-react';
import Link from 'next/link';

function ChannelStats({
  channelName,
  channelId,
  stats,
}: {
  channelName: string;
  channelId: string;
  stats: YoutubeChannelStats | null;
}) {
  const isMobile = useIsMobile();

  const videoPreferences = useQuery(
    api.videoPreferences.getVideoPreferencesByChannelId,
    {
      channelId: channelId,
    }
  );

  if (!stats || !videoPreferences) return null;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex items-center justify-center">
          {videoPreferences.image ? (
            <div className="relative">
              <IconBrandYoutubeFilled className="size-4 absolute top-1 right-1" />
              <img
                src={videoPreferences.image}
                alt={channelName}
                className="size-40 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <TvMinimalPlay className="size-40 rounded-lg object-cover" />
          )}
        </div>

        <div className="my-4">
          <div className="flex items-center justify-center gap-8">
            {[
              {
                icon: UserRoundCheck,
                label: 'Subscribers',
                value: stats.statistics.subscriberCount,
              },
              {
                icon: Video,
                label: 'Videos',
                value: stats.statistics.videoCount,
              },
              {
                icon: Eye,
                label: 'Views',
                value: stats.statistics.viewCount,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <Icon className="size-6" />
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="font-bold text-xl text-primary">
                    {formatStatNumber(stat.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-10">
      {videoPreferences.image ? (
        <img
          src={videoPreferences.image}
          alt={channelName}
          className="size-40 rounded-lg object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <TvMinimalPlay className="size-40 rounded-lg object-cover" />
      )}

      <div className="flex items-end gap-12 flex-wrap lg:w-full">
        {[
          {
            icon: UserRoundCheck,
            label: 'Subscribers',
            value: stats.statistics.subscriberCount,
          },
          {
            icon: Video,
            label: 'Videos',
            value: stats.statistics.videoCount,
          },
          {
            icon: Eye,
            label: 'Views',
            value: stats.statistics.viewCount,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label}>
              <Icon className="size-6" />
              <p className="text-muted-foreground">{stat.label}</p>
              <p className="font-bold text-xl text-primary">
                {formatStatNumber(stat.value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: YoutubeVideo }) {
  return (
    <div className="flex flex-col items-start w-full border rounded-lg p-4 shadow-sm">
      {video.snippet.thumbnails?.high?.url ? (
        <img
          src={video.snippet.thumbnails?.high?.url}
          alt={video.snippet.title}
          className="w-full aspect-[16/9] object-cover rounded-lg bg-muted"
          referrerPolicy="no-referrer"
        />
      ) : (
        <TvMinimalPlay className="w-full h-40 object-cover rounded-lg" />
      )}

      <div className="mt-4 space-y-2 flex-1">
        <h4 className="font-semibold">
          {decodeHtmlEntities(video.snippet.title)}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {decodeHtmlEntities(video.snippet.description)}
        </p>
      </div>
      <div className="flex items-center justify-between w-full mt-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="size-4" />{' '}
          {formatDate(video.snippet.publishedAt)}
        </p>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg"
            >
              <ExternalLink className="size-4 hover:text-primary/80" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Watch video</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function YoutubeChannelView({
  channelName,
  videos,
  stats,
}: {
  channelName: string;
  videos: YoutubeVideo[];
  stats: YoutubeChannelStats | null;
}) {
  return (
    <div>
      <ChannelStats
        channelName={channelName}
        channelId={videos[0].snippet.channelId}
        stats={stats}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id.videoId} video={video} />
        ))}
      </div>
    </div>
  );
}
