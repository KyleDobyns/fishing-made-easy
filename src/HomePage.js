import React from "react";
import "./HomePage.css"; 

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="weather">
        <h1>72°F Partly Cloudy</h1>
        <img src="\logo192.png" alt="Weather Icon" className="weather-icon" />
        <p>Perfect for Salmon fishing!</p>
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

export default HomePage;


