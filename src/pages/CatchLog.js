import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CatchContext } from "../CatchContext";
import "./CatchLog.css";

const CatchLog = () => {
  const [catchEntry, setCatchEntry] = useState({
    fishType: "",
    length: "",
    date: "",
  });
  const { catches, setCatches } = useContext(CatchContext);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatchEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!catchEntry.fishType || !catchEntry.length || !catchEntry.date) {
      setError("Please fill in all fields.");
      return;
    }

    const newCatch = `${catchEntry.fishType} - ${catchEntry.length}" (${catchEntry.date})`;
    setCatches((prev) => [newCatch, ...prev.slice(0, 4)]);
    setCatchEntry({ fishType: "", length: "", date: "" });
    setError("");
  };

  return (
    <div className="catch-log-container">
      <h1 className="catch-log-title">Catch Log</h1>
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
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="catch-log-button">
          Log Catch
        </button>
      </form>

      <h2 className="recent-catches-title">Recent Catches</h2>
      <div className="recent-catches-list">
        {catches.length > 0 ? (
          catches.map((catchItem, index) => (
            <div key={index} className="catch-item">
              {catchItem}
            </div>
          ))
        ) : (
          <p className="no-catches">No catches logged yet.</p>
        )}
      </div>

      <Link to="/" className="back-link">
        Back to Home
      </Link>
    </div>
  );
};

export default CatchLog;