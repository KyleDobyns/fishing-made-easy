import React, { createContext, useState, useEffect } from "react";

const CatchContext = createContext();

export const CatchProvider = ({ children }) => {
  const [catches, setCatches] = useState(() => {
    // Load catches from localStorage on mount
    const savedCatches = localStorage.getItem("recentCatches");
    if (savedCatches) {
      const parsedCatches = JSON.parse(savedCatches);
      // Use base64 directly for images
      return parsedCatches.map((catchItem) => ({
        ...catchItem,
        image: catchItem.image ? `data:image/png;base64,${catchItem.image}` : null, // Reconstruct base64 URL
      }));
    }
    return [];
  });

  useEffect(() => {
    // Save catches to localStorage, storing image as base64 (without the "data:image/png;base64," prefix)
    const serializedCatches = catches.map((catchItem) => ({
      ...catchItem,
      image: catchItem.image ? catchItem.image.split(',')[1] : null, // Store only base64 data
    }));
    localStorage.setItem("recentCatches", JSON.stringify(serializedCatches));
  }, [catches]);

  return (
    <CatchContext.Provider value={{ catches, setCatches }}>
      {children}
    </CatchContext.Provider>
  );
};

export { CatchContext };