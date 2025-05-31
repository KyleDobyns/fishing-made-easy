import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MapViewForGear from "../components/MapViewForGear";
import { supabase } from "../supabase";
import useWeather from "../hooks/useWeather";
import "../styles/GearGuide.css";

const GearGuide = () => {
  const [lakes, setLakes] = useState([]);
  const [gearRecommendations, setGearRecommendations] = useState({});
  const [selectedLake, setSelectedLake] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [availableSpecies, setAvailableSpecies] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [educationalContent, setEducationalContent] = useState([]);
  
  // Get weather data
  const { weather, error: weatherError } = useWeather();

  // Fetch lakes and gear recommendations from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
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

        // Fetch educational content
        const { data: contentData, error: contentError } = await supabase
          .from('educational_content')
          .select('*')
          .order('created_at', { ascending: false });

        if (contentError) {
          console.error("Failed to fetch educational content:", contentError.message);
        }

        // Format gear recommendations
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
        setEducationalContent(contentData || []);

        // Set default selected lake
        const defaultLake = lakesData.find(lake => lake.id === "lake-washington") || lakesData[0];
        setSelectedLake(defaultLake);
        setError("");
      } catch (error) {
        setError(`Error: ${error.message}`);
        setLakes([]);
        setGearRecommendations({});
        setEducationalContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update available species when lake changes
  useEffect(() => {
    if (selectedLake && gearRecommendations[selectedLake.id]) {
      const dbSpecies = Object.keys(gearRecommendations[selectedLake.id]);
      setAvailableSpecies(dbSpecies);
      setSelectedSpecies(dbSpecies[0] || ""); // Default to first species
    } else {
      setAvailableSpecies([]);
      setSelectedSpecies("");
    }
  }, [selectedLake, gearRecommendations]);

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
    getUserLocation();
  }, []);

  const onMarkerClick = (lakeId) => {
    const lake = lakes.find((l) => l.id === lakeId);
    if (lake) {
      setSelectedLake(lake);
    } else {
      console.error("Lake not found:", lakeId);
    }
  };

  // Generate weather-based recommendations
  const getWeatherRecommendations = () => {
    if (!weather) return [];

    const recommendations = [];
    const temp = weather.temperature;
    const condition = weather.description.toLowerCase();
    const windSpeed = weather.windSpeed;

    // Temperature-based advice
    if (temp < 50) {
      recommendations.push({
        icon: "🌡️",
        title: `Cool Weather (${temp}°F)`,
        advice: "Fish deeper and slower - cold water makes fish less active"
      });
    } else if (temp > 75) {
      recommendations.push({
        icon: "☀️",
        title: `Warm Weather (${temp}°F)`,
        advice: "Early morning and evening fishing - fish seek cooler depths during midday"
      });
    } else {
      recommendations.push({
        icon: "🌡️",
        title: `Ideal Temperature (${temp}°F)`,
        advice: "Great fishing conditions - fish are active at various depths"
      });
    }

    // Weather condition advice
    if (condition.includes('rain') || condition.includes('drizzle')) {
      recommendations.push({
        icon: "🌧️",
        title: "Rainy Conditions",
        advice: "Excellent for topwater lures - rain increases fish activity and masks noise"
      });
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      recommendations.push({
        icon: "☁️",
        title: "Cloudy Skies",
        advice: "Fish are less spooked - good for aggressive lures and brighter colors"
      });
    } else if (condition.includes('clear') || condition.includes('sunny')) {
      recommendations.push({
        icon: "☀️",
        title: "Clear Skies",
        advice: "Use natural colors and finesse techniques - fish can see clearly"
      });
    }

    // Wind-based advice
    if (windSpeed > 15) {
      recommendations.push({
        icon: "💨",
        title: `Windy (${windSpeed} mph)`,
        advice: "Use heavier lures for casting - wind creates surface disturbance that helps conceal approach"
      });
    } else if (windSpeed < 5) {
      recommendations.push({
        icon: "🍃",
        title: `Calm Winds (${windSpeed} mph)`,
        advice: "Perfect for light tackle and surface lures - be extra quiet to avoid spooking fish"
      });
    } else {
      recommendations.push({
        icon: "💨",
        title: `Light Breeze (${windSpeed} mph)`,
        advice: "Ideal conditions - slight surface movement helps conceal lures"
      });
    }

    return recommendations;
  };

  // Get relevant educational content based on selected species and weather
  const getRelevantEducationalContent = () => {
    if (!educationalContent.length) return { videos: [], articles: [] };

    let videos = [];
    let articles = [];

    // First priority: Species-specific content
    if (selectedSpecies) {
      const speciesVideos = educationalContent.filter(content => 
        content.type === 'video' && content.species === selectedSpecies
      );
      const speciesArticles = educationalContent.filter(content => 
        content.type === 'article' && content.species === selectedSpecies
      );
      
      videos.push(...speciesVideos);
      articles.push(...speciesArticles);
    }

    // Second priority: General content (species = null) 
    if (videos.length < 2) {
      const generalVideos = educationalContent.filter(content => 
        content.type === 'video' && 
        content.species === null && 
        content.weather_condition === 'any'
      );
      videos.push(...generalVideos);
    }

    if (articles.length < 2) {
      const generalArticles = educationalContent.filter(content => 
        content.type === 'article' && 
        content.species === null && 
        content.weather_condition === 'any'
      );
      articles.push(...generalArticles);
    }

    // Third priority: Weather-specific content
    if (weather && (videos.length < 2 || articles.length < 2)) {
      const condition = weather.description.toLowerCase();
      let weatherCondition = 'any';
      
      if (condition.includes('rain') || condition.includes('drizzle')) {
        weatherCondition = 'rain';
      } else if (condition.includes('clear') || condition.includes('sunny')) {
        weatherCondition = 'clear';
      } else if (condition.includes('cloud') || condition.includes('overcast')) {
        weatherCondition = 'cloudy';
      } else if (weather.windSpeed > 15) {
        weatherCondition = 'windy';
      }

      if (videos.length < 2) {
        const weatherVideos = educationalContent.filter(content =>
          content.type === 'video' && 
          content.weather_condition === weatherCondition &&
          !videos.find(v => v.id === content.id) // Avoid duplicates
        );
        videos.push(...weatherVideos);
      }

      if (articles.length < 2) {
        const weatherArticles = educationalContent.filter(content =>
          content.type === 'article' && 
          content.weather_condition === weatherCondition &&
          !articles.find(a => a.id === content.id) // Avoid duplicates
        );
        articles.push(...weatherArticles);
      }
    }

    // Limit to 2 of each type and remove duplicates
    const uniqueVideos = videos.filter((video, index, self) =>
      index === self.findIndex(v => v.id === video.id)
    ).slice(0, 2);
    
    const uniqueArticles = articles.filter((article, index, self) =>
      index === self.findIndex(a => a.id === article.id)
    ).slice(0, 2);

    return { videos: uniqueVideos, articles: uniqueArticles };
  };

  const handleVideoClick = (url) => {
    window.open(url.replace('/embed/', '/watch?v='), '_blank');
  };

  const handleArticleClick = (url) => {
    window.open(url, '_blank');
  };

  if (loading) return <p>Loading gear recommendations...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!selectedLake || !lakes.length) return <p>No lakes available...</p>;

  const currentRecommendation = selectedSpecies && gearRecommendations[selectedLake.id]?.[selectedSpecies] 
    ? gearRecommendations[selectedLake.id][selectedSpecies]
    : {
        rod: "Select a species for recommendations",
        reel: "Select a species for recommendations", 
        line: "Select a species for recommendations",
      };

  const weatherRecommendations = getWeatherRecommendations();
  const { videos, articles } = getRelevantEducationalContent();

  return (
    <div className="gear-guide-container">
      <h1 className="gear-guide-title">Gear Guide</h1>
      
      {weatherError && <p className="weather-error">Weather: {weatherError}</p>}
      
      <div className="gear-guide-map">
        <MapViewForGear
          position={position}
          lakes={lakes}
          onMarkerClick={onMarkerClick}
          selectedLake={selectedLake.id}
        />
      </div>

      {/* Species Selection */}
      <div className="species-selection">
        <h2>Target Species for {selectedLake.name}</h2>
        {availableSpecies.length > 0 ? (
          <select 
            value={selectedSpecies} 
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="species-dropdown"
          >
            <option value="">Select a species...</option>
            {availableSpecies.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        ) : (
          <p>No species data available for this lake</p>
        )}
      </div>

      {/* Gear Recommendations */}
      {selectedSpecies && (
        <div className="recommended-setup">
          <h2>Recommended Setup for {selectedSpecies}</h2>
          <div className="setup-details">
            <p><strong>Rod</strong><br />{currentRecommendation.rod}</p>
            <p><strong>Reel</strong><br />{currentRecommendation.reel}</p>
            <p><strong>Line</strong><br />{currentRecommendation.line}</p>
          </div>
        </div>
      )}

      {/* Weather-Based Tips */}
      {weather && weatherRecommendations.length > 0 && (
        <div className="weather-recommendations">
          <h2>Recommendations Based on Current Weather</h2>
          <div className="weather-tips">
            {weatherRecommendations.map((rec, index) => (
              <div key={index} className="weather-tip">
                <span className="weather-icon">{rec.icon}</span>
                <div className="weather-tip-content">
                  <strong>{rec.title}</strong>
                  <p>{rec.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="learn-more">
        <h2>Learn More</h2>
        
        {/* Dynamic Educational Videos */}
        {videos.length > 0 && (
          <div className="educational-section">
            <h3>📹 Recommended Videos</h3>
            {videos.map((video) => (
              <div key={video.id} className="learn-more-item educational-item">
                <div className="learn-more-text">
                  <h4>{video.title}</h4>
                  <p>{video.description}<br />
                    <span className="content-meta">
                      {video.duration} • {video.difficulty} • 
                      {video.species ? ` ${video.species}` : ' General'}
                    </span>
                  </p>
                </div>
                <button 
                  className="play-button"
                  onClick={() => handleVideoClick(video.content_url)}
                  title="Watch Video"
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Educational Articles */}
        {articles.length > 0 && (
          <div className="educational-section">
            <h3>📖 Recommended Articles</h3>
            {articles.map((article) => (
              <div key={article.id} className="learn-more-item educational-item">
                <div className="learn-more-text">
                  <h4>{article.title}</h4>
                  <p>{article.description}<br />
                    <span className="content-meta">
                      {article.duration} • {article.difficulty} • 
                      {article.species ? ` ${article.species}` : ' General'}
                    </span>
                  </p>
                </div>
                <button 
                  className="guide-button"
                  onClick={() => handleArticleClick(article.content_url)}
                  title="Read Article"
                >
                  📖
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Fallback content if no educational content is available */}
        {videos.length === 0 && articles.length === 0 && (
          <div className="educational-section">
            <div className="learn-more-item">
              <div className="learn-more-text">
                <h3>Educational Content</h3>
                <p>Educational videos and articles are being updated.<br />Check back soon for species-specific content!</p>
              </div>
              <button className="guide-button" disabled>
                🎓
              </button>
            </div>
          </div>
        )}

        {/* Weather-specific learning tip */}
        {weather && (
          <div className="weather-learning-tip">
            <h3>💡 Today's Learning Focus</h3>
            <p>
              {weather.description.includes('rain') 
                ? "Great day to learn about rainy weather fishing techniques!"
                : weather.windSpeed > 15
                ? "Perfect time to practice windy day casting and lure selection!"
                : weather.description.includes('clear')
                ? "Ideal conditions to study fish behavior in clear water!"
                : "Good day to review general fishing fundamentals!"
              }
            </p>
          </div>
        )}
      </div>
      
      <Link to="/" className="back-link">
        Back to Home
      </Link>
    </div>
  );
};

export default GearGuide;