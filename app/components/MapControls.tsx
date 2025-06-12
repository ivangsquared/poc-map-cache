import { FC, useCallback } from "react";
import { Map as LeafletMap } from "leaflet";
import { RefreshCw, ZoomIn, ZoomOut, Target } from "lucide-react";
import { Button } from "../components/ui/button";

interface MapControlsProps {
  map: LeafletMap | null;
  onRefresh: () => void;
  loading?: boolean;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const MapControls: FC<MapControlsProps> = ({
  map,
  onRefresh,
  loading = false,
  className = "",
  initialCenter,
  initialZoom,
}) => {
  const handleZoomIn = useCallback(() => {
    if (map) {
      map.zoomIn(1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      map.zoomOut(1);
    }
  }, [map]);

  const handleResetView = useCallback(() => {
    if (map && initialCenter && initialZoom !== undefined) {
      map.setView(initialCenter, initialZoom, { animate: true });
    }
  }, [map, initialCenter, initialZoom]);

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        className="bg-white/80 hover:bg-white"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        className="bg-white/80 hover:bg-white"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      {initialCenter && initialZoom !== undefined && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="bg-white/80 hover:bg-white"
          aria-label="Reset view"
        >
          <Target className="h-4 w-4" />
        </Button>
      )}
      <div className="h-px bg-gray-200 my-1" /> */}
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={loading}
        className="bg-white/80 hover:bg-white"
        aria-label={loading ? "Refreshing..." : "Refresh data"}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
};

export default MapControls;
