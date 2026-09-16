/**
 * Reusable Geo Location & Distance Calculation Service
 * Uses the Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export const DEFAULT_NEARBY_RADIUS_KM = 2.0;

/**
 * Calculates distance in kilometers between two lat/long points using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 999;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place (e.g. 0.4 km)
  return Math.round(distance * 10) / 10;
}

/**
 * Checks whether two points are within the given radius (defaults to 2.0 km).
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number = DEFAULT_NEARBY_RADIUS_KM
): boolean {
  const dist = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return dist <= radiusKm;
}

/**
 * Formats distance cleanly for UI presentation.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters}m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Default fallback coordinates: Mumbai - Andheri West Station (Hub of stalls)
 */
export const DEFAULT_CUSTOMER_LOCATION: GeoPoint & { area: string; city: string } = {
  latitude: 19.1197,
  longitude: 72.8464,
  area: 'Andheri West Station',
  city: 'Mumbai',
};

/**
 * Browser Geolocation helper
 */
export async function getBrowserLocation(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
