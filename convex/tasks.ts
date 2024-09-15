import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBirdSpecies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("birdSpecies").collect();
  },
});

export const getOneBirdSpecies = query({
  args: { id: v.id("birdSpecies") },
  handler: async (ctx, args) => {
    const birdSpecies = await ctx.db.get(args.id);
    if (!birdSpecies) {
      throw new Error(`Bird species with id ${args.id} not found`);
    }
    return birdSpecies;
  },
});

export const addBirdSpecies = mutation({
  args: { birdName: v.string() },
  handler: async (ctx, args) => {
    const newBirdSpecies = await ctx.db.insert("birdSpecies", {
      birdName: args.birdName,
    });
    return newBirdSpecies;
  },
});

export const getBirdData = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("birdData").collect();
  },
});

export const addBirdData = mutation({
  args: {
    birdID: v.id("birdSpecies"),
    x: v.number(),
    y: v.number(),
    sightingTime: v.number(),
  },
  handler: async (ctx, args) => {
    const newBirdData = await ctx.db.insert("birdData", {
      birdID: args.birdID,
      x: args.x,
      y: args.y,
      sightingTime: args.sightingTime,
    });
    return newBirdData;
  },
});

export const removeBirdDataNearBoston = mutation({
  args: {},
  handler: async (ctx) => {
    const birdData = await ctx.db.query("birdData").collect();
    const bostonBirdData = birdData.filter(
      (bird) =>
        bird.x >= -71.1918 &&
        bird.x <= -70.942 &&
        bird.y >= 42.227 &&
        bird.y <= 42.3988
    );
    await Promise.all(
      bostonBirdData.map((bird) => ctx.db.delete(bird._id))
    );
    return bostonBirdData;
  },
});
