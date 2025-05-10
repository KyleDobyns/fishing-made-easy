import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabaseAnonKey } from "../supabase";
import "./Weather.css";

const Weather = () => {
  const [forecast, setForecast] = useState([]);
  const [position, setPosition] = useState(null);
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [backgroundClass, setBackgroundClass] = useState("default-weather");

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}. Using default location (Seattle).`);
          setPosition([47.6062, -122.2577]); // Fallback to Seattle
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by this browser. Using default location (Seattle).");
      setPosition([47.6062, -122.2577]); // Fallback to Seattle
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (!position) return;

    const fetchWeather = async () => {
      try {
        const [lat, lon] = position;
        const response = await fetch('https://vboqzuiqihrdchlvooku.supabase.co/functions/v1/super-worker', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ lat, lon, location: "User Location" }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setForecast(data.forecast || []);

        // Set background class based on the first day's weather condition
        const condition = data.forecast[0]?.weather_description || "";
        if (condition.includes("rain")) setBackgroundClass("rainy");
        else if (condition.includes("cloud")) setBackgroundClass("cloudy");
        else if (condition.includes("snow")) setBackgroundClass("snowy");
        else if (condition.includes("clear")) setBackgroundClass("sunny");
        else setBackgroundClass("default-weather");

        setError("");
      } catch (error) {
        setError("Weather data unavailable. Please try again later.");
        setForecast([]);
      }
    };

    fetchWeather();
  }, [position]);

  const handleInputChange = (e) => setLocation(e.target.value);

  const handleSearch = async () => {
    if (location.trim()) {
      try {
        const response = await fetch('https://vboqzuiqihrdchlvooku.supabase.co/functions/v1/super-worker', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ location: location.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch weather data for city');
        }

        const data = await response.json();
        setForecast(data.forecast || []);

        const condition = data.forecast[0]?.weather_description || "";
        if (condition.includes("rain")) setBackgroundClass("rainy");
        else if (condition.includes("cloud")) setBackgroundClass("cloudy");
        else if (condition.includes("snow")) setBackgroundClass("snowy");
        else if (condition.includes("clear")) setBackgroundClass("sunny");
        else setBackgroundClass("default-weather");

        setError("");
      } catch (error) {
        setError("Unable to fetch weather data for this city. Please try again.");
        setForecast([]);
      }
    }
  };

  if (error) return <p className="error-message">{error}</p>;
  if (forecast.length === 0) return <p>Loading forecast data...</p>;

  return (
    <div className={`weather-container ${backgroundClass}`}>
      <h1 className="weather-title">5-Day Weather Forecast</h1>
      <button onClick={getUserLocation} className="location-button">
        Use My Location
      </button>
      <div className="forecast">
        {forecast.length > 0 ? (
          <div className="forecast-list">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <p><strong>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}:</strong></p>
                <p>{day.avg_temperature}°F, {day.weather_description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No forecast data available.</p>
        )}
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={location}
          onChange={handleInputChange}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <Link to="/" className="back-link">
        Back to Home
      </Link>
    </div>
  );
};

export default Weather;