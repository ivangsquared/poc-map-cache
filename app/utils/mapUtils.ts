import type { LatLngTuple } from "leaflet";
import type { MapBounds } from "../types/luminaire";

/**
 * Checks if a point is within the given bounds
 */
export const isInBounds = (
  point: LatLngTuple,
  bounds: MapBounds | null
): boolean => {
  if (!bounds) return true; // If no bounds, show all markers

  const [lat, lng] = point;
  return (
    lat >= bounds._southWest.lat &&
    lat <= bounds._northEast.lat &&
    lng >= bounds._southWest.lng &&
    lng <= bounds._northEast.lng
  );
};
