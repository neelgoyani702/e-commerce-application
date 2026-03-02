import { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  storeName: "ShopKart",
  tagline: "Premium Shopping",
  currency: "INR",
  currencySymbol: "₹",
  primaryColor: "#4f46e5",
  accentColor: "#7c3aed",
  contactEmail: "",
  contactPhone: "",
  address: "",
  socialLinks: {
    instagram: "",
    twitter: "",
    facebook: "",
  },
};

// Convert hex color to HSL values string for shadcn CSS variables
function hexToHSL(hex) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Apply theme colors as CSS variables whenever settings change
  useEffect(() => {
    if (settings?.primaryColor) {
      const root = document.documentElement;

      // Set shadcn/ui primary variable (HSL without commas)
      root.style.setProperty("--primary", hexToHSL(settings.primaryColor));
      root.style.setProperty("--ring", hexToHSL(settings.primaryColor));

      // Set accent variable for shadcn
      if (settings.accentColor) {
        root.style.setProperty("--accent", hexToHSL(settings.accentColor));
      }

      // Also set raw hex values for custom inline usage
      root.style.setProperty("--store-primary", settings.primaryColor);
      root.style.setProperty("--store-accent", settings.accentColor || settings.primaryColor);
    }
  }, [settings?.primaryColor, settings?.accentColor]);

  async function fetchSettings() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/settings`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (response.ok && data.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch {
      // Silently fail — use defaults
    }
  }

  // Call this after admin saves settings to refresh everywhere
  function refreshSettings() {
    fetchSettings();
  }

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsProvider;
