import { useState, useEffect, useCallback } from "react";
import { supabaseAnonKey } from "../supabase";
/* eslint-disable react-hooks/exhaustive-deps */
const useWeather = (fetchForecast = false) => {
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState("");

  // Mapping of full state names to abbreviations
  const stateAbbreviations = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY",
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("Geolocation success:", latitude, longitude);
          setPosition([latitude, longitude]);
        },
        (err) => {
          console.error("Geolocation error:", err.code, err.message);
          setError(`Geolocation error: ${err.message}. Using default location (Seattle).`);
          setPosition([47.6062, -122.2577]);
          setLocationName("Seattle");
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      setError("Geolocation is not supported by this browser. Using default location (Seattle).");
      setPosition([47.6062, -122.2577]);
      setLocationName("Seattle");
    }
  };

  // Suppress warning since stateAbbreviations is a static constant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchLocationName = useCallback(async (lat, lon, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: {
            "User-Agent": "FishingMadeEasy/1.0",
          },
        });
        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Reverse geocoding response:", data);

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          data.address.suburb ||
          data.address.county ||
          "Unknown City";
        const state = data.address.state || data.address.region || "Unknown State";
        const stateAbbreviation = stateAbbreviations[state] || "Unknown";

        console.log("Extracted city:", city);
        console.log("Extracted state:", state);
        console.log("State abbreviation:", stateAbbreviation);

        const simplifiedLocation = `${city}, ${stateAbbreviation}`;
        console.log("Simplified location:", simplifiedLocation);
        return simplifiedLocation;
      } catch (error) {
        console.error(`Reverse geocoding error (attempt ${attempt}/${retries}):`, error.message);
        if (attempt === retries) {
          return "Unknown Location";
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return "Unknown Location";
  }, []);

  const fetchWeatherByLocation = useCallback(async (lat, lon, location = "User Location") => {
    try {
      console.log("Fetching weather for coordinates:", lat, lon);
      const response = await fetch('https://vboqzuiqihrdchlvooku.supabase.co/functions/v1/super-worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ lat, lon, location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
      }

      const data = await response.json();
      console.log("Weather API response:", data);

      const preciseLocationName = await fetchLocationName(lat, lon);

      if (fetchForecast) {
        setForecast(data.forecast || []);
      } else {
        setWeather({
          location: data.location,
          temperature: data.current_temperature,
          description: data.current_weather_description,
          humidity: data.current_humidity,
          windSpeed: data.current_wind_speed,
          sunrise: new Date(data.sunrise).toLocaleTimeString(),
          sunset: new Date(data.sunset).toLocaleTimeString(),
        });
      }
      setLocationName(preciseLocationName);
      setError("");
    } catch (error) {
      console.error("Weather fetch error:", error.message);
      setError(fetchForecast ? `Weather data unavailable: ${error.message}. Using last known location.` : `Weather data unavailable: ${error.message}.`);
      if (fetchForecast) setForecast([]);
      else setWeather(null);
    }
  }, [fetchForecast, fetchLocationName]);

  const fetchWeatherByCity = async (city) => {
    try {
      const response = await fetch('https://vboqzuiqihrdchlvooku.supabase.co/functions/v1/super-worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ location: city }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch weather data for city');
      }

      const data = await response.json();
      if (fetchForecast) {
        setForecast(data.forecast || []);
      } else {
        setWeather({
          location: data.location,
          temperature: data.current_temperature,
          description: data.current_weather_description,
          humidity: data.current_humidity,
          windSpeed: data.current_wind_speed,
          sunrise: new Date(data.sunrise).toLocaleTimeString(),
          sunset: new Date(data.sunset).toLocaleTimeString(),
        });
      }
      setLocationName(data.location);
      setError("");
    } catch (error) {
      setError("Unable to fetch weather data for this city. Please try again.");
      if (fetchForecast) setForecast([]);
      else setWeather(null);
    }
  };

  useEffect(() => {
    if (!position) return;
    fetchWeatherByLocation(position[0], position[1]);
  }, [position, fetchWeatherByLocation]);

  useEffect(() => {
    getUserLocation();
  }, []);

  return { position, weather, forecast, locationName, error, getUserLocation, fetchWeatherByCity };
};

export default useWeather;