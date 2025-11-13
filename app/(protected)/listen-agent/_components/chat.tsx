import { Matrix, wave } from '@/components/ui/matrix';
import { NoTranscriptFound } from './chat-view';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useAuth } from '@clerk/nextjs';
import { generateChatKey } from '@/lib/helpers';
import { DefaultChatTransport } from 'ai';
import { Loader, RefreshCcwIcon, SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const dummyMessages = [
  {
    id: '1',
    role: 'user',
    content: 'Hello, how are you?',
  },
  //   {
  //     id: '2',
  //     role: 'assistant',
  //     content: 'I am good, thank you!',
  //   },
  //   {
  //     id: '3',
  //     role: 'user',
  //     content: 'What is your name?',
  //   },
  //   {
  //     id: '4',
  //     role: 'assistant',
  //     content: 'My name is John Doe.',
  //   },
  //   {
  //     id: '5',
  //     role: 'user',
  //     content: 'What is your favorite color?',
  //   },
  //   {
  //     id: '6',
  //     role: 'assistant',
  //     content: 'My favorite color is blue.',
  //   },
  //   {
  //     id: '7',
  //     role: 'user',
  //     content: 'What is your favorite food?',
  //   },
  //   {
  //     id: '8',
  //     role: 'assistant',
  //     content: 'My favorite food is pizza.',
  //   },
  //   {
  //     id: '9',
  //     role: 'user',
  //     content: 'What is your favorite animal?',
  //   },
  //   {
  //     id: '10',
  //     role: 'assistant',
  //     content: 'My favorite animal is a dog.',
  //   },
];

interface Props {
  trackId: string;
  transcriptUrl: string | false | null | undefined;
  episodeTitle: string | undefined;
  episodeImageUrl: string | undefined;
  agentStatus: string | undefined;
}

export function Chat({
  trackId,
  transcriptUrl,
  episodeTitle,
  episodeImageUrl,
  agentStatus,
}: Props) {
  const { messages, sendMessage, status, error, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat`,
    }),
  });
  const [input, setInput] = useState('');
  const { userId } = useAuth();

  const handleSubmit = () => {
    if (!userId || !input) return;

    if (status !== 'ready') {
      toast.error('Agent is not ready yet.');
      return;
    }

    sendMessage(
      {
        text: input.trim(),
      },
      {
        body: {
          userId,
          transcriptUrl,
          chatKey: generateChatKey({ userId, trackId }),
          trackId,
        },
      }
    );
    setInput('');
  };

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
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {messages.length > 0 ? (
          messages.map((message) => (
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
          <div className="flex items-center justify-center">
            <Loader className="text-center animate-spin" />
          </div>
        )}
        {error && (
          <p className="text-center text-sm text-red-500">{error.message}</p>
        )}
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
          // disabled={status === "loading"}
          className="flex-1 border-none outline-none"
          autoComplete="off"
        />
        {error && (
          <Button
            type="button"
            variant="outline"
            onClick={() => regenerate()}
            className="flex items-center justify-center shrink-0 rounded-full"
          >
            <RefreshCcwIcon className="size-4" />
          </Button>
        )}
        <Button
          type="submit"
          disabled={!input.trim() || status !== 'ready'}
          variant="default"
          className={cn(
            'flex items-center justify-center shrink-0 rounded-full',
            Boolean(input.length > 0) && 'animate-pulse',
            status !== 'ready' && 'opacity-50 cursor-not-allowed'
          )}
        >
          <SendIcon className="size-4" />
        </Button>
      </form>
    </div>
  );
}
