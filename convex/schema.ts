import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  preferences: defineTable({
    user_id: v.string(),
    podcasts: v.array(
      v.object({
        name: v.string(),
        creatorName: v.string(),
        image: v.optional(v.string()),
        color: v.string(),
      })
    ),
  }).index('by_user_id', ['user_id']),

  agentTranscripts: defineTable({
    trackId: v.number(),
    storageId: v.id('_storage'),
  }).index('by_track_id', ['trackId']),
  agentsGenerated: defineTable({
    user_id: v.string(),
    episodes: v.array(
      v.object({
        trackId: v.number(),
        episodeTitle: v.string(),
        episodeDescription: v.string(),
        episodeImageUrl: v.optional(v.string()),
        releaseDate: v.string(),
        status: v.union(
          v.literal('in-progress'),
          v.literal('completed'),
          v.literal('failed')
        ),
        errorMessage: v.optional(v.string()),
        createdAt: v.number(),
      })
    ),
  }).index('by_user_id', ['user_id']),
  notifications: defineTable({
    user_id: v.string(),
    trackId: v.number(),
    type: v.string(),
    read: v.boolean(),
    episodeTitle: v.string(),
  }).index('by_user_id', ['user_id']),
  chats: defineTable({
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
  }).index('by_chat_key', ['chatKey']),
});
