/* import React, { useState, useEffect } from "react";
import "./Weather.css"; // Ensure this file exists

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const API_KEY = "0ab502f4b9326ebdd029abda14396584"; // Replace with your OpenWeatherMap API key

  // Function to fetch weather data
  const fetchWeather = (url) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.main) {
          setWeatherData(data);
        } else {
          console.error("Invalid weather data received:", data);
          setWeatherData(null);
        }
      })
      .catch((error) => console.error("Error fetching weather:", error));
  };

  // Get user's current location on first load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        fetchWeather(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_KEY}`
        );
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  }
  }, []);

  // Handle user input change
  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };

  // Handle search by city name
  const handleSearch = () => {
    if (location.trim() !== "") {
      fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${API_KEY}`
      );
    }
  };

  if (!weatherData) return <p>Loading weather...</p>;

  // Get weather details
  const { temp, humidity } = weatherData.main;
  const windSpeed = weatherData.wind.speed;
  const condition = weatherData.weather[0].description;
  const icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  // Dynamic background selection based on weather
  const getWeatherBackground = () => {
    if (condition.includes("rain")) return "rainy";
    if (condition.includes("cloud")) return "cloudy";
    if (condition.includes("snow")) return "snowy";
    if (condition.includes("clear")) return "sunny";
    return "default-weather";
  };

  return (
    <div className={`weather-container ${getWeatherBackground()}`}>
      <h2>{weatherData.name}</h2>
      <div className="weather-info">
        <img src={icon} alt={condition} className="weather-icon" />
        <div>
          <p className="temperature">{Math.round(temp)}°F</p>
          <p>{condition}</p>
        </div>
      </div>
      <p>Wind: {windSpeed} mph | Humidity: {humidity}%</p>

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
 */

import React, { useState, useEffect } from "react";
import "./Weather.css";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
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

  const getLocation = () => {
    if ("geolocation" in navigator) {
      console.log("Requesting geolocation for Weather...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Weather geolocation success:", latitude, longitude);
          setCoords([latitude, longitude]);
          fetchWeather(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_KEY}`
          );
        },
        (error) => {
          console.error("Geolocation error:", error.message, error.code);
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
    if (condition.includes("rain")) return "rainy";
    if (condition.includes("cloud")) return "cloudy";
    if (condition.includes("snow")) return "snowy";
    if (condition.includes("clear")) return "sunny";
    return "default-weather";
  };

  return (
    <div className={`weather-container ${getWeatherBackground()}`}>
      <h2>{weatherData.name}</h2>
      <div className="weather-info">
        <img src={icon} alt={condition} className="weather-icon" />
        <div>
          <p className="temperature">{Math.round(temp)}°F</p>
          <p>{condition}</p>
        </div>
      </div>
      <p>Wind: {windSpeed} mph | Humidity: {humidity}%</p>
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