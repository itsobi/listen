'use client';

import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { BotIcon, MessageCircleIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const statusColor = {
  'in-progress': 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

type AgentGenerated = {
  trackId: number;
  episodeTitle: string;
  episodeDescription: string;
  releaseDate: string;
  status: 'in-progress' | 'completed' | 'failed';
  createdAt: number;
  episodeImageUrl?: string | undefined;
  errorMessage?: string | undefined;
};

export function ListenAgentCard({ agent }: { agent: AgentGenerated }) {
  const router = useRouter();

  return (
    <div className="space-y-4 border-b pb-4">
      <div className="flex gap-4">
        <img
          src={agent.episodeImageUrl}
          alt={agent.episodeTitle}
          className="h-16 w-16 object-cover rounded-sm"
        />
        <div>
          <p className="font-semibold">{agent.episodeTitle}</p>
          <p className="text-sm text-muted-foreground line-clamp-4">
            {agent.episodeDescription}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <div className="space-y-1 text-xs">
            <p className="text-xs text-muted-foreground">
              Status:{' '}
              <span
                className={cn(
                  'capitalize',
                  statusColor[agent.status],
                  agent.status === 'in-progress' && 'animate-pulse'
                )}
              >
                {agent.status}{' '}
                {agent.status === 'failed' && `(${agent.errorMessage})`}
              </span>
            </p>
            <p className="text-muted-foreground">
              Generated on: {formatDate(agent.releaseDate)}
            </p>
          </div>

          {agent.status === 'completed' && (
            <div className="flex justify-end">
              <Button
                onClick={() => router.push(`/listen-agent/${agent.trackId}`)}
                className="w-full"
              >
                <BotIcon /> Chat with Listen Agent
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
