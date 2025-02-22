/* import React, { useState, useEffect } from "react";
import "./HomePage.css";
import Weather from "./components/Weather";
import MapView from "./components/MapView";

const HomePage = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const { latitude, longitude } = location.coords;
          setPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div className="homepage">
      <div className="weather-section">
        {position ? <Weather position={position} /> : <p>Loading weather...</p>}
      </div>

      <div className="map-section">
        {position ? <MapView position={position} /> : <p>Loading map...</p>}
      </div>

      <div className="features">
        <div className="feature-card">Gear Guide</div>
        <div className="feature-card">Log Catch</div>
        <div className="feature-card">Today's Spots</div>
        <div className="feature-card">Tides</div>
      </div>

      <h2>Recent Catches</h2>
      <div className="recent-catches">
        <div className="catch">Salmon - 24"</div>
        <div className="catch">Steelhead - 30"</div>
        <div className="catch">Rainbow - 18"</div>
      </div>
    </div>
  );
};

export default HomePage; */

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Weather from "./components/Weather";
import MapView from "./components/MapView";
import { CatchContext } from "./CatchContext"; // Updated to named import

const HomePage = () => {
  const { catches } = useContext(CatchContext);

  return (
    <div className="homepage">
      <div className="weather-section">
        <Weather />
      </div>

      <div className="map-section">
        <MapView />
      </div>

      <div className="features">
        <Link to="/gear-guide" className="feature-card">Gear Guide</Link>
        <Link to="/catch-log" className="feature-card">Log Catch</Link>
        <Link to="/tides" className="feature-card">Tides</Link>
      </div>

      <h2>Recent Catches</h2>
      <div className="recent-catches">
        {catches.length > 0 ? (
          catches.map((catchItem, index) => (
            <div key={index} className="catch">
              {catchItem}
            </div>
          ))
        ) : (
          <p className="catch">No catches logged yet.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;