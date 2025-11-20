import { api } from '@/convex/_generated/api';
import { generateChatKey } from '@/lib/helpers';
import { openai } from '@ai-sdk/openai';
import { auth } from '@clerk/nextjs/server';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { ConvexHttpClient } from 'convex/browser';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const {
    message,
    transcriptUrl,
    trackId,
    episodeDescription,
  }: {
    message: UIMessage;
    transcriptUrl: string;
    trackId: string;
    episodeDescription: string;
  } = await request.json();

  if (!transcriptUrl || !trackId || !episodeDescription) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
    });
  }

  // Get Transcript
  const transcript = await fetch(transcriptUrl);

  if (!transcript.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch transcript' }),
      { status: 500 }
    );
  }

  const transcriptText = await transcript.text();

  // Get existing messages

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return new Response(JSON.stringify({ error: 'Missing CONVEX_URL' }), {
      status: 500,
    });
  }

  const convex = new ConvexHttpClient(convexUrl);

  const chatKey = generateChatKey({ userId, trackId });

  const storedMessages = await convex.query(api.chats.loadMessages, {
    chatKey,
  });

  // All messages for AI context (includes stored + new user message)
  const messages = [
    ...(storedMessages || []),
    {
      id: message.id,
      role: message.role,
      parts: message.parts,
    },
  ];

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a podcast expert who is ONLY allowed to answer questions about this podcast. Here is the episode description for context about the episode:\n\n${episodeDescription}\n\nAnd here is the transcript of the episode:\n\n${transcriptText}.`,
    messages: convertToModelMessages(messages),
  });

  const storedMessageIds = new Set((storedMessages || []).map((m) => m.id));

  return result.toUIMessageStreamResponse({
    // Only send NEW messages to client, not stored ones (prevents duplicates)
    originalMessages: [
      {
        id: message.id,
        role: message.role,
        parts: message.parts,
      },
    ],
    onFinish: async ({ messages }) => {
      // First, ensure all messages have IDs
      const messagesWithIds = messages.map((msg) => ({
        ...msg,
        id: msg.id || crypto.randomUUID(), // Generate ID if missing
      }));

      // Then filter out messages that were originally from storage
      const newMessages = messagesWithIds.filter(
        (msg) => !storedMessageIds.has(msg.id)
      );

      await convex.mutation(api.chats.saveMessages, {
        chatKey,
        messages: newMessages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.parts
            .filter((p) => p.type === 'text')
            .map((p) => p.text)
            .join(''),
          createdAt: Date.now(),
        })),
      });
    },
  });
}
