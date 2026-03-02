const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 10;

export function addToRecentlyViewed(productId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let ids = stored ? JSON.parse(stored) : [];

    // Remove if already exists (to move to front)
    ids = ids.filter((id) => id !== productId);

    // Add to front
    ids.unshift(productId);

    // Keep only last MAX_ITEMS
    if (ids.length > MAX_ITEMS) {
      ids = ids.slice(0, MAX_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    // Silent fail
  }
}

export function getRecentlyViewedIds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}
