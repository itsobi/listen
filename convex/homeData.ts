import { query } from './_generated/server';

export const getHomeData = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return null;

    const userId = user.subject;

    const [userAgents, preferences] = await Promise.all([
      ctx.db
        .query('agentsGenerated')
        .withIndex('by_user_id', (q) => q.eq('user_id', userId))
        .first(),
      ctx.db
        .query('preferences')
        .withIndex('by_user_id', (q) => q.eq('user_id', userId))
        .first(),
    ]);

    const sortedEpisodes = userAgents?.episodes
      ? userAgents.episodes
          .filter((episode) => episode.status === 'completed')
          .sort((a, b) => b.createdAt - a.createdAt)
      : [];

    return {
      agentsGenerated: sortedEpisodes,
      podcasts: preferences?.podcasts ?? [],
    };
  },
});
