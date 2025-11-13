'use client';

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { MessageCircleIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

type AgentGenerated = {
  trackId: number;
  episodeTitle: string;
  releaseDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  episodeImageUrl?: string | undefined;
};

const statusColor = {
  pending: 'text-yellow-500',
  'in-progress': 'text-blue-500',
  completed: 'text-green-500',
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
        <p className="text-sm text-muted-foreground">
          Generated on: {formatDate(agent.releaseDate)}
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => router.push(`/listen-agent/${agent.trackId}`)}
          variant={theme === 'dark' ? 'outline' : 'default'}
        >
          <MessageCircleIcon /> Chat with Listen Agent
        </Button>
      </div>
    </div>
  );
}

export function ListenAgentsView() {
  const agentsGenerated = useQuery(api.agentsGenerated.getAgentsGenerated);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {agentsGenerated?.map((agent) => (
        <ListenAgentCard key={agent.trackId} agent={agent} />
      ))}
    </div>
  );
}
