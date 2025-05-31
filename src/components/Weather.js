import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabaseAnonKey } from "../supabase";
import useWeather from "../hooks/useWeather";
import "../styles/Weather.css";

const Weather = () => {
  const { forecast, error, getUserLocation } = useWeather(true);
  const { locationName } = useWeather(false); // For the title
  const [location, setLocation] = useState("");
  const [backgroundClass, setBackgroundClass] = useState("default-weather");
  const [searchForecast, setSearchForecast] = useState(null);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (forecast.length > 0) {
      const condition = forecast[0]?.weather_description || "";
      if (condition.includes("rain")) setBackgroundClass("rainy");
      else if (condition.includes("cloud")) setBackgroundClass("cloudy");
      else if (condition.includes("snow")) setBackgroundClass("snowy");
      else if (condition.includes("clear")) setBackgroundClass("sunny");
      else setBackgroundClass("default-weather");
    }
  }, [forecast]);

  const handleInputChange = (e) => setLocation(e.target.value);

  const handleSearchWithLocalState = async () => {
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
        const localForecast = data.forecast || [];
        setSearchForecast(localForecast);

        const condition = localForecast[0]?.weather_description || "";
        if (condition.includes("rain")) setBackgroundClass("rainy");
        else if (condition.includes("cloud")) setBackgroundClass("cloudy");
        else if (condition.includes("snow")) setBackgroundClass("snowy");
        else if (condition.includes("clear")) setBackgroundClass("sunny");
        else setBackgroundClass("default-weather");

        setSearchError("");
      } catch (error) {
        setSearchError("Unable to fetch weather data for this city. Please try again.");
        setSearchForecast(null);
      }
    }
  };

  const displayForecast = searchForecast || forecast;
  const displayError = searchError || error;

  if (displayError) return <p className="error-message">{displayError}</p>;
  if (!displayForecast || displayForecast.length === 0) return <p>Loading forecast data...</p>;

  return (
    <div className={`weather-container ${backgroundClass}`}>
      <h1 className="weather-title">5-Day Weather Forecast for {locationName}</h1>
      <button onClick={getUserLocation} className="location-button">
        Use My Location
      </button>
      <h2>5-Day Forecast (Daily Averages)</h2> {}
      <div className="forecast">
        {displayForecast.length > 0 ? (
          <div className="forecast-list">
            {displayForecast.map((day, index) => (
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
        <button onClick={handleSearchWithLocalState}>Search</button>
      </div>
      <Link to="/" className="back-link">
        Back to Home
      </Link>
    </div>
  );
};

export default Weather;