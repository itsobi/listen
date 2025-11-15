import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import { v } from 'convex/values';

export const loadMessages = query({
  args: {
    chatKey: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query('chats')
      .withIndex('by_chat_key', (q) => q.eq('chatKey', args.chatKey))
      .first();

    if (!chat || chat.messages.length === 0) return [];

    // Transform to UIMessage format with parts
    return chat.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      parts: [
        {
          type: 'text' as const,
          text: msg.content,
        },
      ],
      createdAt: msg.createdAt,
    }));
  },
});

export const saveMessages = mutation({
  args: {
    chatKey: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(
          v.literal('user'),
          v.literal('assistant'),
          v.literal('system')
        ),
        content: v.string(),
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('chats')
      .withIndex('by_chat_key', (q) => q.eq('chatKey', args.chatKey))
      .first();

    if (existing) {
      // Get existing message IDs to avoid duplicates
      const existingIds = new Set(existing.messages.map((m) => m.id));

      // Filter out messages that already exist
      const newMessages = args.messages.filter(
        (msg) => !existingIds.has(msg.id)
      );

      // Append new messages to existing ones
      await ctx.db.patch(existing._id, {
        messages: [...existing.messages, ...newMessages],
      });
    } else {
      // Create new chat with initial messages
      await ctx.db.insert('chats', {
        chatKey: args.chatKey,
        messages: args.messages,
      });
    }
  },
});
