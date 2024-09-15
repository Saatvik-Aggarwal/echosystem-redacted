import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { BirdData, BirdSpecies } from "../BirdData";
import { haversineDistance } from "../utils";

import MarkerIcon from "../assets/mapmarker.png";

interface MapComponentProps {
  birdData: BirdData[];
  birdSpecies: BirdSpecies[];
  setSelectedBirdData: React.Dispatch<React.SetStateAction<BirdData[]>>;
  speciesMap: any;
}

const MapComponent: React.FC<MapComponentProps> = ({
  birdData,
  speciesMap,
  setSelectedBirdData,
}) => {
  const zoom: number = 8;
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const [selectedArea, setSelectedArea] = useState<L.Circle | null>(null);

  const customIcon = L.icon({
    iconUrl: MarkerIcon,
    iconSize: [36, 50],
    iconAnchor: [18, 25],
    popupAnchor: [1, -34],
  });

  useEffect(() => {
    if (selectedArea) {
      const center = selectedArea.getLatLng();
      const radius = selectedArea.getRadius();
      const filteredBirds = birdData.filter((bird) => {
        const distance = haversineDistance(
          center.lat,
          center.lng,
          bird.y,
          bird.x
        );
        return distance <= radius;
      });
      console.log(filteredBirds);
      setSelectedBirdData(filteredBirds);
    } else {
      setSelectedBirdData(birdData);
    }
  }, [selectedArea]);

  const handleCreated = (e: any) => {
    const layer = e.layer as L.Circle;

    // Remove previous layers
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }

    // Add the new layer
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(layer);
    }

    setSelectedArea(layer);
  };

  const handleDeleted = (_e: any) => {
    setSelectedArea(null);
  };

  return (
    <MapContainer
      center={[42.35843, -71.05977]}
      zoom={zoom}
      className="w-full bg-slate-50 h-full mb-10 rounded-3xl"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {birdData.map(({ _id, birdID, x, y, sightingTime }: BirdData) => (
        <Marker key={_id} position={[y, x]} icon={customIcon}>
          <Popup>
            This is a {speciesMap.get(birdID).birdName} recorded on{" "}
            {new Date(sightingTime).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
            .
            {new Date(sightingTime)
              .getMilliseconds()
              .toString()
              .padStart(3, "0")}
          </Popup>
        </Marker>
      ))}
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          onDeleted={handleDeleted}
          draw={{
            rectangle: false,
            polygon: false,
            circle: true,
            circlemarker: false,
            marker: false,
            polyline: false,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default MapComponent;
