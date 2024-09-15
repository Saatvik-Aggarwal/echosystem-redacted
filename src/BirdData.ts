import { Id } from "../convex/_generated/dataModel";
export interface BirdData {
  _id: Id<"birdData">;
  birdID: Id<"birdSpecies">;
  x: number;
  y: number;
  sightingTime: number;
}

export interface BirdSpecies {
  _id: Id<"birdSpecies">;
  birdName: string;
}
