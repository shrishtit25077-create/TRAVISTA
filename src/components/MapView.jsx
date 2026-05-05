import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to dynamically update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom(), {
        animate: true,
      });
    }
  }, [center, map]);
  return null;
}

const MapView = ({ location }) => {
  if (!location || !location.lat || !location.lng) {
    return (
      <div className="w-full h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
        <p className="text-slate-500 font-medium">Map unavailable. No location found.</p>
      </div>
    );
  }

  const center = [location.lat, location.lng];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm relative z-0">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <span className="font-bold">{location.name || 'Selected Destination'}</span>
          </Popup>
        </Marker>
        <MapUpdater center={{ lat: location.lat, lng: location.lng }} />
      </MapContainer>
    </div>
  );
};

export default MapView;
