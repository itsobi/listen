import { v } from 'convex/values';
import { query } from './_generated/server';

export const getWorkflowStatus = query({
  args: {
    trackId: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error('Not authorized');

    const userAgents = await ctx.db
      .query('agentsGenerated')
      .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
      .first();

    if (!userAgents) throw new Error('User has no agents generated');

    const agent = userAgents.episodes.find(
      (episode) => episode.trackId === args.trackId
    );

    if (!agent) throw new Error('Agent not found');

    return agent.status;
  },
});
