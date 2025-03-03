/* import React, { useContext } from "react";
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
        <Link to="/catch-log" className="feature-card">Catch Log</Link>
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

export default HomePage; */

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Weather from "./components/Weather";
import MapView from "./components/MapView";
import { CatchContext } from "./CatchContext";

const HomePage = () => {
  const { catches } = useContext(CatchContext);

  return (
    <div className="homepage">
      <div className="weather-section">
        <Weather />
      </div>

{/*       <div className="map-section">
        <MapView />
      </div> */}

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
              <div>{catchItem.description}</div>
              {catchItem.image && (
                <img src={catchItem.image} alt={catchItem.description} style={{ maxWidth: "100%", maxHeight: "150px", marginTop: "5px" }} />
              )}
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