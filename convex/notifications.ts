import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';

export const createNotification = internalMutation({
  args: {
    userId: v.string(),
    trackId: v.number(),
    type: v.string(),
    read: v.boolean(),
    episodeTitle: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error('Not authorized');

    await ctx.db.insert('notifications', {
      user_id: args.userId,
      trackId: args.trackId,
      type: args.type,
      read: args.read,
      episodeTitle: args.episodeTitle,
    });
  },
});

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await ctx.auth.getUserIdentity();
      if (!user) throw new Error('Not authorized');

      const notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_id', (q) => q.eq('user_id', user.subject))
        .order('desc')
        .filter((q) => q.eq(q.field('read'), false))
        .take(5);

      return { count: notifications.length, notifications };
    } catch (error) {
      return { count: 0, notifications: [] };
    }
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});
