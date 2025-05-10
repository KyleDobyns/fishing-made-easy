import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../components/Auth';
import { supabase, supabaseAnonKey } from '../supabase';
import './HomePage.css';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [catches, setCatches] = useState([]);
  const [weather, setWeather] = useState(null);
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [weatherError, setWeatherError] = useState("");

  // Fetch user and set up auth listener
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch recent catches for the user
  useEffect(() => {
    if (user) {
      const fetchCatches = async () => {
        const { data, error } = await supabase
          .from('catches')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);
        if (error) {
          console.error('Error fetching catches:', error);
        } else {
          setCatches(data.map(catchItem => ({
            description: `${catchItem.fish_type} - ${catchItem.length}" (${catchItem.date})`,
            image: catchItem.image_url,
          })));
        }
      };
      fetchCatches();
    } else {
      setCatches([]);
    }
  }, [user]);

  // Fetch user location for weather
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          setWeatherError(`Geolocation error: ${err.message}. Using default location (Seattle).`);
          setPosition([47.6062, -122.2577]); // Fallback to Seattle
          setLocationName("Seattle");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setWeatherError("Geolocation is not supported by this browser. Using default location (Seattle).");
      setPosition([47.6062, -122.2577]); // Fallback to Seattle
      setLocationName("Seattle");
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch current weather
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
          body: JSON.stringify({ lat, lon }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeather({
          location: data.location,
          temperature: data.current_temperature,
          description: data.current_weather_description,
          humidity: data.current_humidity,
          windSpeed: data.current_wind_speed,
          sunrise: new Date(data.sunrise).toLocaleTimeString(),
          sunset: new Date(data.sunset).toLocaleTimeString(),
        });
        setLocationName(data.location); // Update location name from API response
        setWeatherError("");
      } catch (error) {
        setWeatherError("Weather data unavailable. Please try again later.");
        setWeather(null);
      }
    };

    fetchWeather();
  }, [position]);

  return (
    <div className="homepage">
      <Auth setUser={setUser} user={user} />
      <div className="weather-section">
        {weatherError ? (
          <p className="error-message">{weatherError}</p>
        ) : weather ? (
          <div className="weather-widget">
            <h2>Current Weather in {locationName}</h2>
            <p><strong>Temperature:</strong> {weather.temperature}°F</p>
            <p><strong>Condition:</strong> {weather.description}</p>
            <p><strong>Humidity:</strong> {weather.humidity}%</p>
            <p><strong>Wind Speed:</strong> {weather.windSpeed} mph</p>
            <p><strong>Sunrise:</strong> {weather.sunrise}</p>
            <p><strong>Sunset:</strong> {weather.sunset}</p>
            <Link to="/weather" className="forecast-button">
              View 5-Day Forecast
            </Link>
          </div>
        ) : (
          <p>Loading weather data...</p>
        )}
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
              <div>{catchItem.description}</div>
              {catchItem.image && (
                <img src={catchItem.image} alt={catchItem.description} style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '5px' }} />
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