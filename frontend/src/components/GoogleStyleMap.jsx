import React from 'react';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import './google-map.css';

const REPORT_COLORS = {
  pending: '#F59E0B',
  verified: '#2563EB',
  in_progress: '#7C3AED',
  resolved: '#16A34A',
  rejected: '#DC2626',
};

const defaultLocationIcon = L.divIcon({
  className: 'google-style-location-icon',
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function RecenterMap({ center, zoom }) {
  const map = useMap();

  React.useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
  }, [center, map, zoom]);

  return null;
}

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click: ({ latlng }) => onLocationChange([latlng.lat, latlng.lng]),
  });
  return null;
}

function reportIcon(status) {
  const color = REPORT_COLORS[status] || REPORT_COLORS.pending;
  return L.divIcon({
    className: 'google-style-report-icon',
    html: `<span style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function GoogleStyleMap({
  reports = [],
  center = [20.5937, 78.9629],
  selectedLocation = null,
  onLocationChange = () => {},
  zoom = 5,
  height = '520px',
}) {
  const isLiveLocation = selectedLocation && center?.[0] === selectedLocation[0] && center?.[1] === selectedLocation[1];

  return (
    <div className="google-style-map" style={{ height }}>
      <MapContainer center={center} zoom={zoom} minZoom={2} maxZoom={19} scrollWheelZoom className="google-style-map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <RecenterMap center={center} zoom={selectedLocation ? 16 : zoom} />
        <MapClickHandler onLocationChange={onLocationChange} />

        {selectedLocation && (
          <>
            <CircleMarker center={selectedLocation} radius={8} pathOptions={{ color: '#1A73E8', weight: 3, fillColor: '#4285F4', fillOpacity: 1 }}>
              <Popup>{isLiveLocation ? 'Your live device location' : 'Selected map location'}</Popup>
            </CircleMarker>
            {isLiveLocation && <Circle center={selectedLocation} radius={45} pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.12, weight: 1 }} />}
          </>
        )}

        {reports.map((report) => {
          const [longitude, latitude] = report.location.coordinates;
          return (
            <Marker key={report._id} position={[latitude, longitude]} icon={reportIcon(report.status)}>
              <Popup>
                <div className="min-w-[190px] font-body">
                  <p className="mb-1 font-semibold text-slate-900">{report.title}</p>
                  <p className="mb-2 text-xs text-slate-600">{report.address || 'Streetlight report'}</p>
                  <Link to={`/reports/${report._id}`} className="text-xs font-semibold text-blue-700 hover:underline">
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="google-style-map-hint">Tap the map to select a location</div>
    </div>
  );
}
