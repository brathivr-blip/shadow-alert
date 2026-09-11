import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import MapView from '../components/MapView';
import Loader from '../components/Loader';

const LEGEND = [
  { status: 'pending', label: 'Pending', color: '#8592AD' },
  { status: 'verified', label: 'Verified', color: '#F5A623' },
  { status: 'in_progress', label: 'In progress', color: '#60A5FA' },
  { status: 'resolved', label: 'Resolved', color: '#34D399' },
  { status: 'rejected', label: 'Rejected', color: '#E5484D' },
];

export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [center, setCenter] = useState([20.5937, 78.9629]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationState, setLocationState] = useState('idle');
  const watchIdRef = useRef(null);

  const stopWatchingLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const getLocationError = (error) => {
    if (error.code === 1) return 'Location access was denied. Allow location access for this site, then try again.';
    if (error.code === 2) return 'Your location could not be found. Check your device location services and try again.';
    if (error.code === 3) return 'Location request timed out. Check your connection and try again.';
    return 'Unable to read your location. Try again or tap the map to choose a point.';
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported');
      return;
    }

    stopWatchingLocation();
    setLocationState('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = [coords.latitude, coords.longitude];
        setCenter(location);
        setSelectedLocation(location);
        setLocationState('live');
        watchIdRef.current = navigator.geolocation.watchPosition(
          ({ coords: nextCoords }) => {
            const nextLocation = [nextCoords.latitude, nextCoords.longitude];
            setCenter(nextLocation);
            setSelectedLocation(nextLocation);
            setLocationState('live');
          },
          (error) => setLocationState(error.code === 1 ? 'denied' : 'error'),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
      },
      (error) => setLocationState(error.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  useEffect(() => () => stopWatchingLocation(), []);

  const handleMapLocationChange = (location) => {
    stopWatchingLocation();
    setCenter(location);
    setSelectedLocation(location);
    setLocationState('manual');
  };

  useEffect(() => {
    setLoading(true);
    api
      .get('/reports/map', { params: statusFilter ? { status: statusFilter } : {} })
      .then(({ data }) => setReports(data.reports))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-100">Live outage map</h1>
          <p className="mt-1 text-ink-500">Every reported streetlight, plotted where it stands.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={useMyLocation} disabled={locationState === 'loading'} className="btn-secondary">
            {locationState === 'loading' ? 'Locating...' : locationState === 'live' ? 'Live location on' : 'Use my location'}
          </button>
          {LEGEND.map((l) => (
            <button
              key={l.status}
              type="button"
              onClick={() => setStatusFilter((s) => (s === l.status ? '' : l.status))}
              className={`pill border transition ${
                statusFilter === l.status ? 'border-glow text-glow bg-glow/10' : 'border-midnight-600 text-ink-500'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {locationState === 'denied' && <p className="mb-4 text-sm text-ink-500">Location access was denied. Enable it in your browser settings.</p>}
      {locationState === 'unsupported' && <p className="mb-4 text-sm text-ink-500">This browser does not support location access.</p>}
      {locationState === 'error' && <p className="mb-4 text-sm text-ink-500">Unable to read your live location. Check browser permissions and device location services.</p>}
      {locationState === 'live' && <p className="mb-4 text-sm text-glow">Live location is active. Tap the map to choose another point.</p>}
      {loading ? <Loader label="Loading map" /> : (
        <MapView
          reports={reports}
          center={center}
          selectedLocation={selectedLocation}
          onLocationChange={handleMapLocationChange}
          height="640px"
        />
      )}
    </div>
  );
}
