import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CatchProvider } from "./CatchContext"; // Import the provider
import HomePage from "./HomePage";
import GearGuide from "./pages/GearGuide";
import CatchLog from "./pages/CatchLog";
import Tides from "./pages/Tides";

function App() {
  return (
    <CatchProvider> {/* Wrap the app with CatchProvider */}
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gear-guide" element={<GearGuide />} />
            <Route path="/catch-log" element={<CatchLog />} />
            <Route path="/tides" element={<Tides />} />
          </Routes>
        </div>
      </Router>
    </CatchProvider>
  );
}

export default App;

