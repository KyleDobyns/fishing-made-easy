import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom icon for lake markers
const lakeIcon = L.icon({
  iconUrl: "/assets/fishButton.png",
  iconSize: [40, 30],
  iconAnchor: [20, 15],
  popupAnchor: [0, -15],
});

// Custom icon for user location (red dot)
const smallDotIcon = L.divIcon({
  className: "custom-dot",
  html: '<div style="width:10px; height:10px; background:red; border-radius:50%;"></div>',
  iconSize: [10, 10],
});

const RecenterMap = ({ position, centerOnLake }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 10);
    }
    if (centerOnLake) {
      map.setView(centerOnLake, 10);
    }
  }, [position, centerOnLake, map]);
  return null;
};

const LakeMarker = ({ lake, onClick, isSelected }) => {
  const map = useMap();
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!marker) {
      const newMarker = L.marker([lake.lat, lake.lon], { icon: lakeIcon })
        .addTo(map)
        .bindPopup(`<b>${lake.name}</b>`)
        .on("click", () => onClick(lake.id));

      setMarker(newMarker);
    }

    return () => {
      if (marker) {
        marker.remove();
      }
    };
  }, [lake, map, onClick, marker]);

  useEffect(() => {
    if (marker) {
      if (isSelected) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
    }
  }, [isSelected, marker]);

  return null;
};

const MapViewForGear = ({ position, lakes = [], onMarkerClick, selectedLake }) => {
  const [mapPosition, setMapPosition] = useState(position || [47.6062, -122.2577]); // Center on Lake Washington if no position
  const [centerOnLake, setCenterOnLake] = useState(null);

  useEffect(() => {
    if (position) {
      setMapPosition(position);
    }
  }, [position]);

  const handleMarkerClick = (lakeId) => {
    onMarkerClick(lakeId);
    const lake = lakes.find((l) => l.id === lakeId);
    if (lake) {
      setCenterOnLake([lake.lat, lake.lon]);
    }
  };

  return (
    <div className="map-container">
      {mapPosition ? (
        <MapContainer
          center={mapPosition}
          zoom={10}
          style={{ width: "100%", height: "300px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={mapPosition} icon={smallDotIcon} /> {/* Add red dot for user location */}
          {lakes.map((lake) => (
            <LakeMarker
              key={lake.id}
              lake={lake}
              onClick={handleMarkerClick}
              isSelected={selectedLake === lake.id}
            />
          ))}
          <RecenterMap position={mapPosition} centerOnLake={centerOnLake} />
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default MapViewForGear;