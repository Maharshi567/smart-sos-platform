import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const emojiIcon = (emoji) => L.divIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${emoji}</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const MapComponent = ({ height = '400px', showServices = true, trackPath = false }) => {
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setLocation(loc);
        if (trackPath) setPath(prev => [...prev.slice(-50), loc]);

        if (showServices && services.length === 0) {
          const [lat, lng] = loc;
          setServices([
            { type: 'hospital', name: 'City General Hospital', pos: [lat + 0.005, lng + 0.008], phone: '108', dist: '0.8 km' },
            { type: 'hospital', name: "St. Mary's Hospital", pos: [lat - 0.007, lng + 0.003], phone: '108', dist: '1.1 km' },
            { type: 'police', name: 'Central Police Station', pos: [lat + 0.003, lng - 0.006], phone: '100', dist: '1.2 km' },
            { type: 'police', name: 'North Police Post', pos: [lat - 0.004, lng - 0.009], phone: '100', dist: '1.8 km' },
            { type: 'fire', name: 'Fire & Rescue Station', pos: [lat + 0.009, lng + 0.002], phone: '101', dist: '2.1 km' },
          ]);
        }
        setLoading(false);
      },
      () => { setError('Location access denied'); setLoading(false); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getIcon = (type) => {
    const map = { hospital: '🏥', police: '🚓', fire: '🚒' };
    return emojiIcon(map[type] || '📍');
  };

  if (loading) return (
    <div style={{ ...styles.placeholder, height }}>
      <div style={styles.spinner} />
      <p style={{ color: '#a0aec0', marginTop: '1rem' }}>📍 Getting your location...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !location) return (
    <div style={{ ...styles.placeholder, height }}>
      <span style={{ fontSize: '3rem' }}>📍</span>
      <p style={{ color: '#a0aec0', marginTop: '1rem' }}>
        {error || 'Location unavailable'}
      </p>
      <p style={{ color: '#4a5568', fontSize: '0.85rem', marginTop: '0.5rem' }}>
        Please enable GPS and refresh
      </p>
    </div>
  );

  return (
    <div style={{ height, borderRadius: '16px', overflow: 'hidden', border: '1px solid #2d4a7a' }}>
      <MapContainer
        center={location}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* User location */}
        <Marker position={location} icon={emojiIcon('🔵')}>
          <Popup>
            <strong>📍 Your Location</strong><br />
            <small>Lat: {location[0].toFixed(5)}</small><br />
            <small>Lng: {location[1].toFixed(5)}</small>
          </Popup>
        </Marker>

        {/* Accuracy circle */}
        <Circle
          center={location}
          radius={150}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1 }}
        />

        {/* Path tracking */}
        {trackPath && path.length > 1 && (
          <Polyline positions={path} pathOptions={{ color: '#e94560', weight: 3, opacity: 0.8 }} />
        )}

        {/* Nearby services */}
        {showServices && services.map((s, i) => (
          <Marker key={i} position={s.pos} icon={getIcon(s.type)}>
            <Popup>
              <div style={{ minWidth: '170px', fontFamily: 'sans-serif' }}>
                <strong style={{ fontSize: '0.95rem' }}>{s.name}</strong><br />
                <span style={{ color: '#666', fontSize: '0.85rem' }}>📏 {s.dist}</span><br />
                <a href={`tel:${s.phone}`} style={{ color: '#e94560', fontWeight: 'bold' }}>
                  📞 Call: {s.phone}
                </a><br />
                
                  href={`https://www.google.com/maps/dir/${location[0]},${location[1]}/${s.pos[0]},${s.pos[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#3b82f6' }}
                >
                  🗺️ Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const styles = {
  placeholder: {
    background: '#1e2a45', borderRadius: '16px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    border: '1px solid #2d4a7a'
  },
  spinner: {
    width: '42px', height: '42px', borderRadius: '50%',
    border: '3px solid #2d4a7a', borderTop: '3px solid #e94560',
    animation: 'spin 1s linear infinite'
  },
};

export default MapComponent;