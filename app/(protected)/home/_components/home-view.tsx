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
    <div className="group p-5 w-[320px] h-[180px] border rounded-xl relative transition-all duration-300 flex flex-col">
      <span
        className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full animate-pulse ring-2 ring-background"
        style={{ backgroundColor: podcast.color }}
      />

      <div className="flex items-start gap-3 flex-1">
        <img
          src={podcast.image}
          alt={podcast.name}
          className="h-20 w-20 object-cover rounded-lg shadow-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold line-clamp-2 mb-1">{podcast.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {podcast.creatorName}
          </p>
        </div>
      </div>

      <Button className="w-full mt-4" variant="outline" asChild>
        <Link href={`/podcasts/${podcast.name}`}>
          Browse episodes <ArrowUpRight className="ml-1 h-4 w-4" />
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

  if (data === undefined) {
    return <LoadingScreen />;
  }

  return (
    <>
      <PageHeading title={title} />

      <div className="flex flex-col xl:flex-row items-start gap-8">
        <div className="space-y-6 w-full xl:w-auto">
          <div className="flex items-center gap-3 pb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PodcastIcon className="size-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Your Podcasts</h3>
          </div>
          {data?.podcasts && data?.podcasts.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 justify-items-center xl:justify-items-start gap-5">
              {data?.podcasts.map((podcast) => (
                <Podcast key={podcast.name} podcast={podcast} />
              ))}
            </div>
          ) : (
            <Empty className="-mt-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PodcastIcon className="size-5 text-primary" />
                </EmptyMedia>
                <EmptyTitle>No Podcasts found</EmptyTitle>
                <EmptyDescription>
                  You do not have any podcasts. To get started, visit the
                  preferences tab and add your preferred podcasts.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent></EmptyContent>
            </Empty>
          )}
        </div>

        <div className="space-y-6 w-full xl:w-auto mt-8 xl:mt-0">
          <div className="flex items-center gap-3 pb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BotIcon className="size-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Listen Agents</h3>
          </div>

          {data?.agentsGenerated && data?.agentsGenerated.length > 0 ? (
            <div className="flex flex-wrap justify-center xl:justify-start gap-5">
              {data.agentsGenerated.map((agent) => (
                <div
                  key={agent.trackId}
                  className="group p-5 w-[320px] h-[180px] border rounded-xl transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <img
                      src={agent.episodeImageUrl}
                      alt={agent.episodeTitle}
                      className="h-20 w-20 object-cover rounded-lg shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 mb-1">
                        {agent.episodeTitle}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {agent.episodeDescription}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4" variant="outline">
                    <Link href={`/listen-agent/${agent.trackId}`}>
                      Chat with Agent <BotIcon className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="-mt-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BotIcon className="size-5 text-primary" />
                </EmptyMedia>
                <EmptyTitle>No Listen Agents found</EmptyTitle>
                <EmptyDescription>
                  You do not have any listen agents yet. To get started, visit
                  any of your podcasts and generate a listen agent!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent></EmptyContent>
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
