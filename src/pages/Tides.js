import React from "react";
import { Link } from "react-router-dom";

const Tides = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Tides</h1>
      <p>This is a placeholder for the Tides page.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default Tides;