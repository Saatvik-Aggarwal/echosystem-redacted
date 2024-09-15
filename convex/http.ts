import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// Get all bird species
http.route({
  path: "/api/birdSpecies",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const birdSpecies = await ctx.runQuery(api.tasks.getBirdSpecies);
    return new Response(JSON.stringify(birdSpecies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Get one bird species
http.route({
  path: "/api/birdSpecies/:id",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const id = request.url.split("/").pop() as Id<"birdSpecies">;
    const birdSpecies = await ctx.runQuery(api.tasks.getOneBirdSpecies, { id });
    return new Response(JSON.stringify(birdSpecies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Add a new bird species
http.route({
  path: "/api/birdSpecies",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { birdName } = await request.json();
    const newBirdSpecies = await ctx.runMutation(api.tasks.addBirdSpecies, {
      birdName,
    });
    return new Response(JSON.stringify(newBirdSpecies), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Get all bird data
http.route({
  path: "/api/birdData",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const birdData = await ctx.runQuery(api.tasks.getBirdData);
    return new Response(JSON.stringify(birdData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Add new bird data
http.route({
  path: "/api/birdData",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { birdID, x, y, sightingTime } = await request.json();
    const newBirdData = await ctx.runMutation(api.tasks.addBirdData, {
      birdID,
      x,
      y,
      sightingTime,
    });
    return new Response(JSON.stringify(newBirdData), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
