import type { GeoPoint } from "../types/domain";

/**
 * Calculate distance between two geographic points using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (point1: GeoPoint, point2: GeoPoint): number => {
  const R = 6371000; // Earth's radius in meters
  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Format distance in meters to a human-readable string
 */
export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  }
  return `${(distanceInMeters / 1000).toFixed(2)}km`;
};

/**
 * Check if a location is within a geofence
 */
export const isWithinGeofence = (
  userLocation: GeoPoint,
  schoolLocation: GeoPoint,
  radiusInMeters: number
): boolean => {
  const distance = calculateDistance(userLocation, schoolLocation);
  return distance <= radiusInMeters;
};

/**
 * Calculate bearing between two points in degrees
 */
export const calculateBearing = (point1: GeoPoint, point2: GeoPoint): number => {
  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);

  return ((bearing * 180) / Math.PI + 360) % 360;
};

/**
 * Get compass direction from bearing
 */
export const getCompassDirection = (bearing: number): string => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
};
