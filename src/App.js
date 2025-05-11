import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GearGuide from "./pages/GearGuide";
import CatchLog from "./pages/CatchLog";
import Tides from "./pages/Tides";
import Weather from "./components/Weather";

function App() {
  return (
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />
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

