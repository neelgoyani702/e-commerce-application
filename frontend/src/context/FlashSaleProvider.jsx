import React, { createContext, useState, useEffect } from "react";

export const FlashSaleContext = createContext();

export const FlashSaleProvider = ({ children }) => {
  const [activeFlashSales, setActiveFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFlashSales();
  }, []);

  const fetchActiveFlashSales = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/flash-sales/active`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.flashSales) {
        setActiveFlashSales(data.flashSales);
      }
    } catch (error) {
      console.error("Error fetching flash sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a product is in any active flash sale
  // Returns the overriding sale price and the flash sale object (for countdowns etc)
  const getFlashSaleData = (productId) => {
    if (!productId || activeFlashSales.length === 0) return null;

    for (const sale of activeFlashSales) {
      const productInSale = sale.products.find(
        (p) => 
          (p.product._id === productId) || 
          (typeof p.product === "string" && p.product === productId)
      );

      if (productInSale) {
        return {
          salePrice: productInSale.salePrice,
          flashSale: sale,
        };
      }
    }

    return null;
  };

  return (
    <FlashSaleContext.Provider
      value={{
        activeFlashSales,
        loading,
        getFlashSaleData,
        refreshFlashSales: fetchActiveFlashSales,
      }}
    >
      {children}
    </FlashSaleContext.Provider>
  );
};
