import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

export async function POST(request: Request) {
  const {
    messages,
    userId,
    transcriptUrl,
    trackId,
  }: {
    messages: UIMessage[];
    userId: string;
    transcriptUrl: string;
    trackId: string;
  } = await request.json();

  if (!userId || !transcriptUrl || !trackId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
    });
  }

  const transcript = await fetch(transcriptUrl);

  if (!transcript.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch transcript' }),
      { status: 500 }
    );
  }

  const transcriptText = await transcript.text();

  // load existing messages and append the new one
  //   const messages = await ctx.runQuery(internal.chat.loadMessages, {
  //     chatKey: generateChatKey({ userId, trackId }),
  //   });

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a podcast expert who is ONLY allowed to answer questions about this podcast transcript:\n\n${transcriptText}.`,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
