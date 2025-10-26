import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createPreference = mutation({
  args: {
    providers: v.array(v.string()),
    podcasts: v.array(
      v.object({
        name: v.string(),
        artistName: v.string(),
        image: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.auth.getUserIdentity();
      if (!user) {
        return { success: false, message: 'Unauthorized' };
      }

      await ctx.db.insert('preferences', {
        user_id: user.subject,
        providers: args.providers,
        podcasts: args.podcasts,
      });
      return { success: true, message: 'Preferences created successfully' };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create preference',
      };
    }
  },
});

export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) throw new Error('Unauthorized');

    return await ctx.db
      .query('preferences')
      .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
      .first();
  },
});

export const updatePreferences = mutation({
  args: {
    preferenceId: v.id('preferences'),
    providers: v.optional(v.array(v.string())),
    podcasts: v.optional(
      v.array(
        v.object({
          name: v.string(),
          artistName: v.string(),
          image: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.auth.getUserIdentity();
      if (!user) {
        return { success: false, message: 'Unauthorized' };
      }

      const updates: { providers?: string[]; podcasts?: any[] } = {};

      if (args.providers) {
        updates.providers = args.providers;
      }

      if (args.podcasts) {
        updates.podcasts = args.podcasts;
      }

      await ctx.db.patch(args.preferenceId, updates);
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
