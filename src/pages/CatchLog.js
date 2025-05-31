import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase, supabaseAnonKey } from '../supabase';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/CatchLog.css';
/* eslint-disable react-hooks/exhaustive-deps */

// Custom icon for user location (red dot, matching MapView.js)
const smallDotIcon = L.divIcon({
  className: "custom-dot",
  html: '<div style="width:10px; height:10px; background:red; border-radius:50%;"></div>',
  iconSize: [10, 10],
});

// Component to recenter the map
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [position, map]);
  return null;
};

const CatchLog = () => {
  const [catchEntry, setCatchEntry] = useState({
    fishType: '',
    length: '',
    date: '',
    image: null,
  });
  const [catches, setCatches] = useState([]);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState(null);
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [weatherError, setWeatherError] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [highlightedCatch, setHighlightedCatch] = useState(null);
  
  // Get URL search parameters to check for highlighted catch
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch the authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Check for highlighted catch from URL parameters
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      setHighlightedCatch(highlightId);
      // Clear the URL parameter after 5 seconds
      setTimeout(() => {
        setHighlightedCatch(null);
        setSearchParams({}); // Clear the URL parameter
      }, 5000);
    }
  }, [searchParams, setSearchParams]);

  // Fetch catches from Supabase
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
          setError('Failed to load catches.');
        } else {
          setCatches(data.map(catchItem => ({
            id: catchItem.id,
            description: `${catchItem.fish_type} - ${catchItem.length}" (${catchItem.date})`,
            image: catchItem.image_url,
            weather: catchItem.weather,
            location: catchItem.location,
            lat: catchItem.lat,
            lon: catchItem.lon,
          })));
        }
      };
      fetchCatches();
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
          setPosition([47.6062, -122.2577]);
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
      setPosition([47.6062, -122.2577]);
      setLocationName("Seattle");
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // Define stateAbbreviations locally
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

  const fetchLocationName = async (lat, lon) => {
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
      return `${city}, ${stateAbbreviation}`;
    } catch (error) {
      console.error("Fetch location name error in CatchLog:", error.message);
      return "Unknown Location";
    }
  };

  // Suppress warning since fetchLocationName is a stable function defined locally
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
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
      setWeather(data.current_weather_description);
      
      // Fetch  location name using reverse geocoding
      const preciseLocationName = await fetchLocationName(lat, lon);
      setLocationName(preciseLocationName);
      setWeatherError('');
      return preciseLocationName;
    } catch (error) {
      setWeatherError('Weather data unavailable. Catch will be saved without weather.');
      setWeather(null);
      setLocationName('');
      return "Unknown Location";
    }
  }, []); 

  useEffect(() => {
    if (!position) return;
    fetchWeather(position[0], position[1]);
  }, [position, fetchWeather]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatchEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setCatchEntry((prev) => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file (e.g., JPG, PNG).');
      setCatchEntry((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting catch with user:', user);
    console.log('Catch entry:', catchEntry);
    if (!user) {
      setError('Please log in to log a catch.');
      return;
    }
    if (!catchEntry.fishType || !catchEntry.length || !catchEntry.date) {
      setError('Please fill in all fields (except image, which is optional).');
      return;
    }

  
    let finalLocationName = locationName;
    if (!locationName || locationName === "Unknown Location" || locationName === "User Location" || locationName === "") {
      if (position && position[0] && position[1]) {
        finalLocationName = await fetchLocationName(position[0], position[1]);
      } else {
        finalLocationName = "Unknown Location";
      }
    }

    let imageUrl = null;
    if (catchEntry.image) {
      const timestamp = Date.now();
      const file = dataURLtoFile(catchEntry.image, `catch-${timestamp}.png`);
      console.log('Uploading image:', file);
      const { data, error: uploadError } = await supabase.storage
        .from('catch-photos')
        .upload(`${user.id}/${file.name}`, file, { upsert: false });
      if (uploadError) {
        console.error('Image upload error:', uploadError);
        setError(`Failed to upload image: ${uploadError.message}, but catch will still be saved.`);
      } else {
        console.log('Upload response data:', data);
        imageUrl = supabase.storage.from('catch-photos').getPublicUrl(data.path).data.publicUrl;
        console.log('Image uploaded, public URL:', imageUrl);
      }
    }

    const newCatch = {
      user_id: user.id,
      fish_type: catchEntry.fishType,
      length: parseFloat(catchEntry.length),
      date: catchEntry.date,
      image_url: imageUrl,
      weather: weather || 'Not available',
      location: finalLocationName || 'Not available',
      lat: position ? position[0] : null,
      lon: position ? position[1] : null,
    };
    console.log('Inserting catch:', newCatch);

    const { data: insertedCatch, error: insertError } = await supabase
      .from('catches')
      .insert(newCatch)
      .select()
      .single();

    if (insertError) {
      console.error('Error saving catch:', insertError);
      setError(`Failed to save catch: ${insertError.message}`);
      return;
    }

    setCatches((prev) => [{
      id: insertedCatch.id,
      description: `${insertedCatch.fish_type} - ${insertedCatch.length}" (${insertedCatch.date})`,
      image: insertedCatch.image_url,
      weather: insertedCatch.weather || 'Not available',
      location: insertedCatch.location || 'Not available',
      lat: insertedCatch.lat,
      lon: insertedCatch.lon,
    }, ...prev.slice(0, 4)]);

    setCatchEntry({ fishType: '', length: '', date: '', image: null });
    setImagePreview(null);
    setError('');
  };

  const clearCatches = async () => {
    if (!user) {
      setError('Please log in to clear catches.');
      return;
    }
    const { error } = await supabase
      .from('catches')
      .delete()
      .eq('user_id', user.id);
    if (error) {
      console.error('Error clearing catches:', error);
      setError('Failed to clear catches.');
    } else {
      setCatches([]);
    }
  };

  const deleteCatch = async (catchId) => {
    if (!user) {
      setError('Please log in to delete a catch.');
      return;
    }
    const { error } = await supabase
      .from('catches')
      .delete()
      .eq('id', catchId)
      .eq('user_id', user.id);
    if (error) {
      console.error('Error deleting catch:', error);
      setError('Failed to delete catch.');
    } else {
      setCatches(catches.filter(catchItem => catchItem.id !== catchId));
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const openMapModal = (catchItem) => {
    if (catchItem.lat && catchItem.lon) {
      setSelectedCoordinates({
        lat: catchItem.lat,
        lon: catchItem.lon,
        location: catchItem.location,
      });
      setShowMapModal(true);
    }
  };

  const closeMapModal = (e) => {
    e.stopPropagation();
    console.log('Closing map modal');
    setShowMapModal(false);
    setSelectedCoordinates(null);
  };

  return (
    <div className="catch-log-container">
      <h1 className="catch-log-title">Catch Log</h1>
      {weatherError && <p className="error-message">{weatherError}</p>}
      {!user ? (
        <p>Please log in to log a catch.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="catch-log-form">
            <div className="form-group">
              <label>
                Fish Type:
                <input
                  type="text"
                  name="fishType"
                  value={catchEntry.fishType}
                  onChange={handleInputChange}
                  className="catch-input"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Length (in inches):
                <input
                  type="number"
                  name="length"
                  value={catchEntry.length}
                  onChange={handleInputChange}
                  className="catch-input"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Date (YYYY-MM-DD):
                <input
                  type="date"
                  name="date"
                  value={catchEntry.date}
                  onChange={handleInputChange}
                  className="catch-input"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Catch Photo (optional):
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="catch-input file-input"
                />
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Catch Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} />
                </div>
              )}
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="catch-log-button">
              Log Catch
            </button>
          </form>

          <h2 className="recent-catches-title">Recent Catches</h2>
          <div className="recent-catches-list">
            {catches.length > 0 ? (
              <>
                <button onClick={clearCatches} className="catch-log-button" style={{ marginBottom: '10px' }}>
                  Clear All Catches
                </button>
                {catches.map((catchItem, index) => (
                  <div 
                    key={index} 
                    className={`catch-item ${highlightedCatch === catchItem.id ? 'highlighted-catch' : ''}`}
                  >
                    {highlightedCatch === catchItem.id && (
                      <div className="highlight-banner">
                        🎣 This catch was selected from the homepage!
                      </div>
                    )}
                    <div>{catchItem.description}</div>
                    <div className="catch-details">
                      <span>Weather: {catchItem.weather}</span>
                      <span>
                        Location:{' '}
                        {catchItem.lat && catchItem.lon ? (
                          <span className="location-link" onClick={() => openMapModal(catchItem)}>
                            {catchItem.location}
                          </span>
                        ) : (
                          catchItem.location
                        )}
                      </span>
                    </div>
                    {catchItem.image && (
                      <img src={catchItem.image} alt={catchItem.description} style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '5px' }} />
                    )}
                    <button
                      onClick={() => deleteCatch(catchItem.id)}
                      className="delete-catch-button"
                      style={{ marginTop: '5px' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <p className="no-catches">No catches logged yet.</p>
            )}
          </div>
        </>
      )}
      <Link to="/" className="back-link">
        Back to Home
      </Link>

      {showMapModal && selectedCoordinates && (
        <div className="map-modal" onClick={closeMapModal}>
          <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="map-modal-close" onClick={closeMapModal}>×</button>
            <h3 style={{ color: 'var(--primary-text-color)', marginBottom: '10px', textAlign: 'center' }}>
              Catch Location: {selectedCoordinates.location}
            </h3>
            <MapContainer
              center={[selectedCoordinates.lat, selectedCoordinates.lon]}
              zoom={14}
              style={{ width: '100%', height: '400px', borderRadius: '8px' }}
              key={`${selectedCoordinates.lat}-${selectedCoordinates.lon}`}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[selectedCoordinates.lat, selectedCoordinates.lon]}
                icon={smallDotIcon}
              />
              <RecenterMap position={[selectedCoordinates.lat, selectedCoordinates.lon]} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatchLog;