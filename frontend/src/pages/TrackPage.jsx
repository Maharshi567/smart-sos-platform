import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

// ============================================================
// TrackPage — PUBLIC page, no login required
// Route: /track/:id
// Add to App.jsx: <Route path="/track/:id" element={<TrackPage />} />
// ============================================================

const TrackPage = () => {
  const { id } = useParams();

  const [trackData, setTrackData]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [expired, setExpired]       = useState(false);
  const [lastFetch, setLastFetch]   = useState(null);
  const [mapReady, setMapReady]     = useState(false);

  const mapRef       = useRef(null);   // DOM div
  const leafletMap   = useRef(null);   // L.Map instance
  const markerRef    = useRef(null);   // L.Marker instance
  const circleRef    = useRef(null);   // accuracy circle
  const refreshTimer = useRef(null);
  const LRef         = useRef(null);   // Leaflet library ref

  // ── Load Leaflet dynamically (no npm install needed) ──
  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    if (window.L) {
      LRef.current = window.L;
      setMapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      LRef.current = window.L;
      setMapReady(true);
    };
    document.head.appendChild(script);
  }, []);

  // ── Fetch location from backend ──
  const fetchLocation = async () => {
    try {
      const res = await fetch(`https://smart-sos-platform.onrender.com/api/tracking/${id}`);
      const data = await res.json();

      if (res.status === 404 || res.status === 410) {
        setExpired(true);
        setError(data.error || "This tracking link has expired or been stopped.");
        clearInterval(refreshTimer.current);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch location");
      }

      setTrackData(data);
      setLastFetch(new Date());
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Unable to fetch location. Check your connection.");
      setLoading(false);
    }
  };

  // Initial fetch + auto-refresh every 15 seconds
  useEffect(() => {
    fetchLocation();
    refreshTimer.current = setInterval(fetchLocation, 15000);
    return () => clearInterval(refreshTimer.current);
  }, [id]);

  // ── Initialize Leaflet map once mapReady + trackData available ──
  useEffect(() => {
    if (!mapReady || !trackData || !mapRef.current || leafletMap.current) return;

    const L = LRef.current;

    // Create map
    const map = L.map(mapRef.current, {
      center: [trackData.lat, trackData.lng],
      zoom: 16,
      zoomControl: true,
    });

    // OpenStreetMap tiles (free, no API key)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom red pulsing marker icon
    const redIcon = L.divIcon({
      html: `
        <div style="
          width:22px; height:22px; border-radius:50%;
          background:#ff2d2d; border:3px solid #fff;
          box-shadow:0 0 0 0 rgba(255,45,45,0.6);
          animation:trackPulse 1.8s infinite;
        "></div>
        <style>
          @keyframes trackPulse {
            0%   { box-shadow:0 0 0 0 rgba(255,45,45,0.6); }
            70%  { box-shadow:0 0 0 18px rgba(255,45,45,0); }
            100% { box-shadow:0 0 0 0 rgba(255,45,45,0); }
          }
        </style>
      `,
      className: "",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    // Marker
    const marker = L.marker([trackData.lat, trackData.lng], { icon: redIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:sans-serif;text-align:center;min-width:140px">
          <strong style="font-size:1rem">📍 ${trackData.name}</strong><br/>
          <span style="color:#6b7280;font-size:0.78rem">Sharing live location</span>
        </div>
      `, { maxWidth: 200 })
      .openPopup();

    // Accuracy circle
    const circle = L.circle([trackData.lat, trackData.lng], {
      radius: 30,
      color: "#ff2d2d",
      fillColor: "#ff2d2d",
      fillOpacity: 0.12,
      weight: 1,
    }).addTo(map);

    leafletMap.current = map;
    markerRef.current  = marker;
    circleRef.current  = circle;
  }, [mapReady, trackData]);

  // ── Update marker position when trackData changes ──
  useEffect(() => {
    if (!leafletMap.current || !markerRef.current || !trackData) return;

    const latlng = [trackData.lat, trackData.lng];
    markerRef.current.setLatLng(latlng);
    circleRef.current?.setLatLng(latlng);
    leafletMap.current.panTo(latlng, { animate: true, duration: 1 });
  }, [trackData?.lat, trackData?.lng]);

  // ── Helpers ──
  const timeSince = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 10)  return "just now";
    if (diff < 60)  return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const timeUntilExpiry = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((new Date(dateStr) - Date.now()) / 1000);
    if (diff <= 0) return "Expired";
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) return `${h}h ${m}m remaining`;
    if (m > 0) return `${m}m ${s}s remaining`;
    return `${s}s remaining`;
  };

  const openInGoogleMaps = () => {
    if (!trackData) return;
    window.open(
      `https://www.google.com/maps?q=${trackData.lat},${trackData.lng}`,
      "_blank"
    );
  };

  const openInWaze = () => {
    if (!trackData) return;
    window.open(
      `https://waze.com/ul?ll=${trackData.lat},${trackData.lng}&navigate=yes`,
      "_blank"
    );
  };

  // ── RENDER ──
  return (
    <div style={styles.page}>

      {/* ── TOP BAR ── */}
      <div style={styles.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={styles.appLogo}>🛡️</div>
          <div>
            <p style={styles.appName}>SmartSOS</p>
            <p style={styles.appSub}>Live Location Tracker</p>
          </div>
        </div>
        {trackData && !expired && (
          <div style={styles.liveBadge}>
            <div style={styles.liveDot} />
            LIVE
          </div>
        )}
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={styles.centerBox}>
          <div style={styles.spinner} />
          <p style={{ color: "#6b7280", marginTop: "1rem", fontSize: "0.95rem" }}>
            Fetching live location...
          </p>
        </div>
      )}

      {/* ── ERROR / EXPIRED ── */}
      {!loading && (error || expired) && (
        <div style={styles.centerBox}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
            {expired ? "⏰" : "❌"}
          </div>
          <h2 style={{ color: "#111827", fontWeight: "900", marginBottom: "0.5rem", fontSize: "1.4rem" }}>
            {expired ? "Link Expired" : "Not Found"}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: "320px", textAlign: "center" }}>
            {error || "This tracking link is no longer active."}
          </p>
          <div style={{ marginTop: "1.5rem", background: "#f9fafb", borderRadius: "12px", padding: "1rem", maxWidth: "320px", textAlign: "left" }}>
            <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.4rem" }}>ℹ️ Why did this happen?</p>
            <p style={{ color: "#6b7280", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>
              Live location links expire automatically after the set duration, or when the person stops sharing manually. Ask them to share a new link.
            </p>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {!loading && trackData && !expired && (
        <>
          {/* Person info card */}
          <div style={styles.infoCard}>
            <div style={styles.avatarCircle}>
              {trackData.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={styles.personName}>{trackData.name}</p>
              <p style={styles.personSub}>is sharing their live location with you</p>
            </div>
            <div style={styles.expiryBadge}>
              ⏰ {timeUntilExpiry(trackData.expiresAt)}
            </div>
          </div>

          {/* Stats row */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statIcon}>🕐</span>
              <p style={styles.statLabel}>Updated</p>
              <p style={styles.statValue}>{timeSince(trackData.lastUpdated)}</p>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statIcon}>📡</span>
              <p style={styles.statLabel}>Refreshes</p>
              <p style={styles.statValue}>Every 15s</p>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statIcon}>📍</span>
              <p style={styles.statLabel}>GPS</p>
              <p style={styles.statValue} style={{ color: "#16a34a", fontWeight: "700" }}>Active</p>
            </div>
          </div>

          {/* MAP */}
          <div style={styles.mapWrapper}>
            {!mapReady && (
              <div style={styles.mapPlaceholder}>
                <div style={styles.spinner} />
                <p style={{ color: "#6b7280", marginTop: "1rem", fontSize: "0.88rem" }}>Loading map...</p>
              </div>
            )}
            <div
              ref={mapRef}
              style={{ ...styles.mapDiv, display: mapReady ? "block" : "none" }}
            />
          </div>

          {/* Coordinates */}
          <div style={styles.coordsCard}>
            <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
              📌 {trackData.lat.toFixed(6)}, {trackData.lng.toFixed(6)}
            </span>
            <button onClick={fetchLocation} style={styles.refreshBtn}>
              🔄 Refresh Now
            </button>
          </div>

          {/* Navigation buttons */}
          <div style={styles.navButtons}>
            <button onClick={openInGoogleMaps} style={styles.googleBtn}>
              🗺️ Open in Google Maps
            </button>
            <button onClick={openInWaze} style={styles.wazeBtn}>
              🚗 Navigate in Waze
            </button>
          </div>

          {/* Safety note */}
          <div style={styles.safetyNote}>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.7 }}>
              🔒 <strong>Privacy:</strong> This link was shared by {trackData.name} via SmartSOS.
              Location auto-deletes when the link expires. No account needed to view.
            </p>
          </div>

          {/* Auto-refresh notice */}
          <p style={styles.autoRefreshNote}>
            🔄 Map auto-refreshes every 15 seconds • Last check: {lastFetch ? lastFetch.toLocaleTimeString() : "—"}
          </p>
        </>
      )}

      {/* Global styles */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(1.5); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes trackPulse {
          0%   { box-shadow:0 0 0 0 rgba(255,45,45,0.6); }
          70%  { box-shadow:0 0 0 18px rgba(255,45,45,0); }
          100% { box-shadow:0 0 0 0 rgba(255,45,45,0); }
        }

        /* Override Leaflet z-index so it doesn't go over our top bar */
        .leaflet-control-zoom { z-index: 400 !important; }
      `}</style>
    </div>
  );
};

// ============================================================
// STYLES
// ============================================================
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fa",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    paddingBottom: "2rem",
  },

  // Top bar
  topBar: {
    background: "#fff",
    borderBottom: "1px solid #e8ecf0",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 500,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  appLogo: { fontSize: "1.6rem" },
  appName: { margin: 0, fontWeight: "800", color: "#111827", fontSize: "1rem" },
  appSub:  { margin: 0, color: "#6b7280", fontSize: "0.72rem" },
  liveBadge: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "#ff2d2d", color: "#fff",
    padding: "5px 12px", borderRadius: "50px",
    fontWeight: "800", fontSize: "0.75rem", letterSpacing: "1px",
  },
  liveDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#fff", animation: "livePulse 1.5s infinite",
  },

  // Loading / Error centered
  centerBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "4rem 2rem", textAlign: "center",
  },
  spinner: {
    width: "40px", height: "40px", borderRadius: "50%",
    border: "4px solid #e8ecf0", borderTopColor: "#ff2d2d",
    animation: "spin 0.8s linear infinite",
  },

  // Info card
  infoCard: {
    display: "flex", alignItems: "center", gap: "0.8rem",
    background: "#fff", margin: "1rem",
    borderRadius: "16px", padding: "1rem 1.1rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1px solid #e8ecf0",
    flexWrap: "wrap",
  },
  avatarCircle: {
    width: "48px", height: "48px", borderRadius: "50%",
    background: "linear-gradient(135deg,#ff2d2d,#e94560)",
    color: "#fff", fontWeight: "900", fontSize: "1.3rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  personName: { margin: 0, fontWeight: "800", color: "#111827", fontSize: "1.05rem" },
  personSub:  { margin: "2px 0 0", color: "#6b7280", fontSize: "0.78rem" },
  expiryBadge: {
    background: "#fff7ed", border: "1px solid #fed7aa",
    color: "#d97706", padding: "5px 10px", borderRadius: "50px",
    fontSize: "0.72rem", fontWeight: "700", whiteSpace: "nowrap",
  },

  // Stats
  statsRow: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
    gap: "0.6rem", margin: "0 1rem 1rem",
  },
  statBox: {
    background: "#fff", borderRadius: "12px", padding: "0.8rem 0.5rem",
    textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    border: "1px solid #e8ecf0",
  },
  statIcon:  { fontSize: "1.3rem" },
  statLabel: { margin: "3px 0 2px", color: "#9ca3af", fontSize: "0.7rem", fontWeight: "600" },
  statValue: { margin: 0, color: "#111827", fontSize: "0.82rem", fontWeight: "700" },

  // Map
  mapWrapper: {
    margin: "0 1rem 1rem",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    height: "380px",
    background: "#e8ecf0",
    position: "relative",
  },
  mapDiv: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },

  // Coords
  coordsCard: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    margin: "0 1rem 0.8rem", background: "#fff",
    borderRadius: "10px", padding: "10px 14px",
    border: "1px solid #e8ecf0", flexWrap: "wrap", gap: "0.5rem",
  },
  refreshBtn: {
    background: "#3b82f6", color: "#fff", border: "none",
    padding: "7px 14px", borderRadius: "8px", fontWeight: "700",
    fontSize: "0.78rem", cursor: "pointer",
  },

  // Navigation buttons
  navButtons: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "0.7rem", margin: "0 1rem 1rem",
  },
  googleBtn: {
    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    color: "#fff", border: "none", padding: "13px 10px",
    borderRadius: "12px", fontWeight: "700", fontSize: "0.85rem",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
  },
  wazeBtn: {
    background: "linear-gradient(135deg,#06b6d4,#0e7490)",
    color: "#fff", border: "none", padding: "13px 10px",
    borderRadius: "12px", fontWeight: "700", fontSize: "0.85rem",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(6,182,212,0.3)",
  },

  // Notes
  safetyNote: {
    margin: "0 1rem 0.5rem",
    background: "#f0fdf4", border: "1px solid #86efac",
    borderRadius: "10px", padding: "10px 14px",
  },
  autoRefreshNote: {
    textAlign: "center", color: "#9ca3af",
    fontSize: "0.72rem", margin: "0.5rem 1rem 0",
  },
};

export default TrackPage;