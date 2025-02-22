import React from "react";
import { Link } from "react-router-dom";

const GearGuide = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Gear Guide</h1>
      <p>This is a placeholder for the Gear Guide page.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default GearGuide;