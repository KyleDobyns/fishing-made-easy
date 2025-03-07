import React, { useState, useEffect, useCallback } from "react";
import "./Weather.css";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const API_KEY = "0ab502f4b9326ebdd029abda14396584";

  const fetchWeather = (url) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.main) setWeatherData(data);
        else console.error("Invalid weather data:", data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  };

  const getLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      console.log("Requesting geolocation for Weather...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Weather geolocation success:", latitude, longitude);
          fetchWeather(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_KEY}`
          );
        },
        (error) => {
          console.error("Geolocation error:", error.message, error.code);
          if (error.code !== 1 && loading) {
            setTimeout(getLocation, 2000); // Retry after 2 seconds
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
  }, [loading]); // Dependencies: loading affects the retry logic

  useEffect(() => {
    let mounted = true;
    if (mounted) getLocation();
    return () => {
      mounted = false; // Cleanup to prevent double calls
    };
  }, [getLocation]); // Depends on getLocation

  const handleInputChange = (e) => setLocation(e.target.value);

  const handleSearch = () => {
    if (location.trim()) {
      setLoading(true);
      fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${API_KEY}`
      );
    }
  };

  if (loading) return <p>Loading weather...</p>;
  if (!weatherData) return <p>Unable to load weather data. Check location permissions.</p>;

  const { temp, humidity } = weatherData.main;
  const windSpeed = weatherData.wind.speed;
  const condition = weatherData.weather[0].description;
  const icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  const getWeatherBackground = () => {
    console.log("Condition:", condition); // Debug
    if (condition.includes("rain")) return "rainy";
    if (condition.includes("cloud")) return "cloudy";
    if (condition.includes("snow")) return "snowy";
    if (condition.includes("clear")) return "sunny";
    return "default-weather";
  };

  return (
    <div className={`weather-container ${weatherData ? getWeatherBackground() : "default-weather"}`}>
      <button onClick={getLocation} style={{ marginBottom: "10px" }}>
        Use My Location
      </button>
      {weatherData && (
        <>
          <h2>{weatherData.name}</h2>
          <div className="weather-info">
            <img src={icon} alt={condition} className="weather-icon" />
            <div>
              <p className="temperature">{Math.round(temp)}°F</p>
              <p>{condition}</p>
            </div>
          </div>
          <p>Wind: {windSpeed} mph | Humidity: {humidity}%</p>
        </>
      )}
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={location}
          onChange={handleInputChange}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default Weather;