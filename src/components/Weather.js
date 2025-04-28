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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_KEY}`
          );
        },
        (error) => {
          console.error("Geolocation error:", error.message, error.code);
          if (error.code !== 1 && loading) {
            setTimeout(getLocation, 2000);
          } else {
            setLoading(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation not supported.");
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    let mounted = true;
    if (mounted) getLocation();
    return () => {
      mounted = false;
    };
  }, [getLocation]);

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
  if (!weatherData) return (
    <div className="weather-container default-weather">
      <button onClick={() => getLocation()}>Use My Location</button>
      <p>Unable to load weather data. Check location permissions.</p>
    </div>
  );

  const { temp, humidity } = weatherData.main;
  const windSpeed = weatherData.wind.speed;
  const condition = weatherData.weather[0].description;
  const icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  const getWeatherBackground = () => {
    if (condition.includes("rain")) return "rainy";
    if (condition.includes("cloud")) return "cloudy";
    if (condition.includes("snow")) return "snowy";
    if (condition.includes("clear")) return "sunny";
    return "default-weather";
  };

  return (
    <div className={`weather-container ${getWeatherBackground()}`}>
      <button onClick={() => getLocation()} style={{ marginBottom: "10px", width: "90%", maxWidth: "200px", padding: "8px", boxSizing: "border-box" }}>
        Use My Location
      </button>
      <h2 style={{ margin: "0", width: "100%", textAlign: "center" }}>{weatherData.name}</h2>
      <div className="weather-info" style={{ width: "100%", textAlign: "center" }}>
        <img src={icon} alt={condition} className="weather-icon" style={{ maxWidth: "50px", height: "auto" }} />
        <div>
          <p className="temperature" style={{ margin: "5px 0" }}>{Math.round(temp)}°F</p>
          <p style={{ margin: "5px 0" }}>{condition}</p>
        </div>
      </div>
      <p style={{ margin: "5px 0", width: "100%", textAlign: "center" }}>Wind: {windSpeed} mph | Humidity: {humidity}%</p>
      <div className="search-container" style={{ width: "100%", justifyContent: "center", gap: "5px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Enter city name"
          value={location}
          onChange={handleInputChange}
          style={{ width: "60%", maxWidth: "130px", padding: "6px", boxSizing: "border-box" }}
        />
        <button onClick={handleSearch} style={{ width: "25%", maxWidth: "60px", padding: "6px", boxSizing: "border-box" }}>
          Search
        </button>
      </div>
    </div>
  );
};

export default Weather;