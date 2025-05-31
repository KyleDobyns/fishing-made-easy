import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Auth from '../components/Auth';
import { supabase } from '../supabase';
import useWeather from '../hooks/useWeather';
import '../styles/HomePage.css';

const HomePage = ({ lightMode, setLightMode }) => {
  const [user, setUser] = useState(null);
  const [catches, setCatches] = useState([]);
  const { weather, locationName, error: weatherError } = useWeather();
  const navigate = useNavigate();

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
            id: catchItem.id,
            description: `${catchItem.fish_type} - ${catchItem.length}" (${catchItem.date})`,
            image: catchItem.image_url,
            fish_type: catchItem.fish_type,
            length: catchItem.length,
            date: catchItem.date,
          })));
        }
      };
      fetchCatches();
    } else {
      setCatches([]);
    }
  }, [user]);

  const handleCatchClick = (catchId) => {
    // Navigate to catch log with the specific catch ID as a URL parameter
    navigate(`/catch-log?highlight=${catchId}`);
  };

  return (
    <div className="homepage">
      {/* Theme toggle button - only on homepage */}
      <button
        className="theme-toggle-homepage"
        onClick={() => setLightMode((m) => !m)}
        aria-label="Toggle light/dark mode"
        title={lightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        {lightMode ? "🌙" : "☀️"}
      </button>

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
            <div 
              key={index} 
              className="catch clickable-catch" 
              onClick={() => handleCatchClick(catchItem.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCatchClick(catchItem.id);
                }
              }}
              title="Click to view in Catch Log"
            >
              <div>{catchItem.description}</div>
              {catchItem.image && (
                <img src={catchItem.image} alt={catchItem.description} style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '5px' }} />
              )}
              <div className="click-hint">📋 Click to view details</div>
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