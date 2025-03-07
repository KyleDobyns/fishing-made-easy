import React, { useState, useEffect } from "react";
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
import MapView from "../components/MapView"; // Import your existing MapView component
import "./Tides.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Tides = () => {
  const [tides, setTides] = useState(null);
  const [selectedStation, setSelectedStation] = useState("9447130"); // Default to Seattle
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const [timeFrame, setTimeFrame] = useState("7days"); // "1day" or "7days"
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
  const stations = [
    { id: "9447130", name: "Seattle, WA", lat: 47.6025, lon: -122.3340 },
    { id: "9446484", name: "Tacoma, WA", lat: 47.2675, lon: -122.4110 },
    { id: "9447659", name: "Everett, WA", lat: 47.9785, lon: -122.2085 },
    { id: "9444900", name: "Port Townsend, WA", lat: 48.1170, lon: -122.7610 },
  ];

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          fetchTidesForStation(selectedStation, timeFrame, selectedDate); // Update tides with new location
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
          setPosition([47.6025, -122.3340]); // Fallback to Seattle
          fetchTidesForStation(selectedStation, timeFrame, selectedDate); // Continue with fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setPosition([47.6025, -122.3340]); // Fallback to Seattle
      fetchTidesForStation(selectedStation, timeFrame, selectedDate); // Continue with fallback
    }
  };

  useEffect(() => {
    getUserLocation(); // Initial attempt on mount
  }, [selectedStation, timeFrame, selectedDate]);

  const fetchTidesForStation = async (stationId, timeFrame, date) => {
    const today = new Date(date);
    const startDate = today.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
    let endDate;

    if (timeFrame === "7days") {
      endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
        .replace(/-/g, ""); // 7 days later
    } else {
      endDate = startDate; // Single day
    }

    try {
      const response = await fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startDate}&end_date=${endDate}&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`
      );
      if (!response.ok) throw new Error("Failed to fetch tide data");
      const data = await response.json();
      setTides(data.predictions || []);
    } catch (error) {
      setError(`Error fetching tides: ${error.message}`);
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

  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;
  if (!tides) return <p>Loading tide data...</p>;

  const labels = tides.map((tide) => new Date(tide.t).toLocaleString());
  const dataValues = tides.map((tide) => parseFloat(tide.v)); // Tide heights in feet
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
      <button onClick={getUserLocation} style={{ marginBottom: "10px" }}>
        Use My Location
      </button>
      <MapView
        position={position || [47.6025, -122.3340]} // Use geolocation or default to Seattle
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