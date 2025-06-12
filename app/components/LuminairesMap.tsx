"use client";

import { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Luminaire } from "../types/luminaire";
import { LoadingState } from "./LoadingState";
import { ErrorBoundary } from "./ErrorBoundary";
import MapControls from "./MapControls";
import CustomMarker from "./CustomMarker";
import { MapTileLayer } from "./MapTileLayer";
import { useMapInteractions } from "../hooks/useMapInteractions";
import { useLuminaires } from "../hooks/useLuminaires";
import { isInBounds } from "../utils/mapUtils";
import "leaflet/dist/leaflet.css";

// Constants
const DEFAULT_CENTER: [number, number] = [-33.8688, 151.2093]; // Default to Sydney, Australia
const DEFAULT_ZOOM = 9;

// Dynamically import the MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => <LoadingState message="Loading map..." />,
  }
);

interface LuminairesMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  selectedLuminaireId?: string | number | null;
  onLuminaireSelect?: (luminaire: Luminaire) => void;
}

export default function LuminairesMap({
  className = "",
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  selectedLuminaireId = null,
  onLuminaireSelect,
}: LuminairesMapProps) {
  const [selectedLuminaire, setSelectedLuminaire] = useState<Luminaire | null>(
    null
  );

  // Use our custom hooks
  const { data, loading, error, refresh } = useLuminaires();

  const {
    map,
    setMap: setMapInstance,
    center,
    zoom,
    flyTo,
    bounds,
  } = useMapInteractions({
    initialCenter,
    initialZoom,
  });

  // Handle marker click
  const handleMarkerClick = useCallback(
    (luminaire: Luminaire) => {
      setSelectedLuminaire(luminaire);
      if (onLuminaireSelect) {
        onLuminaireSelect(luminaire);
      }
    },
    [onLuminaireSelect]
  );

  // Initialize map and handle tile loading
  useEffect(() => {
    if (!map) return;

    // Force a reflow to ensure tiles load properly
    const timer = setTimeout(() => {
      map.invalidateSize({
        animate: false,
        pan: false,
      });

      // Refresh the tile layer
      const tileLayers = document.querySelectorAll(".leaflet-tile");
      tileLayers.forEach((tile) => {
        const src = tile.getAttribute("src");
        if (src) {
          tile.setAttribute("src", "");
          tile.setAttribute("src", src);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  // Fly to selected luminaire when selectedLuminaireId changes
  useEffect(() => {
    if (selectedLuminaireId && data && map) {
      const luminaire = data.find((l) => l.g3e_fid === selectedLuminaireId);
      if (luminaire) {
        setSelectedLuminaire(luminaire);
        flyTo(luminaire.y, luminaire.x, Math.max(zoom || DEFAULT_ZOOM, 15));
      }
    }
  }, [selectedLuminaireId, data, map, flyTo, zoom]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Show loading state
  if (loading && !data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingState message="Loading map data..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">
            {error.message || "Failed to load map data"}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <ErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800">Map Error</h3>
              <p className="mt-1 text-sm text-red-700">
                There was a problem rendering the map.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Reload Map
              </button>
            </div>
          </div>
        }
      >
        <MapContainer
          center={center as [number, number]}
          zoom={zoom}
          className="h-full w-full z-0"
          ref={setMapInstance}
          style={{ height: "100%", width: "100%" }}
          whenReady={() => {
            // Force a reflow to ensure tiles load properly
            setTimeout(() => {
              map?.invalidateSize({
                animate: false,
                pan: false,
              });
            }, 0);
          }}
        >
          <MapTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Render markers */}
          {data
            .filter((luminaire) =>
              bounds ? isInBounds([luminaire.y, luminaire.x], bounds) : true
            )
            .map((luminaire: Luminaire) => (
              <CustomMarker
                key={`${luminaire.g3e_fid}-${luminaire.x}-${luminaire.y}`}
                position={[luminaire.y, luminaire.x]}
                luminaire={luminaire}
                onClick={handleMarkerClick}
                isSelected={selectedLuminaire?.g3e_fid === luminaire.g3e_fid}
              />
            ))}
        </MapContainer>

        {/* Map controls */}
        <div className="absolute top-4 right-4 z-[1000]">
          <MapControls map={map} onRefresh={handleRefresh} loading={loading} />
        </div>
      </ErrorBoundary>
    </div>
  );
}
