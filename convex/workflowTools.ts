import { v } from 'convex/values';
import { workflow } from '.';
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from './_generated/server';

import { api, internal } from './_generated/api';
import { AgentStatus } from '@/lib/helpers';
import { Id } from './_generated/dataModel';

export const transcribeAudioInternalAction = internalAction({
  args: { userId: v.string(), audioUrl: v.string(), trackId: v.number() },
  handler: async (ctx, args): Promise<Id<'_storage'> | undefined> => {
    const storageId = await ctx.runAction(
      api.transcribeAudio.transcribeAudioAction,
      {
        userId: args.userId,
        audioUrl: args.audioUrl,
        trackId: args.trackId,
      }
    );

    return storageId;
  },
});

export const createAgentTranscript = internalMutation({
  args: {
    trackId: v.number(),
    storageId: v.id('_storage'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.storageId) {
      await ctx.runMutation(internal.workflowTools.updateAgentStatus, {
        userId: args.userId,
        trackId: args.trackId,
        status: AgentStatus.FAILED,
        errorMessage: 'Unable to transcribe audio',
      });
      throw new Error('Unable to transcribe audio');
    }
    const transcriptId = await ctx.db.insert('agentTranscripts', {
      trackId: args.trackId,
      storageId: args.storageId,
    });
    return transcriptId;
  },
});

export const initializeAgentForUser = internalMutation({
  args: {
    userId: v.string(),
    trackId: v.number(),
    episodeTitle: v.string(),
    episodeDescription: v.string(),
    episodeImageUrl: v.optional(v.string()),
    releaseDate: v.string(),
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
            episodeDescription: args.episodeDescription,
            episodeImageUrl: args.episodeImageUrl,
            releaseDate: args.releaseDate,
            status: 'in-progress' as const,
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
          episodeDescription: args.episodeDescription,
          episodeImageUrl: args.episodeImageUrl,
          releaseDate: args.releaseDate,
          status: 'in-progress' as const,
          createdAt: Date.now(),
        },
      ];

      await ctx.db.patch(userAgents._id, {
        episodes: updatedEpisodes,
      });
      return;
    }
  },
});

export const updateAgentTranscript = internalMutation({
  args: {
    userId: v.string(),
    trackId: v.number(),
    status: v.union(
      v.literal('in-progress'),
      v.literal('completed'),
      v.literal('failed')
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

export const updateAgentStatus = internalMutation({
  args: {
    userId: v.string(),
    trackId: v.number(),
    status: v.union(
      v.literal('in-progress'),
      v.literal('completed'),
      v.literal('failed')
    ),
    errorMessage: v.optional(v.string()),
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
        ? { ...episode, status: args.status, errorMessage: args.errorMessage }
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
    episodeDescription: v.string(),
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

    if (isAlreadyGenerated.isAlreadyGenerated)
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
        episodeDescription: args.episodeDescription,
        episodeImageUrl: args.episodeImageUrl,
        releaseDate: args.releaseDate,
        status: args.status,
      }
    );

    await workflow.cleanup(ctx, workflowId);
    return workflowId;
  },
});

export const checkIfTranscriptExists = internalQuery({
  args: {
    trackId: v.number(),
  },
  handler: async (ctx, args) => {
    const transcript = await ctx.db
      .query('agentTranscripts')
      .withIndex('by_track_id', (q) => q.eq('trackId', args.trackId))
      .first();

    if (transcript?.storageId) return transcript.storageId;

    return false;
  },
});
