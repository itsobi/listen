'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { AgentStatus } from '@/lib/helpers';
import { AssemblyAI } from 'assemblyai';

if (!process.env.ASSEMBLY_AI_KEY) {
  throw new Error('ASSEMBLY_AI_KEY is not set');
}
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_KEY,
});

export const transcribeAudioAction = action({
  args: { userId: v.string(), audioUrl: v.string(), trackId: v.number() },
  handler: async (ctx, args) => {
    try {
      if (!args.audioUrl) throw new Error('Audio URL is required');

      const transcript = await client.transcripts.transcribe({
        audio: args.audioUrl,
        speech_model: 'universal',
      });

      if (transcript.error) {
        await ctx.runMutation(internal.workflowTools.updateAgentStatus, {
          userId: args.userId,
          trackId: args.trackId,
          status: AgentStatus.FAILED,
          errorMessage: transcript.error,
        });
        throw new Error(transcript.error);
      }

      if (!transcript.text) {
        await ctx.runMutation(internal.workflowTools.updateAgentStatus, {
          userId: args.userId,
          trackId: args.trackId,
          status: AgentStatus.FAILED,
          errorMessage: 'Unable to transcribe audio',
        });
        throw new Error('Unable to transcribe audio');
      }

      // Create File with proper content-type
      const transcriptionFile = new File(
        [transcript.text],
        'transcription.txt',
        { type: 'text/plain' }
      );

      const storageId = await ctx.storage.store(transcriptionFile);

      return storageId;
    } catch (error) {
      console.error(error);

      await ctx.runMutation(internal.workflowTools.updateAgentStatus, {
        userId: args.userId,
        trackId: args.trackId,
        status: AgentStatus.FAILED,
        errorMessage:
          error instanceof Error ? error.message : 'Unable to transcribe audio',
      });

      throw error;
    }
  },
});
