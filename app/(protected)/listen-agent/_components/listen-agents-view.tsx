'use client';

import { LoadingScreen } from '@/components/global/loading-screen';
import { ListenAgentCard } from '@/components/listen-agent/listen-agent-card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
  EmptyMedia,
  EmptyHeader,
} from '@/components/ui/empty';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Bot } from 'lucide-react';

export function ListenAgentsView() {
  const agentsGenerated = useQuery(api.agentsGenerated.getAgentsGenerated);
  if (agentsGenerated === undefined) {
    return <LoadingScreen />;
  }

  if (agentsGenerated && agentsGenerated.length === 0) {
    return (
      <Empty className="flex flex-col items-center justify-center h-[calc(100vh-20rem)]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bot />
          </EmptyMedia>
          <EmptyTitle>No agents found</EmptyTitle>
          <EmptyDescription>
            You do not have any agents generated. Go to into any of your
            podcasts and generate an agent to get started!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {agentsGenerated?.map((agent) => (
        <ListenAgentCard key={agent.trackId} agent={agent} />
      ))}
    </div>
  );
}
