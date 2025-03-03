/* import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CatchContext } from "../CatchContext"; // Ensure this path is correct
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

  const clearCatches = () => {
    setCatches([]); // Clear the state
    localStorage.removeItem("recentCatches"); // Clear from localStorage
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
          <>
            <button onClick={clearCatches} className="catch-log-button" style={{ marginBottom: "10px" }}>
              Clear Catches
            </button>
            {catches.map((catchItem, index) => (
              <div key={index} className="catch-item">
                {catchItem}
              </div>
            ))}
          </>
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

export default CatchLog; */

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CatchContext } from "../CatchContext"; // Ensure this path is correct
import "./CatchLog.css";

const CatchLog = () => {
  const [catchEntry, setCatchEntry] = useState({
    fishType: "",
    length: "",
    date: "",
    image: null, // Store as base64 string or null
  });
  const { catches, setCatches } = useContext(CatchContext);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // For previewing the selected image

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatchEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result; // Base64 string (e.g., "data:image/png;base64,...")
        setCatchEntry((prev) => ({ ...prev, image: base64String }));
        setImagePreview(base64String); // Use base64 for preview
      };
      reader.readAsDataURL(file); // Read file as base64
    } else {
      setError("Please upload a valid image file (e.g., JPG, PNG).");
      setCatchEntry((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!catchEntry.fishType || !catchEntry.length || !catchEntry.date) {
      setError("Please fill in all fields (except image, which is optional).");
      return;
    }

    const newCatch = {
      description: `${catchEntry.fishType} - ${catchEntry.length}" (${catchEntry.date})`,
      image: catchEntry.image || null, // Store base64 string or null
    };
    setCatches((prev) => [newCatch, ...prev.slice(0, 4)]); // Limit to 5 recent catches
    setCatchEntry({ fishType: "", length: "", date: "", image: null }); // Reset form
    setImagePreview(null); // Clear preview
    setError("");
  };

  const clearCatches = () => {
    setCatches([]); // Clear the state
    localStorage.removeItem("recentCatches"); // Clear from localStorage
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
              <img src={imagePreview} alt="Catch Preview" style={{ maxWidth: "100%", maxHeight: "200px", marginTop: "10px" }} />
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
            <button onClick={clearCatches} className="catch-log-button" style={{ marginBottom: "10px" }}>
              Clear Catches
            </button>
            {catches.map((catchItem, index) => (
              <div key={index} className="catch-item">
                <div>{catchItem.description}</div>
                {catchItem.image && (
                  <img src={catchItem.image} alt={catchItem.description} style={{ maxWidth: "100%", maxHeight: "150px", marginTop: "5px" }} />
                )}
              </div>
            ))}
          </>
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