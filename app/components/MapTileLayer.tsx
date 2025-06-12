import { useEffect, useState } from 'react';
import { TileLayer, TileLayerProps } from 'react-leaflet';

export function MapTileLayer(props: TileLayerProps) {
  const [tileKey, setTileKey] = useState(0);
  const [tileError, setTileError] = useState(false);

  // Handle tile loading errors
  const handleTileError = () => {
    setTileError(true);
  };

  // Reset error state when URL changes
  useEffect(() => {
    setTileError(false);
    setTileKey(prev => prev + 1);
  }, [props.url]);

  // Fallback to a different tile provider if the primary one fails
  const tileUrl = tileError 
    ? 'https://tile.openstreetmap.de/{z}/{x}/{y}.png' // Fallback tile server
    : props.url;

  return (
    <TileLayer
      key={`tile-layer-${tileKey}`}
      {...props}
      url={tileUrl}
      eventHandlers={{
        ...props.eventHandlers,
        tileerror: handleTileError,
      }}
      noWrap={true}
      updateWhenIdle={true}
      updateWhenZooming={false}
    />
  );
}

export default MapTileLayer;
