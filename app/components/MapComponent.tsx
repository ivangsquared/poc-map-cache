// MapComponent.tsx
// Simple placeholder for a map component. Replace with your map library (e.g., Leaflet, Mapbox GL, Google Maps, etc.)
import React from 'react';

interface MapComponentProps {
  data: any[];
}

const MapComponent: React.FC<MapComponentProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <h2>Map Placeholder</h2>
        <p>Received {data.length} pins.</p>
        {/* Render map and pins here */}
      </div>
    </div>
  );
};

export default MapComponent;
