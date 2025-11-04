'use client';

import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tooltip } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { YoutubeVideo } from '@/lib/queries/youtube/youtube-types';
import { formatDate, decodeHtmlEntities } from '@/lib/utils';
import { Calendar, ExternalLink, TvMinimalPlay } from 'lucide-react';
import Link from 'next/link';

function VideoCard({ video }: { video: YoutubeVideo }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col items-start w-full border rounded-lg p-4 shadow-sm">
        {video.snippet.thumbnails?.high?.url ? (
          <img
            src={video.snippet.thumbnails?.high?.url}
            alt={video.snippet.title}
            className="w-full h-40 object-cover rounded-lg"
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
                className="p-2 rounded-lg bg-primary text-primary-foreground"
              >
                <ExternalLink className="size-4" />
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

  return (
    <Link
      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-start w-full border rounded-lg p-4 shadow-sm hover:bg-muted-foreground/10"
    >
      {video.snippet.thumbnails?.high?.url ? (
        <img
          src={video.snippet.thumbnails?.high?.url}
          alt={video.snippet.title}
          className="w-full h-40 object-cover rounded-lg"
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
      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-4">
        <Calendar className="size-4" /> {formatDate(video.snippet.publishedAt)}
      </p>
    </Link>
  );
}

export function YoutubeChannelView({ videos }: { videos: YoutubeVideo[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id.videoId} video={video} />
      ))}
    </div>
  );
}
