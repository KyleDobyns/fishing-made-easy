import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom icon for tide stations (updated to your wave.png)
const tideIcon = L.icon({
  iconUrl: "/assets/wave.png", // Path to your custom icon
  iconSize: [40, 30], // Larger to stand out
  iconAnchor: [20, 15], // Center the icon, adjusting for a potentially wider icon
  popupAnchor: [0, -15], // Position popup below the icon
});

// Custom icon for user location (keep the red dot for consistency)
const smallDotIcon = L.divIcon({
  className: "custom-dot",
  html: '<div style="width:10px; height:10px; background:red; border-radius:50%;"></div>',
  iconSize: [10, 10],
});

const RecenterMap = ({ position, centerOnStation }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 10); // Default center on initial position
    }
    if (centerOnStation) {
      map.setView(centerOnStation, 10); // Center on selected station if provided
    }
  }, [position, centerOnStation, map]);
  return null;
};

const TideMarker = ({ station, onClick, isSelected }) => {
  const map = useMap();
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!marker) {
      const newMarker = L.marker([station.lat, station.lon], { icon: tideIcon })
        .addTo(map)
        .bindPopup(
          `<b>${station.name}</b><br>Station ID: ${station.id}` // Removed "Select Station" link
        )
        .on("click", () => onClick(station.id));

      setMarker(newMarker);
    }

    return () => {
      if (marker) {
        marker.remove(); // Clean up marker on unmount
      }
    };
  }, [station, map, onClick, marker]);

  useEffect(() => {
    if (marker) {
      if (isSelected) {
        marker.openPopup(); // Highlight selected station by opening its popup
      } else {
        marker.closePopup(); // Close popup if not selected
      }
    }
  }, [isSelected, marker]);

  return null;
};

const MapView = ({ position, stations = [], onMarkerClick, selectedStation }) => {
  const [mapPosition, setMapPosition] = useState(position || [47.6025, -122.3340]); // Default to Seattle
  const [centerOnStation, setCenterOnStation] = useState(null);

  useEffect(() => {
    if (position) {
      setMapPosition(position);
    }
  }, [position]);

  const handleMarkerClick = (stationId) => {
    onMarkerClick(stationId);
    const station = stations.find((s) => s.id === stationId);
    if (station) {
      setCenterOnStation([station.lat, station.lon]); // Center map on clicked station
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
          <Marker position={mapPosition} icon={smallDotIcon} />
          <RecenterMap position={mapPosition} centerOnStation={centerOnStation} />
          {stations.map((station) => (
            <TideMarker
              key={station.id}
              station={station}
              onClick={handleMarkerClick}
              isSelected={selectedStation === station.id}
            />
          ))}
        </MapContainer>
      ) : (
        <p>Loading map or location error...</p>
      )}
    </div>
  );
};

export default MapView;