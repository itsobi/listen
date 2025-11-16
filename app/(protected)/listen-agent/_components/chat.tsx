import { Matrix, wave } from '@/components/ui/matrix';
import { NoTranscriptFound } from './chat-view';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useAuth } from '@clerk/nextjs';
import { generateChatKey } from '@/lib/helpers';
import { DefaultChatTransport } from 'ai';
import { Loader, RefreshCcwIcon, SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { checkProPlanStatus } from '@/lib/actions';

interface Props {
  trackId: string;
  transcriptUrl: string | false | null | undefined;
  episodeTitle: string | undefined;
  episodeDescription: string | undefined;
  episodeImageUrl: string | undefined;
  agentStatus: string | undefined;
}

export function Chat({
  trackId,
  transcriptUrl,
  episodeTitle,
  episodeDescription,
  episodeImageUrl,
  agentStatus,
}: Props) {
  const { userId } = useAuth();
  const scrollToBottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const chatKey = userId ? generateChatKey({ userId, trackId }) : null;

  const storedMessages = useQuery(
    api.chats.loadMessages,
    chatKey ? { chatKey } : 'skip'
  );

  const {
    messages: liveMessages,
    sendMessage,
    status,
    error,
    regenerate,
  } = useChat({
    id: chatKey || 'default', // Reset state per chat to prevent duplication
    transport: new DefaultChatTransport({
      api: `/api/chat`,
      // only send last message to server
      prepareSendMessagesRequest({ messages, body }) {
        return { body: { ...body, message: messages[messages.length - 1] } };
      },
    }),
  });

  const handleSubmit = async () => {
    if (!userId || !input) return;

    if (status !== 'ready') {
      toast.error('Agent is not ready yet.');
      return;
    }

    const isOnProPlan = await checkProPlanStatus();

    const userMessageCount = allMessages.filter(
      (m) => m.role === 'user'
    ).length;

    if (!isOnProPlan && userMessageCount >= 2) {
      toast.error(
        'Sorry, you must be on the Pro plan to continue to use this Listen Agent.'
      );
      return;
    }

    sendMessage(
      {
        text: input.trim(),
      },
      {
        body: {
          transcriptUrl,
          chatKey,
          trackId,
          episodeDescription,
        },
      }
    );
    setInput('');
  };

  const allMessages = useMemo(() => {
    // If we have stored messages and no pending live messages, just use stored
    if (storedMessages && storedMessages.length > 0 && status === 'ready') {
      return storedMessages;
    }

    const stored = storedMessages || [];
    const live = liveMessages || [];

    // During streaming, merge stored + live (deduplicating)
    const storedIds = new Set(stored.map((m) => m.id));
    const uniqueLive = live.filter((m) => !storedIds.has(m.id));

    return [...stored, ...uniqueLive];
  }, [storedMessages, liveMessages, status]);

  console.log(JSON.stringify(allMessages, null, 2));

  useEffect(() => {
    if (scrollToBottomRef.current) {
      // Use setTimeout to ensure DOM has updated before scrolling
      setTimeout(() => {
        scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [allMessages, status]);

  if (!transcriptUrl) {
    return <NoTranscriptFound />;
  }

  if (agentStatus === 'in-progress') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)]">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">
            This episode is being processed...
          </h2>
          <p className="text-sm text-muted-foreground">
            Feel free to leave this page. We will send you a notification when
            it&apos;s ready.
          </p>
        </div>
        <Matrix
          rows={7}
          cols={7}
          frames={wave}
          fps={20}
          loop
          size={32}
          ariaLabel="Wave animation"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full max-w-4xl mx-auto ">
      {/* Chat Messages */}
      <div className="flex items-center gap-2">
        <img
          src={episodeImageUrl}
          alt={episodeTitle}
          className="w-20 h-20 lg:w-25 lg:h-25 rounded-sm"
        />
        <p className="text-sm lg:text-lg font-semibold">{episodeTitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-10 space-y-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:scrollbar-width:thin">
        {allMessages.length > 0 ? (
          allMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-sm 
              ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }
            `}
              >
                {message.parts.map((part, index) =>
                  part.type === 'text' ? (
                    <span key={index}>{part.text}</span>
                  ) : null
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          </div>
        )}

        {status === 'submitted' && (
          <div className="flex flex-col items-center justify-center">
            <Loader className="text-center animate-spin" />
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Thinking...
            </p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-sm text-red-500">{error.message}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => regenerate()}
            >
              <RefreshCcwIcon className="size-4" /> Regenerate
            </Button>
          </div>
        )}
        <div ref={scrollToBottomRef} />
      </div>

      {/* Input at the bottom */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex gap-2 border px-4 py-2 rounded-full"
      >
        <input
          type="text"
          placeholder="Ask me anything about this episode…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          className="flex-1 border-none outline-none"
          autoComplete="off"
        />

        <Button
          type="submit"
          disabled={!input.trim() || status !== 'ready'}
          variant="default"
          className={cn(
            'flex items-center justify-center shrink-0 rounded-full',

            status !== 'ready' && 'opacity-50 cursor-not-allowed'
          )}
        >
          <SendIcon className="size-4" />
        </Button>
      </form>
    </div>
  );
}
