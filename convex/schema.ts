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
  videoPreferences: defineTable({
    user_id: v.string(),
    providers: v.array(v.string()),
    channels: v.array(
      v.object({
        channelId: v.string(),
        name: v.string(),
        creatorName: v.string(),
        image: v.optional(v.string()),
        color: v.string(),
      })
    ),
  }).index('by_user_id', ['user_id']),
});
