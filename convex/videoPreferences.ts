import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getVideoPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return null;
    return await ctx.db
      .query('videoPreferences')
      .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
      .first();
  },
});

export const getVideoPreferencesByChannelId = query({
  args: {
    channelId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return null;

    const userVideoPreferences = await ctx.db
      .query('videoPreferences')
      .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
      .first();

    if (!userVideoPreferences) return null;

    return userVideoPreferences.channels.find(
      (channel) => channel.channelId === args.channelId
    );
  },
});

export const createVideoPreference = mutation({
  args: {
    providers: v.array(v.string()),
    channels: v.array(
      v.object({
        name: v.string(),
        channelId: v.string(),
        creatorName: v.string(),
        image: v.optional(v.string()),
        color: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.auth.getUserIdentity();
      if (!user) throw new Error('Not authorized');

      await ctx.db.insert('videoPreferences', {
        user_id: user.subject,
        providers: args.providers,
        channels: args.channels,
      });
      return {
        success: true,
        message: 'Video preferences created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create video preference',
      };
    }
  },
});

export const updateVideoPreferences = mutation({
  args: {
    videoPreferenceId: v.id('videoPreferences'),
    providers: v.optional(v.array(v.string())),
    channels: v.optional(
      v.array(
        v.object({
          name: v.string(),
          channelId: v.string(),
          creatorName: v.string(),
          image: v.optional(v.string()),
          color: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.auth.getUserIdentity();
      if (!user) throw new Error('Not authorized');

      const updates: { providers?: string[]; channels?: any[] } = {};

      if (args.providers) {
        updates.providers = args.providers;
      }

      if (args.channels) {
        updates.channels = args.channels;
      }

      await ctx.db.patch(args.videoPreferenceId, updates);
      return { success: true, message: 'Preferences updated successfully' };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update preferences',
      };
    }
  },
});
