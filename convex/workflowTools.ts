import { v } from 'convex/values';
import { workflow } from '.';
import {
  internalAction,
  internalMutation,
  mutation,
} from './_generated/server';
import { experimental_transcribe as transcribe } from 'ai';
import { openai } from '@ai-sdk/openai';
import { api, internal } from './_generated/api';

export const transcribeAudio = internalAction({
  args: { audioUrl: v.string(), trackId: v.number() },
  handler: async (ctx, args) => {
    if (!args.audioUrl) throw new Error('Audio URL is required');

    const response = await fetch(args.audioUrl);

    if (!response.ok) throw new Error('Failed to fetch audio');

    const audioBuffer = await response.arrayBuffer();

    const { text: transcription } = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: audioBuffer,
    });

    const file = new File([transcription], 'transcription.txt', {
      type: 'text/plain',
    });
    const storageId = await ctx.storage.store(file);

    return storageId;
  },
});

export const createAgentTranscript = internalMutation({
  args: {
    trackId: v.number(),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const transcriptId = await ctx.db.insert('agentTranscripts', {
      trackId: args.trackId,
      storageId: args.storageId,
    });
    return transcriptId;
  },
});

export const updateAgentStatus = internalMutation({
  args: {
    userId: v.string(),
    trackId: v.number(),
    episodeTitle: v.string(),
    episodeImageUrl: v.optional(v.string()),
    releaseDate: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('in-progress'),
      v.literal('completed')
    ),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error('Not authorized');

    const userAgents = await ctx.db
      .query('agentsGenerated')
      .withIndex('by_user_id', (q) => q.eq('user_id', args.userId))
      .first();

    if (!userAgents) {
      await ctx.db.insert('agentsGenerated', {
        user_id: args.userId,
        episodes: [
          {
            trackId: args.trackId,
            episodeTitle: args.episodeTitle,
            episodeImageUrl: args.episodeImageUrl,
            releaseDate: args.releaseDate,
            status: args.status,
            createdAt: Date.now(),
          },
        ],
      });
      return;
    }

    const agent = userAgents.episodes.find(
      (episode) => episode.trackId === args.trackId
    );

    if (!agent) {
      // If agent doesn't exist, add it to the episodes array
      const updatedEpisodes = [
        ...userAgents.episodes,
        {
          trackId: args.trackId,
          episodeTitle: args.episodeTitle,
          episodeImageUrl: args.episodeImageUrl,
          releaseDate: args.releaseDate,
          status: args.status,
          createdAt: Date.now(),
        },
      ];

      await ctx.db.patch(userAgents._id, {
        episodes: updatedEpisodes,
      });
      return;
    }

    // update agent status for the given track id
    const updatedEpisodes = userAgents.episodes.map((episode) =>
      episode.trackId === args.trackId
        ? { ...episode, status: args.status }
        : episode
    );

    await ctx.db.patch(userAgents._id, {
      episodes: updatedEpisodes,
    });
  },
});

export const updateAgentTranscript = internalMutation({
  args: {
    userId: v.string(),
    trackId: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('in-progress'),
      v.literal('completed')
    ),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error('Not authorized');

    const userAgents = await ctx.db
      .query('agentsGenerated')
      .withIndex('by_user_id', (q) => q.eq('user_id', args.userId))
      .first();

    if (!userAgents) throw new Error('User has no agents generated');

    const updatedEpisodes = userAgents.episodes.map((episode) =>
      episode.trackId === args.trackId
        ? {
            ...episode,
            status: args.status,
          }
        : episode
    );

    await ctx.db.patch(userAgents._id, {
      episodes: updatedEpisodes,
    });
  },
});

export const kickoffWorkflow = mutation({
  args: {
    trackId: v.number(),
    audioUrl: v.string(),
    episodeTitle: v.string(),
    episodeImageUrl: v.optional(v.string()),
    releaseDate: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Not authorized');

    const isAlreadyGenerated = await ctx.runQuery(
      api.agentsGenerated.agentAlreadyGenerated,
      {
        trackId: args.trackId,
      }
    );

    if (isAlreadyGenerated)
      throw new Error('Listen Agent already generated for this episode');

    const userId = user.subject;

    const workflowId = await workflow.start(
      ctx,
      internal.index.listenAgentWorkflow,
      {
        userId,
        trackId: args.trackId,
        audioUrl: args.audioUrl,
        episodeTitle: args.episodeTitle,
        episodeImageUrl: args.episodeImageUrl,
        releaseDate: args.releaseDate,
        status: args.status,
      }
    );

    await workflow.cleanup(ctx, workflowId);
    return workflowId;
  },
});
