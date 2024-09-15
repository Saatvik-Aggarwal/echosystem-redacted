import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { BirdData, BirdSpecies } from "../BirdData";

interface BirdSpeciesPieChartProps {
  selectedBirdData: BirdData[];
  birdSpecies: BirdSpecies[];
}

const BirdSpeciesPieChart: React.FC<BirdSpeciesPieChartProps> = ({
  selectedBirdData,
  birdSpecies,
}) => {
  // Create a map from bird ID to bird name
  const speciesMap = new Map(
    birdSpecies.map((species) => [species._id, species.birdName])
  );

  // Count occurrences of each bird type
  const birdCounts = selectedBirdData.reduce((acc: any, bird) => {
    const birdName = speciesMap.get(bird.birdID) || "Unknown";
    acc[birdName] = (acc[birdName] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for Nivo pie chart
  const data = Object.entries(birdCounts).map(([label, value]) => ({
    id: label,
    label,
    value,
  }));

  return (
    <div className="flex-auto w-32">
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 130, bottom: 40, left: 130 }}
        innerRadius={0.3}
        padAngle={0.3}
        cornerRadius={3}
        activeOuterRadiusOffset={2}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        defs={[
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        theme={{
          labels: {
            text: {
              fill: "#888", // Set label text color to white
            },
          },
        }}
      />
    </div>
  );
};

export default BirdSpeciesPieChart;
