import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { BirdData, BirdSpecies } from "../BirdData";
import { Id } from "../../convex/_generated/dataModel";

interface BirdActivityChartProps {
  selectedBirdData: BirdData[];
  birdSpecies: BirdSpecies[];
}

const BirdActivityChart: React.FC<BirdActivityChartProps> = ({
  selectedBirdData,
  birdSpecies,
}) => {
  // Create a map of bird species for efficient lookup
  const speciesMap = new Map<Id<"birdSpecies">, string>(
    birdSpecies.map((species) => [species._id, species.birdName])
  );

  // Initialize an object to store counts for each species
  const speciesCounts: { [key: string]: number[] } = {};
  birdSpecies.forEach((species) => {
    speciesCounts[species.birdName] = Array(24).fill(0);
  });

  // Count bird calls for each hour and species
  selectedBirdData.forEach((bird) => {
    const hour = new Date(bird.sightingTime).getHours();
    const speciesName = speciesMap.get(bird.birdID) || "Unknown";
    if (speciesCounts[speciesName]) {
      speciesCounts[speciesName][hour]++;
    }
  });

  // Format data for Nivo
  const chartData = Object.entries(speciesCounts).map(
    ([speciesName, counts]) => ({
      id: speciesName,
      data: counts.map((count, hour) => ({
        x: hour,
        y: count,
      })),
    })
  );

  return (
    <div className="flex-auto w-64">
      <ResponsiveLine
        colors={{ scheme: "nivo" }}
        data={chartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 100 }}
        xScale={{ type: "linear", min: 0, max: 23 }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        curve="monotoneX"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          tickValues: [0, 3, 6, 9, 12, 15, 18, 21],
          legend: "Hour of Day",
          legendOffset: 36,
          legendPosition: "middle",

          format: (value) => `${value}:00`,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Number of Bird Calls",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        enablePoints={false}
        enableSlices="x"
        enableArea={true}
        areaOpacity={0.1}
        useMesh={true}
        gridYValues={5} // Add this line to show horizontal grid lines
        gridXValues={12} // Add this line to show vertical grid lines
        theme={{
          grid: {
            line: {
              stroke: "#ddd",
              strokeWidth: 1,
              strokeOpacity: 0.3, // Set the grid opacity to 0.3
            },
          },
          axis: {
            legend: {
              text: {
                fill: "#aaa",
              },
            },
            ticks: {
              text: {
                fill: "#888",
              },
            },
          },
          legends: {
            text: {
              fill: "#fff",
            },
          },
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default BirdActivityChart;
