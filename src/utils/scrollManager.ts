// Disable browser's automatic scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Store scroll positions for each route
const scrollPositions = new Map<string, number>();

export const scrollManager = {
  // Save current scroll position for a route
  savePosition: (key: string) => {
    scrollPositions.set(key, window.scrollY);
  },

  // Get saved scroll position for a route
  getPosition: (key: string) => {
    return scrollPositions.get(key);
  },

  // Restore scroll position for a route
  restorePosition: (key: string, defaultPosition = 0) => {
    const savedPosition = scrollPositions.get(key);
    window.scrollTo(0, savedPosition ?? defaultPosition);
  },

  // Clear saved position for a route
  clearPosition: (key: string) => {
    scrollPositions.delete(key);
  }
};
