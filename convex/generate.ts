import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Define the Greater Boston area boundaries
const BOSTON_AREA = {
  north: 42.3988,
  south: 42.227,
  east: -70.942,
  west: -71.1918,
};

export const generateBirdData = mutation({
  args: {
    birdName: v.string(),
    timeRange: v.float64(),
    location: v.object({ lat: v.number(), lon: v.number() }),
  },
  handler: async (ctx, args) => {
    const birdSpecies = await ctx.db
      .query("birdSpecies")
      .filter((q) => q.eq(q.field("birdName"), args.birdName))
      .first();

    if (!birdSpecies) {
      throw new Error(`Bird species "${args.birdName}" not found`);
    }

    const generatedData = [];
    const centerLat =
      args.location.lat || (BOSTON_AREA.north + BOSTON_AREA.south) / 2;
    const centerLon =
      args.location.lon || (BOSTON_AREA.east + BOSTON_AREA.west) / 2;

    // randomly generate 5-15 sightings within 10 miles of the specified location
    for (let i = 0; i < 5 + Math.floor(Math.random() * 10); i++) {
      const { lat, lon } = randomPointWithinRadius(centerLat, centerLon, 50);
      const sightingTime = Date.now() + Math.random() * args.timeRange;
      const newBirdData = await ctx.db.insert("birdData", {
        birdID: birdSpecies._id,
        x: lon,
        y: lat,
        sightingTime,
      });
      generatedData.push(newBirdData);
    }

    return {
      message: `Generated 10 sightings for ${args.birdName} within 10 miles of the specified location`,
      generatedData,
    };
  },
});

// Helper function to generate a random point within a given radius
function randomPointWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusMiles: number
) {
  const radiusDegrees = (radiusMiles / 3958.8) * (180 / Math.PI);
  const u = Math.random();
  const v = Math.random();
  const w = radiusDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  const newLon = x / Math.cos((centerLat * Math.PI) / 180) + centerLon;
  const newLat = y + centerLat;
  return { lat: newLat, lon: newLon };
}
