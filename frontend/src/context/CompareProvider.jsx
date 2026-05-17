import React, { createContext, useState, useEffect } from "react";

export const CompareContext = createContext();

const MAX_COMPARE = 4;
const STORAGE_KEY = "compare_products";

export default function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
  }, [compareList]);

  function addToCompare(productId) {
    setCompareList((prev) => {
      if (prev.includes(productId)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, productId];
    });
  }

  function removeFromCompare(productId) {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  }

  function toggleCompare(productId) {
    if (compareList.includes(productId)) {
      removeFromCompare(productId);
    } else {
      addToCompare(productId);
    }
  }

  function clearCompare() {
    setCompareList([]);
  }

  function isInCompare(productId) {
    return compareList.includes(productId);
  }

  return (
    <CompareContext.Provider
      value={{
        compareList,
        compareCount: compareList.length,
        maxCompare: MAX_COMPARE,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}
