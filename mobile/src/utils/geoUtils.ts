/**
 * Calculates the Haversine distance between two points in km.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Returns raw distance (Multiplier removed as per user request)
 */
export const estimateRoadDistance = (straightLineKm: number): number => {
  return straightLineKm; // Removed the 1.3 heuristic multiplier
};

/**
 * Formats distance with meters and kilometers support.
 */
export const formatDistanceDisplay = (km: number): string => {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    // Ensure we don't show "0 m" for very small distances
    return meters < 5 ? '5 m' : `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
};
