import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RoutingMachine = ({ points }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !points || points.length < 2) return;

    // Create the routing control
    const routingControl = L.Routing.control({
      waypoints: points.map(p => L.latLng(p[0], p[1])),
      lineOptions: {
        styles: [{ color: '#1f6f63', weight: 4, opacity: 0.7 }]
      },
      show: false, // Hide the text instructions panel
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null // We'll use our own markers
    }).addTo(map);

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, points]);

  return null;
};

const ItineraryMap = ({ days }) => {
  const points = days.map(d => d.coords).filter(Boolean);
  const center = points.length > 0 ? points[0] : [20, 0];

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-soft border border-primary-border relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {days.map((day, i) => (
          day.coords && (
            <Marker key={i} position={day.coords}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-[#1f6f63] mb-1">Day {day.day}</p>
                  <p className="text-xs font-medium">{day.title}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        <RoutingMachine points={points} />
      </MapContainer>
    </div>
  );
};

export default ItineraryMap;
