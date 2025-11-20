import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const updateAgentStatusTool = mutation({
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
