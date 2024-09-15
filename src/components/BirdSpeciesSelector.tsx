import React from "react";
import { BirdSpecies } from "../BirdData";
import { Id } from "../../convex/_generated/dataModel";

interface DropdownProps {
  speciesList: BirdSpecies[];
  selectedSpecies: BirdSpecies | null;
  setSelectedSpecies: React.Dispatch<React.SetStateAction<BirdSpecies | null>>;
  speciesMap: any;
}

const BirdSpeciesSelector: React.FC<DropdownProps> = ({
  speciesList,
  selectedSpecies,
  setSelectedSpecies,
  speciesMap,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value as Id<"birdSpecies"> | "";
    setSelectedSpecies(
      selectedId === "" ? null : speciesMap.get(selectedId) || null
    );
  };

  return (
    <select
      value={selectedSpecies?._id || ""}
      onChange={handleChange}
      className="w-full bg-neutral-50 bg-opacity-5 text-neutral-100 border border-neutral-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
    >
      <option value="">All (Click to select a species)</option>
      {speciesList.map((species) => (
        <option key={species._id} value={species._id}>
          {species.birdName}
        </option>
      ))}
    </select>
  );
};

export default BirdSpeciesSelector;
