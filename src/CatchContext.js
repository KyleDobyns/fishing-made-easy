import React, { createContext, useState, useEffect } from "react";

const CatchContext = createContext();

export const CatchProvider = ({ children }) => {
  const [catches, setCatches] = useState(() => {
    const savedCatches = localStorage.getItem("recentCatches");
    return savedCatches ? JSON.parse(savedCatches) : [];
  });

  useEffect(() => {
    localStorage.setItem("recentCatches", JSON.stringify(catches));
  }, [catches]);

  return (
    <CatchContext.Provider value={{ catches, setCatches }}>
      {children}
    </CatchContext.Provider>
  );
};

export { CatchContext }; // Explicitly export CatchContext as a named export