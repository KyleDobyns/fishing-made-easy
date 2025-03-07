import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MapViewForGear from "../components/MapViewForGear";
import "./GearGuide.css";

// Define lake coordinates and gear recommendations
const lakes = [
  {
    id: "lake-washington",
    name: "Lake Washington",
    lat: 47.6062,
    lon: -122.2577,
    recommendations: {
      Bass: {
        rod: "Medium Action, 6.5-7ft",
        reel: "3000-4000 size spinning reel",
        line: "10-15 lb braided main line\n8-12 lb fluorocarbon leader",
      },
      Trout: {
        rod: "Light Action, 6-7ft",
        reel: "2000-3000 size spinning reel",
        line: "4-8 lb monofilament line\n4-6 lb fluorocarbon leader",
      },
    },
  },
  {
    id: "lake-sammamish",
    name: "Lake Sammamish",
    lat: 47.5806,
    lon: -122.0748,
    recommendations: {
      Bass: {
        rod: "Medium Action, 6.5-7ft",
        reel: "3000-4000 size spinning reel",
        line: "10-15 lb braided main line\n8-12 lb fluorocarbon leader",
      },
      Kokanee: {
        rod: "Ultra-Light Action, 6-7ft",
        reel: "1000-2000 size spinning reel",
        line: "2-4 lb monofilament line\n2-4 lb fluorocarbon leader",
      },
    },
  },
  {
    id: "lake-union",
    name: "Lake Union",
    lat: 47.6286,
    lon: -122.3372,
    recommendations: {
      Perch: {
        rod: "Ultra-Light Action, 5-6ft",
        reel: "1000-2000 size spinning reel",
        line: "2-6 lb monofilament line\n2-4 lb fluorocarbon leader",
      },
      Trout: {
        rod: "Light Action, 6-7ft",
        reel: "2000-3000 size spinning reel",
        line: "4-8 lb monofilament line\n4-6 lb fluorocarbon leader",
      },
    },
  },
  {
    id: "green-lake",
    name: "Green Lake",
    lat: 47.6797,
    lon: -122.3502,
    recommendations: {
      Perch: {
        rod: "Ultra-Light Action, 5-6ft",
        reel: "1000-2000 size spinning reel",
        line: "2-6 lb monofilament line\n2-4 lb fluorocarbon leader",
      },
      RainbowTrout: {
        rod: "Light Action, 6-7ft",
        reel: "2000-3000 size spinning reel",
        line: "4-8 lb monofilament line\n4-6 lb fluorocarbon leader",
      },
    },
  },
  {
    id: "rattlesnake-lake",
    name: "Rattlesnake Lake",
    lat: 47.4381,
    lon: -121.7886,
    recommendations: {
      Trout: {
        rod: "Light Action, 6-7ft",
        reel: "2000-3000 size spinning reel",
        line: "4-8 lb monofilament line\n4-6 lb fluorocarbon leader",
      },
      Bass: {
        rod: "Medium Action, 6.5-7ft",
        reel: "3000-4000 size spinning reel",
        line: "10-15 lb braided main line\n8-12 lb fluorocarbon leader",
      },
    },
  },
  {
    id: "crescent-lake",
    name: "Crescent Lake",
    lat: 48.0519,
    lon: -123.9973,
    recommendations: {
      Trout: {
        rod: "Light Action, 6-7ft",
        reel: "2000-3000 size spinning reel",
        line: "4-8 lb monofilament line\n4-6 lb fluorocarbon leader",
      },
      Kokanee: {
        rod: "Ultra-Light Action, 6-7ft",
        reel: "1000-2000 size spinning reel",
        line: "2-4 lb monofilament line\n2-4 lb fluorocarbon leader",
      },
    },
  },
];

const GearGuide = () => {
  const [selectedLake, setSelectedLake] = useState(lakes[0]); // Default to Lake Washington
  const [position, setPosition] = useState(null); // User's current location
  const [error, setError] = useState(""); // Geolocation error

  // Fetch user's location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
          setPosition([47.6062, -122.2577]); // Fallback to Lake Washington
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setPosition([47.6062, -122.2577]); // Fallback to Lake Washington
    }
  }, []);

  // Callback from MapViewForGear when a lake marker is clicked
  const onMarkerClick = (lakeId) => {
    const lake = lakes.find((l) => l.id === lakeId);
    if (lake) {
      setSelectedLake(lake);
    } else {
      console.error("Lake not found:", lakeId);
    }
  };

  // Get the default species recommendation for the selected lake
  const defaultSpecies = Object.keys(selectedLake.recommendations)[0] || "Not available";
  const recommendation = selectedLake.recommendations[defaultSpecies] || {
    rod: "Not available",
    reel: "Not available",
    line: "Not available",
  };

  return (
    <div className="gear-guide-container">
      <h1 className="gear-guide-title">Gear Guide</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="gear-guide-map">
        <MapViewForGear
          position={position} // Pass user's current location
          lakes={lakes}
          onMarkerClick={onMarkerClick}
          selectedLake={selectedLake.id}
        />
      </div>

      <div className="recommended-setup">
        <h2>Recommended Setup for {selectedLake.name}</h2>
        <div className="setup-details">
          <p><strong>Rod</strong><br />{recommendation.rod}</p>
          <p><strong>Reel</strong><br />{recommendation.reel}</p>
          <p><strong>Line</strong><br />{recommendation.line}</p>
        </div>
      </div>

      <div className="learn-more">
        <h2>Learn More</h2>
        <div className="learn-more-item">
          <div className="learn-more-text">
            <h3>Video Tutorial</h3>
            <p>Basic Lake Fishing<br />15 min • Beginner Friendly</p>
          </div>
          <button className="play-button">▶</button>
        </div>
        <div className="learn-more-item">
          <div className="learn-more-text">
            <h3>Step-by-Step Guide</h3>
            <p>Complete Lake Setup Guide<br />5 min read • With diagrams</p>
          </div>
          <button className="guide-button">☰</button>
        </div>
      </div>

      <Link to="/" className="back-link">
        Back to Home
      </Link>
    </div>
  );
};

export default GearGuide;