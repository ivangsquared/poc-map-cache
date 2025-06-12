import { Marker as LeafletMarker, Popup as LeafletPopup } from "react-leaflet";
import L from "leaflet";
import { ReactNode } from "react";

// Create a custom icon
const customIcon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapMarkerProps {
  position: [number, number];
  children?: ReactNode;
  [key: string]: unknown;
}

export default function MapMarker({
  position,
  children,
  ...props
}: MapMarkerProps) {
  return (
    <LeafletMarker position={position} icon={customIcon} {...props}>
      {children && <LeafletPopup>{children}</LeafletPopup>}
    </LeafletMarker>
  );
}
