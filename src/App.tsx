import React, { useEffect, useState, useMemo } from "react";
import MapComponent from "./components/MapComponent";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "../convex/_generated/dataModel";
import { BirdData, BirdSpecies } from "./BirdData";
import BirdActivityChart from "./components/BirdActivityChart";
import BirdSpeciesPieChart from "./components/BirdSpeciesPie";
import BirdSpeciesSelector from "./components/BirdSpeciesSelector";

const App: React.FC = () => {
  const birdData = useQuery(api.tasks.getBirdData) || [];
  const birdSpecies = useQuery(api.tasks.getBirdSpecies) || [];
  const [selectedBirdData, setSelectedBirdData] = useState<BirdData[]>([]);
  const [selectedBirdSpecies, setSelectedBirdSpecies] =
    useState<BirdSpecies | null>(null);
  const [avgLatitude, setAvgLatitude] = useState<number>(0);
  const [avgLongitude, setAvgLongitude] = useState<number>(0);
  const [mostActiveHour, setMostActiveHour] = useState<number>(0);
  const [generatedText, setGeneratedText] = useState<string>("");

  const speciesMap = useMemo(() => {
    const map = new Map<Id<"birdSpecies">, BirdSpecies>();
    birdSpecies.forEach((species) => {
      map.set(species._id, species);
    });
    return map;
  }, [birdSpecies]);

  useEffect(() => {
    setSelectedBirdData(birdData);
  }, [birdData]);

  useEffect(() => {
    // Filter bird data based on selected species
    console.log("selectedBirdSpecies", selectedBirdSpecies);
    console.log("selectedBirdData", selectedBirdData);
    const filteredData = selectedBirdSpecies
      ? selectedBirdData.filter(
          (bird) => bird.birdID === selectedBirdSpecies._id
        ).map((bird) => ({ ...bird, birdID: selectedBirdSpecies.birdName }))
      : selectedBirdData;

    setSelectedBirdData(birdData);

    const sumLat = filteredData.reduce((sum, bird) => sum + bird.x, 0);
    const sumLng = filteredData.reduce((sum, bird) => sum + bird.y, 0);
    setAvgLatitude(sumLat / filteredData.length);
    setAvgLongitude(sumLng / filteredData.length);

    const hourCounts = new Array(24).fill(0);
    filteredData.forEach((bird) => {
      const hour = new Date(bird.sightingTime).getHours();
      hourCounts[hour]++;
    });

    let maxCount = Math.max(...hourCounts);
    const activeHour = hourCounts.indexOf(maxCount);
    setMostActiveHour(maxCount === 0 ? -1 : activeHour);

    
    if (selectedBirdSpecies) {
      console.log(filteredData);
      fetch("https://104-237-145-140.nip.io/bird", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      })
        .then((response) => response.text())
        .then((data) => {
          console.log({ prompts: JSON.parse(data).data });

          if (JSON.parse(data).data.length <= 10) {
            setGeneratedText("This species could not be found in the selected region. Please try another species or change the selection.");
            return;
          }
          fetch("https://bsflll--meta-llama-3-8b-instruct-web.modal.run/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompts: [
                JSON.stringify(JSON.parse(data).data).substring(0, 250),
              ],
            }),
          })
            .then((response) => response.text())
            .then((data) => {
              console.log(data);
              setGeneratedText(JSON.parse(data));
            });
        })
        .catch((error) => console.error("Error:", error));
    }
         
  }, [selectedBirdSpecies]);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour} ${ampm}`;
  };

  return (
    <div
      style={{ backgroundImage: "url(./bg1.png)" }}
      className="App flex flex-col h-screen w-screen bg-cover overflow-clip"
    >
      <div
        className="grid grid-cols-5 w-screen h-32 bg-neutral-100/5 hover:bg-neutral-50/10 transition-colors duration-300 ease-in-out backdrop-blur-lg border-b border-neutral-500 pl-10 pr-10 gap-5"
        id="nav"
      >
        <div className="row-start-1 col-start-1 col-span-2 flex h-full">
          <p className="text-4xl mt-auto mb-4 text-neutral-400 font-thin">
            BIRDWATCHER
          </p>
        </div>
        <div className="row-start-1 col-start-4 col-span-2 flex h-full">
          <p className="text-4xl mt-auto mb-4 text-neutral-400 font-thin">
            ANALYSIS
          </p>
        </div>
      </div>

      <div className="flex-auto w-screen h-full grid grid-cols-5 grid-rows-3 gap-5 p-10">
        <div className="row-start-1 row-span-2 col-start-1 col-span-3 rounded-3xl">
          <MapComponent
            birdData={birdData}
            birdSpecies={birdSpecies}
            setSelectedBirdData={setSelectedBirdData}
            speciesMap={speciesMap}
          />
        </div>
        <div className="row-start-3 row-span-1 col-start-1 col-span-3 bg-neutral-200 hover:bg-neutral-50 bg-opacity-5 transition hover:bg-opacity-10 backdrop-blur-3xl flex rounded-3xl">
          <BirdActivityChart
            selectedBirdData={selectedBirdData}
            birdSpecies={birdSpecies}
          ></BirdActivityChart>
          <BirdSpeciesPieChart
            selectedBirdData={selectedBirdData}
            birdSpecies={birdSpecies}
          ></BirdSpeciesPieChart>
        </div>
        <div className="row-start-1 row-span-1 col-start-4 col-span-2 bg-neutral-200 hover:bg-neutral-50 text-neutral-100 bg-opacity-5 transition hover:bg-opacity-10 backdrop-blur-3xl pl-10 pr-10 pt-5 pb-5 rounded-3xl">
          <p className="text-4xl font-thin text-neutral-400 mb-7">
            <BirdSpeciesSelector
              speciesList={birdSpecies}
              selectedSpecies={selectedBirdSpecies}
              setSelectedSpecies={setSelectedBirdSpecies}
              speciesMap={speciesMap}
            ></BirdSpeciesSelector>
          </p>
          <div className="overflow-y-scroll min-h-20 max-h-40">
            <p>{generatedText || ""}</p>
          </div>
        </div>
        <div className="row-start-2 row-span-1 col-start-4 col-span-2 bg-neutral-200 hover:bg-neutral-50 text-neutral-100 bg-opacity-5 transition hover:bg-opacity-10 backdrop-blur-3xl pl-10 pr-10 pt-5 pb-7 flex flex-col justify-between rounded-3xl">
          <p className="text-4xl font-thin text-neutral-400 mb-7">
            MOST ACTIVE
          </p>
          <p className="text-7xl">{mostActiveHour == -1 ? 'Unknown' : formatHour(mostActiveHour)}</p>{" "}
        </div>
        <div className="row-start-3 row-span-1 col-start-4 col-span-1 bg-neutral-200 hover:bg-neutral-50 text-neutral-100 bg-opacity-5 transition hover:bg-opacity-10 backdrop-blur-3xl pl-10 pr-10 pt-5 pb-7 flex flex-col justify-between rounded-3xl">
          <p className="text-4xl font-thin text-neutral-400 mb-7">AVG. LAT</p>
          <p className="text-7xl">{isNaN(avgLatitude) ? '???' : avgLatitude.toFixed(2)}</p>
        </div>
        <div className="row-start-3 row-span-1 col-start-5 col-span-1 bg-neutral-200 hover:bg-neutral-50 text-neutral-100 bg-opacity-5 transition hover:bg-opacity-10 backdrop-blur-3xl pl-10 pr-10 pt-5 pb-7 flex flex-col justify-between rounded-3xl">
          <p className="text-4xl font-thin text-neutral-400 mb-7">AVG. LNG</p>
          <p className="text-7xl">{isNaN(avgLongitude) ? '???' : avgLongitude.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
