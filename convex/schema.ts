import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  preferences: defineTable({
    user_id: v.string(),
    providers: v.array(v.string()),
    podcasts: v.array(
      v.object({
        name: v.string(),
        artistName: v.string(),
        image: v.optional(v.string()),
      })
    ),
  }).index('by_user_id', ['user_id']),
});
