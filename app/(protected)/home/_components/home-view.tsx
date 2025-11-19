'use client';

import { LoadingScreen } from '@/components/global/loading-screen';
import { PageHeading } from '@/components/global/page-heading';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { PodcastIcon, ArrowUpRight, BotIcon } from 'lucide-react';
import Link from 'next/link';

interface Podcast {
  name: string;
  creatorName: string;
  color: string;
  image?: string;
}

function Podcast({ podcast }: { podcast: Podcast }) {
  return (
    <div className="p-4 min-w-[300px] border rounded space-y-4 relative">
      <span
        className="absolute top-1 right-1 h-3 w-3 rounded-[4px] animate-pulse"
        style={{ backgroundColor: podcast.color }}
      />
      <div className="">
        <p className="line-clamp-1">{podcast.name}</p>
        <p className="text-sm text-muted-foreground">{podcast.creatorName}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <img
          src={podcast.image}
          alt={podcast.name}
          className="h-16 w-16 object-cover rounded-sm"
        />
      </div>

      <Button className="w-full" asChild>
        <Link href={`/podcasts/${podcast.name}`}>
          <ArrowUpRight /> Browse episodes
        </Link>
      </Button>
    </div>
  );
}

export function HomeView() {
  const { user } = useUser();
  const title =
    user === undefined
      ? 'Home'
      : `Hello, ${user?.firstName || user?.emailAddresses[0]?.emailAddress}`;

  const data = useQuery(api.homeData.getHomeData);

  console.log(data);

  if (data === undefined) {
    return <LoadingScreen />;
  }

  return (
    <>
      <PageHeading title={title} />

      <div className="flex flex-col xl:flex-row gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PodcastIcon className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Your Podcasts</h3>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4  max-w-3xl">
            {data?.podcasts && data?.podcasts.length > 0 ? (
              data?.podcasts.map((podcast) => (
                <Podcast key={podcast.name} podcast={podcast} />
              ))
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PodcastIcon className="size-5 text-primary" />
                  </EmptyMedia>
                  <EmptyTitle>No podcasts found</EmptyTitle>
                  <EmptyDescription>
                    You do not have any podcasts. Add a podcast to get started.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button>
                    <Link href="/preferences">Add a podcast</Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PodcastIcon className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Listen Agents</h3>
          </div>

          {data?.agentsGenerated && data?.agentsGenerated.length > 0 ? (
            data?.agentsGenerated.map((agent) => (
              <div className="xl:max-w-[400px] space-y-4 border-b pb-4">
                <div className="flex items-center gap-2">
                  <img
                    src={agent.episodeImageUrl}
                    alt={agent.episodeTitle}
                    className="h-16 w-16 object-cover rounded-sm"
                  />
                  <p key={agent.trackId} className="text-sm line-clamp-2">
                    {agent.episodeTitle}
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/listen-agent/${agent.trackId}`}>
                    <BotIcon /> Chat with Listen Agent
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PodcastIcon className="size-5 text-primary" />
                </EmptyMedia>
                <EmptyTitle>No listen agents found</EmptyTitle>
                <EmptyDescription>
                  You do not have any listen agents. Go to into any of your
                  podcasts and generate an agent to get started.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {data?.podcasts.map((podcast) => (
                  <Button key={podcast.name} asChild>
                    <Link href={`/podcasts/${podcast.name}`}>
                      <ArrowUpRight /> {podcast.name}
                    </Link>
                  </Button>
                ))}
              </EmptyContent>
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
