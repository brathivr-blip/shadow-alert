import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import GoogleStyleMap from '../components/GoogleStyleMap';
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
  const [permissionState, setPermissionState] = useState('prompt');
  const [locationError, setLocationError] = useState('');
  const [mapError, setMapError] = useState('');
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [telemetry, setTelemetry] = useState({ accuracy: null, speed: null, heading: null, updatedAt: null });
  const [initialLocation, setInitialLocation] = useState(null);
  const watchIdRef = useRef(null);
  const initialCapturedRef = useRef(false);

  const locationId = selectedLocation
    ? `${selectedLocation[0].toFixed(6)}, ${selectedLocation[1].toFixed(6)}`
    : '';

  const copyLocationId = async () => {
    if (!locationId) return;
    await navigator.clipboard?.writeText(locationId);
    setCopiedLocation(true);
    window.setTimeout(() => setCopiedLocation(false), 1600);
  };

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

  const sendLiveLocation = async (coords, locationType) => {
    const token = localStorage.getItem('shadowalert_token');
    if (!token || token === 'demo-token') return;
    try {
      await api.patch('/auth/location', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        speed: coords.speed,
        heading: coords.heading,
        locationType,
      });
    } catch {
      // GPS display remains local if the optional persistence request fails.
    }
  };

  const handlePosition = (position) => {
    const { coords } = position;
    setPermissionState('granted');
    const location = [coords.latitude, coords.longitude];
    if (!initialCapturedRef.current) {
      initialCapturedRef.current = true;
      setInitialLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: position.timestamp,
      });
      sendLiveLocation(coords, 'initial');
    }
    setCenter(location);
    setSelectedLocation(location);
    setTelemetry({
      accuracy: coords.accuracy,
      speed: coords.speed,
      heading: coords.heading,
      updatedAt: new Date(),
    });
    setLocationState('live');
    sendLiveLocation(coords, 'current');
  };

  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported');
      return;
    }

    stopWatchingLocation();
    initialCapturedRef.current = false;
    setInitialLocation(null);
    setTelemetry({ accuracy: null, speed: null, heading: null, updatedAt: null });
    setLocationState('loading');
    setLocationError('');
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (error) => {
        if (error.code === 1) setPermissionState('denied');
        setLocationError(getLocationError(error));
        setLocationState(error.code === 1 ? 'denied' : 'error');
        stopWatchingLocation();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  const stopLiveTracking = () => {
    stopWatchingLocation();
    setLocationState('stopped');
  };

  useEffect(() => {
    if (!navigator.permissions?.query) return undefined;
    let permission;
    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
      permission = status;
      setPermissionState(status.state);
      status.onchange = () => setPermissionState(status.state);
    }).catch(() => {});
    return () => {
      if (permission) permission.onchange = null;
      stopWatchingLocation();
    };
  }, []);

  const handleMapLocationChange = (location) => {
    stopWatchingLocation();
    setCenter(location);
    setSelectedLocation(location);
    setLocationError('');
    setLocationState('manual');
  };

  useEffect(() => {
    setLoading(true);
    setMapError('');
    api
      .get('/reports/map', { params: statusFilter ? { status: statusFilter } : {} })
      .then(({ data }) => setReports(data.reports))
      .catch(() => {
        setReports([]);
        setMapError('Report data is temporarily unavailable. The live map and location controls are still active.');
      })
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
          {locationState === 'live' || locationState === 'loading' ? (
            <button type="button" onClick={stopLiveTracking} className="btn-secondary">
              {locationState === 'loading' ? 'Acquiring GPS...' : 'Stop Tracking'}
            </button>
          ) : (
            <button type="button" onClick={startLiveTracking} disabled={locationState === 'unsupported'} className="btn-secondary">
              Start Live Tracking
            </button>
          )}
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

      {locationState === 'unsupported' && <p className="mb-4 text-sm text-ink-500">This browser does not support location access.</p>}
      {(locationState === 'denied' || locationState === 'error') && <p className="mb-4 text-sm text-ink-500">{locationError}</p>}
      {locationState === 'loading' && <p className="mb-4 text-sm text-glow">Acquiring GPS location...</p>}
      {locationState === 'live' && <p className="mb-4 text-sm text-glow">Live GPS is active. Tap Stop Tracking to end it.</p>}
      {permissionState === 'prompt' && locationState === 'idle' && <p className="mb-4 text-sm text-ink-500">Location permission will be requested when you start tracking.</p>}
      <p className="mb-4 text-xs uppercase tracking-wide text-ink-600">GPS permission: {permissionState}</p>
      {locationState === 'manual' && <p className="mb-4 text-sm text-ink-500">Manual map point selected. Click Start Live Tracking for live GPS.</p>}
      {locationId && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-300">
          <span>Location ID: <strong className="font-mono text-ink-100">{locationId}</strong></span>
          <button type="button" onClick={copyLocationId} className="text-glow hover:underline">
            {copiedLocation ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      {initialLocation && (
        <div className="mb-4 rounded-xl border border-glow/30 bg-midnight-900/50 p-4 text-sm text-ink-300">
          <p className="mb-2 font-semibold text-glow">Initial Location</p>
          <div className="grid gap-1 sm:grid-cols-2">
            <span>Latitude: <strong className="font-mono text-ink-100">{initialLocation.latitude.toFixed(6)}</strong></span>
            <span>Longitude: <strong className="font-mono text-ink-100">{initialLocation.longitude.toFixed(6)}</strong></span>
            <span>Accuracy: <strong className="text-ink-100">{Math.round(initialLocation.accuracy)} m</strong></span>
            <span>Timestamp: <strong className="text-ink-100">{new Date(initialLocation.timestamp).toLocaleString()}</strong></span>
          </div>
        </div>
      )}
      {telemetry.updatedAt && (
        <div className="mb-4 grid max-w-xl grid-cols-2 gap-2 text-xs text-ink-400 sm:grid-cols-4">
          <span>Accuracy: <strong className="text-ink-100">{Math.round(telemetry.accuracy)} m</strong></span>
          <span>Speed: <strong className="text-ink-100">{telemetry.speed == null ? '—' : `${(telemetry.speed * 3.6).toFixed(1)} km/h`}</strong></span>
          <span>Heading: <strong className="text-ink-100">{telemetry.heading == null ? '—' : `${Math.round(telemetry.heading)}°`}</strong></span>
          <span>Updated: <strong className="text-ink-100">{telemetry.updatedAt.toLocaleTimeString()}</strong></span>
        </div>
      )}
      {mapError && <p className="mb-4 text-sm text-ink-500">{mapError}</p>}
      {loading ? <Loader label="Loading map" /> : (
        <GoogleStyleMap
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
