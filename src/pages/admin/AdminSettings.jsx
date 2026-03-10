import React, { useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { SettingsContext } from "../../context/SettingsProvider";
import {
  Settings,
  Save,
  Store,
  Globe,
  IndianRupee,
  Palette,
} from "lucide-react";

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

function AdminSettings() {
  const { refreshSettings } = useContext(SettingsContext);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [original, setOriginal] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

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
        const merged = { ...DEFAULT_SETTINGS, ...data.settings };
        setSettings(merged);
        setOriginal(merged);
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  const dirty = JSON.stringify(settings) !== JSON.stringify(original);

  function handleChange(field, value) {
    setSettings({ ...settings, [field]: value });
  }

  function handleSocialChange(platform, value) {
    setSettings({
      ...settings,
      socialLinks: { ...settings.socialLinks, [platform]: value },
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/settings`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(settings),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Settings saved successfully");
        setOriginal(settings);
        // Refresh the global settings context so Navbar/Footer update immediately
        refreshSettings();
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gray-100" />
          <div className="h-6 w-28 bg-gray-100 rounded" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-50 rounded-lg" />
            </div>
          ))}
          <div className="h-10 w-28 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Settings className="h-[18px] w-[18px] text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
            <p className="text-[11px] text-gray-400">
              Configure your store preferences
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${dirty
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Store Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Store className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Store Information
            </h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Store Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900">Contact</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                placeholder="hello@store.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <IndianRupee className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900">Currency</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — Pound (£)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Symbol
              </label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) =>
                  handleChange("currencySymbol", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900">Theme</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900">Social Links</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: "instagram", label: "Instagram" },
              { key: "twitter", label: "Twitter / X" },
              { key: "facebook", label: "Facebook" },
            ].map((social) => (
              <div key={social.key}>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  {social.label}
                </label>
                <input
                  type="url"
                  value={settings.socialLinks[social.key]}
                  onChange={(e) =>
                    handleSocialChange(social.key, e.target.value)
                  }
                  placeholder={`https://${social.key}.com/...`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Preview</h3>
          <div className="bg-gray-50 rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: settings.primaryColor }}
              >
                {settings.storeName?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {settings.storeName || "Store Name"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {settings.tagline || "Tagline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div
                className="h-6 px-3 rounded-full text-white text-[11px] font-semibold flex items-center"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Primary
              </div>
              <div
                className="h-6 px-3 rounded-full text-white text-[11px] font-semibold flex items-center"
                style={{ backgroundColor: settings.accentColor }}
              >
                Accent
              </div>
              <span className="text-xs text-gray-500 ml-2">
                Currency: {settings.currencySymbol} ({settings.currency})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
