import React from "react";
import ReactDOM from "react-dom/client"; // ✅ React 18 uses this
import App from "./App";
import "./index.css";

console.log("✅ index.js is running!");
console.log("✅ Root element found, mounting React...");

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Correct for React 18+
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



