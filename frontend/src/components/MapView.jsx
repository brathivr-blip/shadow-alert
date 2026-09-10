import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

const COLORS = {
  pending: '#8592AD',
  verified: '#F5A623',
  in_progress: '#60A5FA',
  resolved: '#34D399',
  rejected: '#E5484D',
};

function markerIcon(status) {
  const color = COLORS[status] || COLORS.pending;
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};box-shadow:0 0 0 4px ${color}33, 0 0 8px ${color};border:2px solid #0B1220;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function Recenter({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapLocationPicker({ onLocationChange }) {
  useMapEvents({
    click: ({ latlng }) => onLocationChange([latlng.lat, latlng.lng]),
  });
  return null;
}

function locationIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;border-radius:50%;background:#38D9A9;box-shadow:0 0 0 6px #38D9A944,0 0 14px #38D9A9;border:3px solid #07101f;"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function MapView({
  reports = [],
  center = [20.5937, 78.9629],
  selectedLocation = null,
  onLocationChange = () => {},
  zoom = 5,
  height = '520px',
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-midnight-600" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Recenter center={center} />
        <MapLocationPicker onLocationChange={onLocationChange} />
        {selectedLocation && <Marker position={selectedLocation} icon={locationIcon()} />}
        {reports.map((r) => {
          const [lng, lat] = r.location.coordinates;
          return (
            <Marker key={r._id} position={[lat, lng]} icon={markerIcon(r.status)}>
              <Popup>
                <div className="min-w-[180px] font-body">
                  <p className="mb-1 font-semibold">{r.title}</p>
                  <p className="mb-2 text-xs text-ink-300">{r.address}</p>
                  <Link to={`/reports/${r._id}`} className="text-xs font-semibold text-glow hover:underline">
                    View details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
