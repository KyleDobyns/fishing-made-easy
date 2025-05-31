import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GearGuide from "./pages/GearGuide";
import CatchLog from "./pages/CatchLog";
import Tides from "./pages/Tides";
import Weather from "./components/Weather";

function App() {
  const [lightMode, setLightMode] = useState(() => {
    // Persist mode in localStorage
    return localStorage.getItem("theme") === "light";
  });

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  }, [lightMode]);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage lightMode={lightMode} setLightMode={setLightMode} />} />
          <Route path="/gear-guide" element={<GearGuide />} />
          <Route path="/catch-log" element={<CatchLog />} />
          <Route path="/tides" element={<Tides />} />
          <Route path="/weather" element={<Weather />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;