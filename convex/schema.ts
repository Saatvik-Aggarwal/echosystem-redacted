import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  birdSpecies: defineTable({
    birdName: v.string(),
  }),
  birdData: defineTable({
    birdID: v.id("birdSpecies"),
    x: v.number(),
    y: v.number(),
    sightingTime: v.float64(),
  }),
});
