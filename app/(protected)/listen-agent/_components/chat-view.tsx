'use client';

import { LoadingScreen } from '@/components/global/loading-screen';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyDescription,
  EmptyTitle,
  EmptyContent,
} from '@/components/ui/empty';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Chat } from './chat';

export function NoTranscriptFound() {
  const router = useRouter();
  return (
    <Empty className="flex flex-col items-center justify-center h-[calc(100vh-20rem)]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Bot />
        </EmptyMedia>
        <EmptyTitle>No transcript found</EmptyTitle>
        <EmptyDescription>
          You do not have access to this transcript.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => router.replace('/listen-agent')}>
          Go back to listen agents
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function ChatView({ trackId }: { trackId: string }) {
  const agentTranscript = useQuery(api.agentTranscripts.getAgentTranscript, {
    trackId: parseInt(trackId), // the trackId is a number from apple api, so we need to parse it to an integer
  });

  if (agentTranscript === undefined) {
    return <LoadingScreen />;
  }

  if (!agentTranscript) {
    return <NoTranscriptFound />;
  }

  return (
    <Chat
      transcriptUrl={agentTranscript.transcriptUrl}
      trackId={trackId}
      episodeTitle={agentTranscript.episodeTitle}
      episodeDescription={agentTranscript.episodeDescription}
      episodeImageUrl={agentTranscript.episodeImageUrl}
      agentStatus={agentTranscript.agentStatus}
    />
  );
}
