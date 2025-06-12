"use client";

import { useEffect, useRef } from "react";
import { Marker, Popup as LeafletPopup } from "react-leaflet";
import L from "leaflet";
import { Luminaire } from "../types/luminaire";

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Set the default icon for all markers
if (typeof window !== "undefined") {
  L.Marker.prototype.options.icon = DefaultIcon;
}

interface CustomMarkerProps {
  position: [number, number];
  data?: Luminaire;
  luminaire?: Luminaire;
  isSelected?: boolean;
  onClick?: (data: Luminaire) => void;
  onMarkerClick?: (data: Luminaire) => void;
}

const CustomMarker = ({
  position,
  data,
  luminaire,
  isSelected = false,
  onClick,
  onMarkerClick,
}: CustomMarkerProps) => {
  const markerRef = useRef<L.Marker>(null);
  const markerData = luminaire || data;
  
  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);
  
  if (!markerData) {
    console.error('CustomMarker: Either data or luminaire prop must be provided');
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick(markerData);
    } else if (onMarkerClick) {
      onMarkerClick(markerData);
    }
  };

  // Create a custom marker icon based on selection state
  const markerIcon = isSelected 
    ? L.divIcon({
        html: `<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">${markerData.status?.[0]?.toUpperCase() || 'L'}</div>`,
        className: "custom-marker-selected",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      })
    : L.divIcon({
        html: `<div class="w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>`,
        className: "custom-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      });

  return (
    <Marker
      position={position}
      ref={markerRef}
      icon={markerIcon}
      eventHandlers={{
        click: handleClick,
      }}
      key={`marker-${markerData.g3e_fid || position.join('-')}`}
    >
      <LeafletPopup>
        <div className="p-2">
          <h3 className="font-semibold">{markerData.g3e_remarks || "Luminaire"}</h3>
          <p className="text-sm text-gray-600">
            Status: {markerData.g3e_userid || "Unknown"}
          </p>
          <p className="text-sm text-gray-600">
            Type: {markerData.g3e_username || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            Last Updated: {markerData.g3e_datetime || "N/A"}
          </p>
        </div>
      </LeafletPopup>
    </Marker>
  );
};

export default CustomMarker;
