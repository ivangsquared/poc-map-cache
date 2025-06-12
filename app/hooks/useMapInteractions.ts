import { useState, useCallback, useRef, useEffect } from "react";
import { Map as LeafletMap } from "leaflet";
import { MapBounds } from "../types/luminaire";

interface UseMapInteractionsProps {
  onBoundsChange?: (bounds: MapBounds) => void;
  onZoomChange?: (zoom: number) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function useMapInteractions({
  onBoundsChange,
  onZoomChange,
  initialCenter = [0, 0],
  initialZoom = 2,
}: UseMapInteractionsProps = {}) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const moveEndTimeout = useRef<NodeJS.Timeout>(null);

  const updateBounds = useCallback((currentMap: LeafletMap) => {
    const newBounds = currentMap.getBounds();
    const boundsUpdate = {
      _southWest: {
        lat: newBounds.getSouthWest().lat,
        lng: newBounds.getSouthWest().lng,
      },
      _northEast: {
        lat: newBounds.getNorthEast().lat,
        lng: newBounds.getNorthEast().lng,
      },
    };
    
    setBounds(boundsUpdate);
    
    if (onBoundsChange) {
      onBoundsChange(boundsUpdate);
    }
    
    return boundsUpdate;
  }, [onBoundsChange]);

  const handleMoveEnd = useCallback(() => {
    if (moveEndTimeout.current) {
      clearTimeout(moveEndTimeout.current);
    }

    moveEndTimeout.current = setTimeout(() => {
      if (map) {
        const newCenter: [number, number] = [map.getCenter().lat, map.getCenter().lng];
        setCenter(newCenter);
        updateBounds(map);
        setIsMoving(false);
      }
    }, 150); // Debounce move end
  }, [map, updateBounds]);

  const handleMoveStart = useCallback(() => {
    setIsMoving(true);
  }, []);

  const handleZoomEnd = useCallback(() => {
    if (map) {
      const newZoom = map.getZoom();
      setZoom(newZoom);
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
      handleMoveEnd();
    }
  }, [map, onZoomChange, handleMoveEnd]);

  const flyTo = useCallback(
    (lat: number, lng: number, zoomLevel?: number) => {
      if (map) {
        map.flyTo([lat, lng], zoomLevel || zoom, {
          duration: 1,
        });
      }
    },
    [map, zoom]
  );

  const setMapRef = useCallback(
    (mapInstance: LeafletMap | null) => {
      // Only update if the map instance has actually changed
      if (mapInstance === map) return;
      
      // Clean up old map instance
      if (map) {
        map.off('moveend', handleMoveEnd);
        map.off('movestart', handleMoveStart);
        map.off('zoomend', handleZoomEnd);
      }
      
      // Set up new map instance
      if (mapInstance) {
        setMap(mapInstance);
        
        // Set up event listeners
        mapInstance.on('moveend', handleMoveEnd);
        mapInstance.on('movestart', handleMoveStart);
        mapInstance.on('zoomend', handleZoomEnd);
        
        // Initial bounds update
        updateBounds(mapInstance);
      } else {
        setMap(null);
      }
    },
    [map, handleMoveEnd, handleMoveStart, handleZoomEnd, updateBounds]
  );

  useEffect(() => {
    return () => {
      if (moveEndTimeout.current) {
        clearTimeout(moveEndTimeout.current);
      }
    };
  }, []);

  return {
    map,
    setMap: setMapRef,
    bounds,
    center,
    zoom,
    isMoving,
    flyTo,
    updateBounds,
  };
}

export default useMapInteractions;
