/* import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position && map) {
      map.setView(position, 12);
    }
  }, [position, map]);

  return null;
};

const MapView = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          setPosition([location.coords.latitude, location.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const smallDotIcon = L.divIcon({
    className: "custom-dot",
    html: '<div style="width:10px; height:10px; background:red; border-radius:50%;"></div>',
    iconSize: [10, 10],
  });

  return (
    <div className="map-container">
      {position ? (
        <MapContainer
          center={position}
          zoom={12}
          className="map"
          style={{ width: "100%", height: "400px" }} 
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={smallDotIcon} />
          <RecenterMap position={position} />
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default MapView;
 */


import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      console.log("Recenter map to:", position[0], position[1]);
      map.setView(position, 12);
    }
  }, [position, map]);
  return null;
};

const MapView = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocation = () => {
    if ("geolocation" in navigator) {
      console.log("Requesting geolocation for Map...");
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const { latitude, longitude } = location.coords;
          console.log("Map geolocation success:", latitude, longitude);
          setPosition([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error("Map geolocation error:", error.message, error.code);
          if (error.code !== 1) {
            setTimeout(getLocation, 2000);
          } else {
            setLoading(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation not supported.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) getLocation();
    return () => {
      mounted = false; // Cleanup to prevent double calls
    };
  }, []);

  const smallDotIcon = L.divIcon({
    className: "custom-dot",
    html: '<div style="width:10px; height:10px; background:red; border-radius:50%;"></div>',
    iconSize: [10, 10],
  });

  if (loading) return <p>Loading map...</p>;
  if (!position) return <p>Unable to load map. Check location permissions.</p>;

  return (
    <div className="map-container">
      <MapContainer
        center={position}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={smallDotIcon} />
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
};

export default MapView;
