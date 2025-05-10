import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MapViewForGear from "../components/MapViewForGear";
import { supabase } from "../supabase";
import "./GearGuide.css";

const GearGuide = () => {
  const [lakes, setLakes] = useState([]);
  const [gearRecommendations, setGearRecommendations] = useState({});
  const [selectedLake, setSelectedLake] = useState(null);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");

  // Fetch lakes and gear recommendations from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lakes
        const { data: lakesData, error: lakesError } = await supabase
          .from('lakes')
          .select('*');
        
        if (lakesError) throw new Error(lakesError.message || "Failed to fetch lakes");

        // Fetch gear recommendations
        const { data: gearData, error: gearError } = await supabase
          .from('gear_recommendations')
          .select('*');

        if (gearError) throw new Error(gearError.message || "Failed to fetch gear recommendations");

        // Format gear recommendations into the same structure as the static data
        const formattedGear = gearData.reduce((acc, item) => {
          if (!acc[item.lake_id]) {
            acc[item.lake_id] = {};
          }
          acc[item.lake_id][item.species] = {
            rod: item.rod,
            reel: item.reel,
            line: item.line,
          };
          return acc;
        }, {});

        setLakes(lakesData);
        setGearRecommendations(formattedGear);

        // Set default selected lake (e.g., Lake Washington)
        const defaultLake = lakesData.find(lake => lake.id === "lake-washington") || lakesData[0];
        setSelectedLake(defaultLake);
        setError("");
      } catch (error) {
        setError(`Error: ${error.message}`);
        setLakes([]);
        setGearRecommendations({});
      }
    };

    fetchData();
  }, []);

  const getUserLocation = () => {
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
  };

  useEffect(() => {
    getUserLocation(); // Initial attempt
  }, []);

  const onMarkerClick = (lakeId) => {
    const lake = lakes.find((l) => l.id === lakeId);
    if (lake) {
      setSelectedLake(lake);
    } else {
      console.error("Lake not found:", lakeId);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!selectedLake || !lakes.length) return <p>Loading gear recommendations...</p>;

  const defaultSpecies = Object.keys(gearRecommendations[selectedLake.id] || {})[0] || "Not available";
  const recommendation = gearRecommendations[selectedLake.id]?.[defaultSpecies] || {
    rod: "Not available",
    reel: "Not available",
    line: "Not available",
  };

  return (
    <div className="gear-guide-container">
      <h1 className="gear-guide-title">Gear Guide</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={getUserLocation} style={{ marginBottom: "10px" }}>
        Use My Location
      </button>
      <div className="gear-guide-map">
        <MapViewForGear
          position={position}
          lakes={lakes} // Pass lakes array to MapViewForGear
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