import React from 'react';
import '../styles/ThemeToggle.css';

const ThemeToggle = ({ lightMode, setLightMode }) => {
  return (
    <button
      className="theme-toggle"
      onClick={() => setLightMode((m) => !m)}
      aria-label="Toggle light/dark mode"
      title={lightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {lightMode ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;