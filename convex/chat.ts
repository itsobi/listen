import { internalQuery } from './_generated/server';
import { v } from 'convex/values';

export const loadMessages = internalQuery({
  args: {
    chatKey: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_chat_key', (q) => q.eq('chatKey', args.chatKey))
      .collect();
    if (messages.length === 0) return [];
    return messages;
  },
});
