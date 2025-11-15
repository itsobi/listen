'use client';

import { LoadingScreen } from '@/components/global/loading-screen';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
  EmptyMedia,
  EmptyHeader,
} from '@/components/ui/empty';
import { api } from '@/convex/_generated/api';
import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { Bot, MessageCircleIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

type AgentGenerated = {
  trackId: number;
  episodeTitle: string;
  releaseDate: string;
  status: 'in-progress' | 'completed' | 'failed';
  episodeImageUrl?: string | undefined;
  errorMessage?: string | undefined;
};

const statusColor = {
  'in-progress': 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

function ListenAgentCard({ agent }: { agent: AgentGenerated }) {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <div className="border-b p-4 space-y-4">
      <div className="flex items-center gap-2">
        <img
          src={agent.episodeImageUrl}
          alt={agent.episodeTitle}
          className="h-16 w-16 object-cover rounded-sm"
        />
        <div>
          <p className="font-semibold">{agent.episodeTitle}</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <p className="text-sm text-muted-foreground">
            Status:{' '}
            <span
              className={cn(
                'capitalize',
                statusColor[agent.status],
                agent.status === 'in-progress' && 'animate-pulse'
              )}
            >
              {agent.status}
            </span>
          </p>
          {agent.status === 'failed' && (
            <p className="text-sm text-muted-foreground">
              ({agent.errorMessage})
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Generated on: {formatDate(agent.releaseDate)}
        </p>
      </div>

      {agent.status === 'completed' && (
        <div className="flex justify-end">
          <Button
            onClick={() => router.push(`/listen-agent/${agent.trackId}`)}
            variant={theme === 'dark' ? 'outline' : 'default'}
          >
            <MessageCircleIcon /> Chat with Listen Agent
          </Button>
        </div>
      )}
    </div>
  );
}

export function ListenAgentsView() {
  const agentsGenerated = useQuery(api.agentsGenerated.getAgentsGenerated);
  const router = useRouter();
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
            podcasts and generate an agent to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* <Button onClick={() => router.replace('/listen-agent')}>
          Generate an agent
        </Button> */}
        </EmptyContent>
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
