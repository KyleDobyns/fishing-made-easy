import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import MapView from "../components/MapView";
import { supabase } from "../supabase";
import "./Tides.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Tides = () => {
  const [tides, setTides] = useState(null);
  const [selectedStation, setSelectedStation] = useState("9447130");
  const [stations, setStations] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const [timeFrame, setTimeFrame] = useState("7days");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase.from('tide_stations').select('*');
      if (error) {
        setError("Failed to load tide stations. Please try again later.");
        setStations([]);
      } else {
        setStations(data);
      }
    };
    fetchStations();
  }, []);

  const getUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          fetchTidesForStation(selectedStation, timeFrame, selectedDate);
        },
        (err) => {
          setError("Unable to get your location. Using default location instead.");
          setPosition([47.6025, -122.3340]);
          fetchTidesForStation(selectedStation, timeFrame, selectedDate);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by your browser. Using default location.");
      setPosition([47.6025, -122.3340]);
      fetchTidesForStation(selectedStation, timeFrame, selectedDate);
    }
  }, [selectedStation, timeFrame, selectedDate]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

const fetchTidesForStation = async (stationId, timeFrame, date) => {
  const today = new Date(date);
  const startDate = today.toISOString().split("T")[0].replace(/-/g, "");
  let endDate;

  if (timeFrame === "7days") {
    endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
  } else {
    endDate = startDate;
  }

  try {
    const response = await fetch('https://vboqzuiqihrdchlvooku.supabase.co/functions/v1/swift-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-supabase-anon-key', // Replace with your anon key
      },
      body: JSON.stringify({ stationId, startDate, endDate }),
    });

    if (!response.ok) throw new Error('Failed to fetch tide data');
    const data = await response.json();
    setTides(data || []);
    setError("");
  } catch (error) {
    setError("Tide data unavailable. Please try again later or select a different station.");
    setTides(null);
  }
};

  const handleStationChange = (e) => {
    setSelectedStation(e.target.value);
  };

  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const onMarkerClick = (stationId) => {
    setSelectedStation(stationId);
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!tides) return <p>Loading tide data...</p>;

  const labels = tides.map((tide) => new Date(tide.t).toLocaleString());
  const dataValues = tides.map((tide) => parseFloat(tide.v));
  const chartData = {
    labels,
    datasets: [
      {
        label: "Tide Height (ft)",
        data: dataValues,
        fill: false,
        borderColor: "red",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Tide Height (ft)",
          color: "white",
        },
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
          color: "white",
        },
        ticks: {
          color: "white",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: `Tide Predictions for ${stations.find((s) => s.id === selectedStation)?.name} (${timeFrame === "7days" ? "7 Days" : "1 Day"} on ${selectedDate})`,
        color: "white",
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="tides-container">
      <h1 className="tides-title">Tide Information</h1>
      <button onClick={getUserLocation} className="location-button">
        Use My Location
      </button>
      <MapView
        position={position || [47.6025, -122.3340]}
        stations={stations}
        onMarkerClick={onMarkerClick}
        selectedStation={selectedStation}
      />
      <div className="tides-controls">
        <div className="station-selector">
          <label htmlFor="station">Select Tide Station: </label>
          <select
            id="station"
            value={selectedStation}
            onChange={handleStationChange}
            className="station-dropdown"
          >
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
        <div className="timeframe-selector">
          <label>Time Frame: </label>
          <select
            value={timeFrame}
            onChange={handleTimeFrameChange}
            className="timeframe-dropdown"
          >
            <option value="7days">7 Days</option>
            <option value="1day">1 Day</option>
          </select>
        </div>
        <div className="date-selector">
          <label htmlFor="date">Select Date: </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-input"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>
      <p>Showing tides for {stations.find((s) => s.id === selectedStation)?.name}.</p>
      <div className="tide-chart" style={{ marginTop: "20px", maxWidth: "100%", height: "300px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
      <Link to="/" className="back-link">
        Back to Home
      </Link>
    </div>
  );
};

export default Tides;