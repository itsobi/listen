import { v } from 'convex/values';
import { query } from './_generated/server';

export const getAgentTranscript = query({
  args: {
    trackId: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return null;

    const userHasAccessToTranscript = await ctx.db
      .query('agentsGenerated')
      .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
      .first();

    if (
      userHasAccessToTranscript?.episodes.some(
        (episode) => episode.trackId === args.trackId
      )
    ) {
      const transcript = await ctx.db
        .query('agentTranscripts')
        .withIndex('by_track_id', (q) => q.eq('trackId', args.trackId))
        .first();

      if (transcript) {
        const transcriptUrl = await ctx.storage.getUrl(transcript.storageId);
        const episode = userHasAccessToTranscript.episodes.find(
          (episode) => episode.trackId === args.trackId
        );
        return {
          transcriptUrl,
          episodeTitle: episode?.episodeTitle,
          episodeImageUrl: episode?.episodeImageUrl,
          agentStatus: episode?.status,
        };
      }
    }

    return false;
  },
});
