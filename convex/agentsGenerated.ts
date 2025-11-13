import { v } from 'convex/values';
import { query } from './_generated/server';

export const getAgentsGenerated = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) return null;

    const userAgents = await ctx.db
      .query('agentsGenerated')
      .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
      .first();

    const sortedEpisodes = userAgents?.episodes
      ? [...userAgents.episodes].sort((a, b) => b.createdAt - a.createdAt)
      : [];

    return sortedEpisodes;
  },
});

export const agentAlreadyGenerated = query({
  args: {
    trackId: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Unauthorized');

    const userAgents = await ctx.db
      .query('agentsGenerated')
      .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
      .first();

    if (!userAgents) return false;

    return userAgents.episodes.some(
      (episode) => episode.trackId === args.trackId
    );
  },
});
