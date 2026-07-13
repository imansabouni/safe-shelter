import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in some build environments
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: { lat: number; lng: number };
}

function LocationMarker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: L.LatLng | null }) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

// Component to handle initial view centering
function ChangeView({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function MapPicker({ onLocationSelect, initialPos }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialPos ? L.latLng(initialPos.lat, initialPos.lng) : null
  );

  // default center (Turkey - approximate center of typical usage area if not specified)
  const defaultCenter: L.LatLngExpression = [39.9334, 32.8597]; 

  const handleSelect = (lat: number, lng: number) => {
    setPosition(L.latLng(lat, lng));
    onLocationSelect(lat, lng);
  };

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner relative z-0">
      <MapContainer 
        center={initialPos ? [initialPos.lat, initialPos.lng] : defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={handleSelect} position={position} />
        {initialPos && <ChangeView center={[initialPos.lat, initialPos.lng]} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-bold text-blue-600 shadow-sm border border-blue-100 uppercase tracking-tighter">
        Haritadan Seçmek İçin Tıklayın
      </div>
    </div>
  );
}
