import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap,
} from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ===== ICON CREATOR =====
const createIcon = (emoji, size = 30) =>
  L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });

// ===== USER ARROW ICON — only the arrow rotates, NOT the map =====
const createUserArrowIcon = (headingDeg) => L.divIcon({
  html: `
    <div style="
      width:44px; height:44px;
      display:flex; align-items:center; justify-content:center;
      position:relative;
    ">
      <!-- Accuracy halo -->
      <div style="
        position:absolute;
        width:44px; height:44px;
        border-radius:50%;
        background:rgba(59,130,246,0.15);
        border:2px solid rgba(59,130,246,0.4);
      "></div>
      <!-- Rotating arrow -->
      <div style="
        transform:rotate(${headingDeg}deg);
        transition:transform 0.3s ease;
        display:flex; align-items:center; justify-content:center;
      ">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <!-- Shadow/glow -->
          <polygon points="16,3 25,27 16,21 7,27" fill="rgba(0,0,0,0.2)" transform="translate(1,2)"/>
          <!-- Main arrow -->
          <polygon points="16,3 25,27 16,21 7,27" fill="#2563eb" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Center dot -->
          <circle cx="16" cy="16" r="3" fill="white" opacity="0.9"/>
        </svg>
      </div>
    </div>
  `,
  className: "",
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

// ===== BEARING CALCULATOR =====
// Calculate compass bearing from point A to point B (in degrees, 0=North)
const calcBearing = (lat1, lng1, lat2, lng2) => {
  const toRad = d => (d * Math.PI) / 180;
  const toDeg = r => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const rlat1 = toRad(lat1);
  const rlat2 = toRad(lat2);
  const y = Math.sin(dLng) * Math.cos(rlat2);
  const x = Math.cos(rlat1) * Math.sin(rlat2) - Math.sin(rlat1) * Math.cos(rlat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

// Find which route segment the user is currently on (closest point)
const findCurrentSegment = (route, userLat, userLng) => {
  if (!route || route.length < 2) return { segIndex: 0, bearing: 0 };
  let minDist = Infinity;
  let bestSeg = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const [lat, lng] = route[i];
    const d = Math.hypot(lat - userLat, lng - userLng);
    if (d < minDist) { minDist = d; bestSeg = i; }
  }
  const [lat1, lng1] = route[bestSeg];
  const [lat2, lng2] = route[bestSeg + 1];
  return {
    segIndex: bestSeg,
    bearing: calcBearing(lat1, lng1, lat2, lng2),
  };
};

// Determine next turn type: "left", "right", "straight", or null
const getNextTurn = (route, segIndex) => {
  if (!route || segIndex + 2 >= route.length) return null;
  const b1 = calcBearing(route[segIndex][0], route[segIndex][1], route[segIndex + 1][0], route[segIndex + 1][1]);
  const b2 = calcBearing(route[segIndex + 1][0], route[segIndex + 1][1], route[segIndex + 2][0], route[segIndex + 2][1]);
  let diff = ((b2 - b1) + 360) % 360;
  if (diff > 180) diff -= 360; // -180 to +180
  if (Math.abs(diff) < 15) return { type: "straight", angle: diff };
  if (diff > 0) return { type: "right", angle: diff };
  return { type: "left", angle: diff };
};

// ===== HELPERS =====
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const calcTime = (distKm) => {
  const mins = Math.round((distKm / 30) * 60);
  if (mins < 1) return "1 min";
  if (mins < 60) return mins + " mins";
  return Math.floor(mins / 60) + "h " + (mins % 60) + "m";
};

// ===== MAP HELPER — Re-centre ONLY on button click, NEVER automatically =====
const UserLocationUpdater = ({ location, shouldRecentre, onRecentred }) => {
  const map = useMap();
  const firstRun = useRef(true);

  // Set view only on FIRST load
  useEffect(() => {
    if (!location || !firstRun.current) return;
    map.setView([location.lat, location.lng], 15);
    firstRun.current = false;
  }, [location, map]);

  // Re-centre ONLY when button clicked
  useEffect(() => {
    if (shouldRecentre && location) {
      map.setView([location.lat, location.lng], 15, { animate: true, duration: 0.8 });
      onRecentred();
    }
  }, [shouldRecentre, location, map, onRecentred]);

  return null;
};

// ===== ROUTE LAYER — draw route polyline, fit once =====
const RouteLayer = ({ route }) => {
  const map = useMap();
  const fittedRef = useRef(false);
  useEffect(() => {
    if (route?.length > 0 && !fittedRef.current) {
      map.fitBounds(L.latLngBounds(route), { padding: [70, 70], animate: true });
      fittedRef.current = true;
    }
  }, [route, map]);
  return route ? (
    <Polyline
      positions={route}
      pathOptions={{ color: "#2563eb", weight: 7, opacity: 0.9, lineCap: "round", lineJoin: "round" }}
    />
  ) : null;
};

// ===== OVERPASS QUERY BUILDER =====
const buildQuery = (lat, lng, radiusM) => `
  [out:json][timeout:120];
  (
    node["amenity"="hospital"](around:${radiusM},${lat},${lng});
    way["amenity"="hospital"](around:${radiusM},${lat},${lng});
    relation["amenity"="hospital"](around:${radiusM},${lat},${lng});
    node["amenity"="clinic"](around:${radiusM},${lat},${lng});
    way["amenity"="clinic"](around:${radiusM},${lat},${lng});
    node["amenity"="doctors"](around:${radiusM},${lat},${lng});
    node["amenity"="pharmacy"](around:${radiusM},${lat},${lng});
    node["amenity"="health_post"](around:${radiusM},${lat},${lng});
    node["amenity"="nursing_home"](around:${radiusM},${lat},${lng});
    node["amenity"="police"](around:${radiusM},${lat},${lng});
    way["amenity"="police"](around:${radiusM},${lat},${lng});
    node["amenity"="fire_station"](around:${radiusM},${lat},${lng});
    way["amenity"="fire_station"](around:${radiusM},${lat},${lng});
  );
  out center tags;
`;

const CHILD_REGEX = /child|children|paediatric|pediatric|maternity|baby|infant|neonat/i;

const parseElement = (el, userLat, userLng, radiusKm) => {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) return null;

  const dist = parseFloat(calcDistance(userLat, userLng, lat, lng));
  if (dist > radiusKm) return null;

  const tags = el.tags || {};
  const amenity = tags.amenity;
  const rawName = tags.name || tags["name:en"] || "";
  const speciality = tags["healthcare:speciality"] || tags["healthcare"] || "";
  const isChild =
    speciality === "paediatrics" ||
    speciality === "gynaecology" ||
    CHILD_REGEX.test(rawName);

  let type = null;
  let phone = tags.phone || tags["contact:phone"] || tags["contact:mobile"] || "";
  let name = rawName;

  if (amenity === "hospital") {
    type = isChild ? "child" : "hospital";
    if (!name) name = isChild ? "Children Hospital" : "Hospital";
    if (!phone) phone = "108";
  } else if (["clinic", "doctors", "health_post", "nursing_home"].includes(amenity)) {
    type = "clinic";
    if (!name) name = "Clinic";
    if (!phone) phone = "108";
  } else if (amenity === "pharmacy") {
    type = "clinic";
    if (!name) name = "Pharmacy";
    if (!phone) phone = "108";
  } else if (amenity === "police") {
    type = "police";
    if (!name) name = "Police Station";
    if (!phone) phone = "100";
  } else if (amenity === "fire_station") {
    type = "fire";
    if (!name) name = "Fire Station";
    if (!phone) phone = "101";
  }

  if (!type) return null;

  return {
    id: el.id, type, name, lat, lng,
    distance: dist + " km", distNum: dist,
    phone, time: calcTime(dist),
    address: tags["addr:street"]
      ? (tags["addr:housenumber"] ? tags["addr:housenumber"] + ", " : "") +
        tags["addr:street"] +
        (tags["addr:city"] ? ", " + tags["addr:city"] : "")
      : "",
    website: tags.website || tags["contact:website"] || "",
    opening_hours: tags.opening_hours || "",
  };
};

// ===== TURN DIRECTION BANNER =====
const TurnBanner = ({ turn, distToTurn }) => {
  if (!turn || turn.type === "straight") return null;
  const isRight = turn.type === "right";
  return (
    <div style={{
      position: "absolute", top: "12px", left: "12px", zIndex: 1000,
      background: "#1e293b", color: "#fff",
      borderRadius: "16px", padding: "12px 18px",
      display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      fontFamily: "sans-serif", minWidth: "180px",
      border: "2px solid rgba(255,255,255,0.1)",
    }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px",
        background: isRight ? "#2563eb" : "#7c3aed",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.6rem", flexShrink: 0,
      }}>
        {isRight ? "↱" : "↰"}
      </div>
      <div>
        <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {distToTurn < 0.05 ? "Now" : `In ${Math.round(distToTurn * 1000)}m`}
        </div>
        <div style={{ fontSize: "1rem", fontWeight: "800", marginTop: "2px" }}>
          Turn {turn.type}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const MapPage = () => {
  const [location, setLocation] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loadingGPS, setLoadingGPS] = useState(true);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [services, setServices] = useState([]);
  const [route, setRoute] = useState(null);
  const [routingTo, setRoutingTo] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [radiusUsed, setRadiusUsed] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [heading, setHeading] = useState(0);
  const [shouldRecentre, setShouldRecentre] = useState(false);
  // Navigation state
  const [currentSegment, setCurrentSegment] = useState(null);
  const [nextTurn, setNextTurn] = useState(null);
  const [routeBearing, setRouteBearing] = useState(0);

  const watchRef = useRef(null);
  const locationRef = useRef(null);

  const filters = [
    { key: "all",      label: "🔍 All",            color: "#e94560" },
    { key: "hospital", label: "🏥 Hospitals",       color: "#10b981" },
    { key: "child",    label: "👶 Child Hospitals", color: "#f43f5e" },
    { key: "clinic",   label: "🏨 Clinics",         color: "#8b5cf6" },
    { key: "police",   label: "🚓 Police",          color: "#3b82f6" },
    { key: "fire",     label: "🚒 Fire",            color: "#f97316" },
  ];

  const sections = [
    { key: "hospital", label: "🏥 Hospitals",          color: "#10b981", bg: "#f0fdf4", border: "#86efac" },
    { key: "child",    label: "👶 Child Hospitals",    color: "#f43f5e", bg: "#fff1f2", border: "#fecdd3" },
    { key: "clinic",   label: "🏨 Clinics & Pharmacy", color: "#8b5cf6", bg: "#faf5ff", border: "#e9d5ff" },
    { key: "police",   label: "🚓 Police Stations",    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    { key: "fire",     label: "🚒 Fire Stations",      color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  ];

  const getTypeColor = (type) => {
    const map = {
      hospital: { bg: "#f0fdf4", border: "#86efac", text: "#16a34a" },
      child:    { bg: "#fff1f2", border: "#fecdd3", text: "#e11d48" },
      clinic:   { bg: "#faf5ff", border: "#e9d5ff", text: "#7c3aed" },
      police:   { bg: "#eff6ff", border: "#bfdbfe", text: "#2563eb" },
      fire:     { bg: "#fff7ed", border: "#fed7aa", text: "#d97706" },
    };
    return map[type] || { bg: "#f9fafb", border: "#e8ecf0", text: "#374151" };
  };

  const getEmoji = (type) => ({
    hospital: "🏥", child: "👶", clinic: "🏨", police: "🚓", fire: "🚒"
  }[type] || "📍");

  // ===== UPDATE navigation info when location or route changes =====
  useEffect(() => {
    if (!route || !location) return;
    const { segIndex, bearing } = findCurrentSegment(route, location.lat, location.lng);
    setCurrentSegment(segIndex);
    setRouteBearing(bearing);
    const turn = getNextTurn(route, segIndex);
    setNextTurn(turn);
  }, [route, location]);

  // ===== FETCH REAL SERVICES =====
  const fetchServices = useCallback(async (lat, lng) => {
    setFetchingServices(true);
    setServices([]);

    const radii = [5000, 10000, 20000, 35000, 50000, 75000, 100000];
    let allResults = [];
    let usedRadius = 5;

    for (const radiusM of radii) {
      const radiusKm = radiusM / 1000;
      usedRadius = radiusKm;
      try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(buildQuery(lat, lng, radiusM)),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const parsed = [];
        const seen = new Set();
        data.elements.forEach((el) => {
          const item = parseElement(el, lat, lng, radiusKm);
          if (!item) return;
          const key = item.type + "|" + item.name.toLowerCase().trim();
          if (seen.has(key)) return;
          seen.add(key);
          parsed.push(item);
        });
        parsed.sort((a, b) => a.distNum - b.distNum);
        allResults = parsed;
        const typeCounts = {};
        parsed.forEach(p => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });
        const types = ["hospital", "clinic", "police", "fire"];
        const hasEnough = types.every(t => (typeCounts[t] || 0) >= 10);
        if (hasEnough || radiusM === 50000) break;
      } catch (err) {
        console.error("Overpass error:", err);
        if (radiusM === 50000) break;
      }
    }

    setRadiusUsed(usedRadius);
    setServices(allResults.slice(0, 150));
    setFetchingServices(false);
  }, []);

  // ===== GPS WATCH =====
  useEffect(() => {
    if (!navigator.geolocation) { setLoadingGPS(false); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        locationRef.current = loc;
        setLoadingGPS(false);
        fetchServices(loc.lat, loc.lng);
      },
      () => setLoadingGPS(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        locationRef.current = loc;
        // Update heading from GPS course if available
        if (pos.coords.heading != null && !isNaN(pos.coords.heading)) {
          setHeading(pos.coords.heading);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [fetchServices]);

  // ===== COMPASS HEADING (device orientation) =====
  useEffect(() => {
    const handleOrientation = (e) => {
      const h = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
      if (h != null) setHeading(h);
    };
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // ===== ROUTE with OSRM =====
  const getRoute = async (service) => {
    const loc = locationRef.current || location;
    if (!loc) return;
    setRouteLoading(true);
    setRoutingTo(service.id);
    setSelectedService(service);
    setRoute(null);
    setCurrentSegment(null);
    setNextTurn(null);
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${loc.lng},${loc.lat};${service.lng},${service.lat}` +
        `?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.[0]) {
        setRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
      } else {
        setRoute([[loc.lat, loc.lng], [service.lat, service.lng]]);
      }
    } catch {
      setRoute([[loc.lat, loc.lng], [service.lat, service.lng]]);
    }
    setRouteLoading(false);
  };

  // ===== UPDATE ROUTE when user moves =====
  useEffect(() => {
    if (!route || !selectedService || !location) return;
    const update = async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${location.lng},${location.lat};${selectedService.lng},${selectedService.lat}` +
          `?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          setRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
        }
      } catch {}
    };
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const clearRoute = () => {
    setRoute(null);
    setRoutingTo(null);
    setSelectedService(null);
    setCurrentSegment(null);
    setNextTurn(null);
    setRouteBearing(0);
  };

  const openNavigation = (service) => {
    const loc = location || locationRef.current;
    const url = loc
      ? `https://www.google.com/maps/dir/${loc.lat},${loc.lng}/${service.lat},${service.lng}/`
      : `https://www.google.com/maps/dir//${service.lat},${service.lng}/`;
    window.open(url, "_blank");
  };

  // Arrow heading: when on a route, show route bearing; otherwise show compass
  const arrowHeading = route && currentSegment != null ? routeBearing : heading;

  // Distance to next turn point
  const distToTurn = route && currentSegment != null && location
    ? parseFloat(calcDistance(
        location.lat, location.lng,
        route[Math.min(currentSegment + 1, route.length - 1)][0],
        route[Math.min(currentSegment + 1, route.length - 1)][1],
      ))
    : null;

  const filtered = filter === "all" ? services : services.filter(s => s.type === filter);
  const markersToShow = routingTo ? services.filter(s => s.id === routingTo) : filtered;

  // ===== SERVICE CARD =====
  const ServiceCard = ({ s }) => {
    const colors = getTypeColor(s.type);
    const isRouting = routingTo === s.id;
    return (
      <div style={{
        ...styles.serviceCard,
        borderTop: "3px solid " + colors.text,
        outline: isRouting ? "2px solid " + colors.text : "none",
      }}>
        <div style={styles.serviceTop}>
          <div style={{ ...styles.serviceIconBox, background: colors.bg }}>
            <span style={{ fontSize: "1.6rem" }}>{getEmoji(s.type)}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.serviceName}>{s.name}</p>
            {s.address && <p style={styles.serviceAddress}>📍 {s.address}</p>}
            <div style={styles.serviceMeta}>
              <span style={{ ...styles.metaBadge, background: colors.bg, color: colors.text }}>📏 {s.distance}</span>
              <span style={{ ...styles.metaBadge, background: "#f9fafb", color: "#374151" }}>⏱️ {s.time}</span>
              {s.opening_hours && (
                <span style={{ ...styles.metaBadge, background: "#fefce8", color: "#d97706" }}>
                  🕐 {s.opening_hours.slice(0, 20)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.serviceBtns}>
          <a href={"tel:" + s.phone}
            style={{ ...styles.callBtn, background: colors.bg, borderColor: colors.border, color: colors.text }}>
            📞 {s.phone}
          </a>
          <button
            onClick={() => isRouting ? clearRoute() : getRoute(s)}
            disabled={routeLoading && !isRouting}
            style={{
              ...styles.routeBtn,
              background: isRouting ? "#ff2d2d" : "#fff5f5",
              color: isRouting ? "#fff" : "#ff2d2d",
              borderColor: "#ff2d2d",
              opacity: routeLoading && !isRouting ? 0.5 : 1,
            }}>
            {isRouting ? "✕ Clear" : routeLoading && routingTo === s.id ? "⏳" : "🗺️ Route"}
          </button>
          <button onClick={() => openNavigation(s)} style={styles.navBtn}>🧭 Navigate</button>
        </div>
      </div>
    );
  };

  const totalByType = (type) => services.filter(s => s.type === type).length;

  return (
    <div style={styles.container}>

      {/* ===== NEAREST BAR ===== */}
      {services.length > 0 && (() => {
        const nearestTypes = [
          { key: "hospital", label: "🏥 Hospital", color: "#10b981" },
          { key: "child",    label: "👶 Child",    color: "#f43f5e" },
          { key: "clinic",   label: "🏨 Clinic",   color: "#8b5cf6" },
          { key: "police",   label: "🚓 Police",   color: "#3b82f6" },
          { key: "fire",     label: "🚒 Fire",     color: "#f97316" },
        ];
        return (
          <div style={{ marginBottom: "1.2rem" }}>
            <p style={{ fontWeight: "800", color: "#374151", fontSize: "0.95rem", marginBottom: "0.7rem" }}>⚡ Nearest to You</p>
            <div style={{ display: "flex", gap: "0.7rem", overflowX: "auto", paddingBottom: "6px" }}>
              {nearestTypes.map(nt => {
                const nearest = [...services].filter(s => s.type === nt.key).sort((a, b) => a.distNum - b.distNum)[0];
                if (!nearest) return null;
                return (
                  <button key={nt.key}
                    onClick={() => { setFilter(nt.key); getRoute(nearest); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.7rem",
                      background: "#fff", border: "1.5px solid " + nt.color + "66",
                      borderRadius: "14px", padding: "0.75rem 1rem",
                      minWidth: "185px", cursor: "pointer", flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "left",
                    }}>
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: nt.color + "18", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                    }}>{nt.label.split(" ")[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: "800", color: nt.color, textTransform: "uppercase", letterSpacing: "0.4px" }}>{nt.label}</p>
                      <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: "700", color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nearest.name}</p>
                      <p style={{ margin: 0, fontSize: "0.74rem", color: nt.color, fontWeight: "600" }}>📏 {nearest.distance}</p>
                    </div>
                    <span style={{ background: nt.color, color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem", flexShrink: 0 }}>→</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🗺️ Nearby Emergency Services</h2>
          <p style={styles.subtitle}>
            Real-time emergency services near you
            {location && <span style={styles.liveTag}>🟢 GPS Active</span>}
            {radiusUsed && !fetchingServices && <span style={styles.radiusTag}>📡 {radiusUsed}km radius</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexShrink: 0 }}>
          <button
            onClick={() => setShouldRecentre(true)}
            style={{ ...styles.refreshBtn, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            🎯 Re-centre
          </button>
          <button
            onClick={() => { if (location) fetchServices(location.lat, location.lng); }}
            disabled={fetchingServices}
            style={styles.refreshBtn}
          >
            {fetchingServices ? "⏳ Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* ===== ROUTE BANNER ===== */}
      {route && selectedService && (
        <div style={styles.routeBanner}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: "700", color: "#dc2626", margin: 0, fontSize: "0.95rem" }}>
              🗺️ Routing to: {selectedService.name}
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "3px 0 0" }}>
              📏 {selectedService.distance} • ⏱️ {selectedService.time}
              {route && currentSegment != null && (
                <span style={{ color: "#2563eb", marginLeft: "8px" }}>
                  • Heading: {Math.round(routeBearing)}°
                  {nextTurn && nextTurn.type !== "straight" && (
                    <span style={{ color: nextTurn.type === "right" ? "#f97316" : "#8b5cf6", marginLeft: "6px" }}>
                      • {nextTurn.type === "right" ? "↱" : "↰"} Turn {nextTurn.type} {distToTurn < 0.05 ? "now" : `in ${Math.round(distToTurn * 1000)}m`}
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <button onClick={() => openNavigation(selectedService)} style={styles.startNavBtn}>🧭 Navigate</button>
            <button onClick={clearRoute} style={styles.clearRouteBtn}>✕</button>
          </div>
        </div>
      )}

      {/* ===== MAP ===== */}
      {/* 
        IMPORTANT: The map wrapper has NO CSS rotation applied.
        The map is always fixed North-up. Only the user arrow icon rotates.
        Do NOT add transform:rotate() or any rotation to this div or the MapContainer.
      */}
      <div style={styles.mapWrapper}>
        {loadingGPS ? (
          <div style={styles.mapLoading}>
            <div style={styles.spinner} />
            <p style={{ fontWeight: "600", color: "#374151" }}>📍 Getting your location...</p>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Please allow location access</p>
          </div>
        ) : location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            // NO rotation, NO transform applied to map at any time
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={20}
            />

            {/* Re-centres ONLY on button click — never auto re-centres */}
            <UserLocationUpdater
              location={location}
              shouldRecentre={shouldRecentre}
              onRecentred={() => setShouldRecentre(false)}
            />

            {/* Route polyline */}
            {route && <RouteLayer route={route} />}

            {/* Turn banner overlaid on map */}
            {route && nextTurn && distToTurn != null && (
              <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1000, pointerEvents: "none" }}>
                <TurnBanner turn={nextTurn} distToTurn={distToTurn} />
              </div>
            )}

            {/* ===== USER LOCATION MARKER — arrow rotates, map stays fixed ===== */}
            <Marker
              position={[location.lat, location.lng]}
              icon={createUserArrowIcon(arrowHeading)}
              zIndexOffset={1000}
            >
              <Popup>
                <div style={{ fontFamily: "sans-serif", textAlign: "center" }}>
                  <strong>📍 Your Live Location</strong><br />
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span><br />
                  <span style={{ fontSize: "0.75rem", color: "#3b82f6" }}>
                    Heading: {Math.round(arrowHeading)}°
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* Accuracy circle around user */}
            <Circle
              center={[location.lat, location.lng]}
              radius={80}
              pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.1, weight: 1.5, dashArray: "4, 4" }}
            />

            {/* ===== SERVICE MARKERS ===== */}
            {markersToShow.map((s) => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={createIcon(getEmoji(s.type), routingTo === s.id ? 36 : 28)}
              >
                <Popup>
                  <div style={{ minWidth: "220px", fontFamily: "sans-serif" }}>
                    <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "#111", marginBottom: "4px" }}>
                      {getEmoji(s.type)} {s.name}
                    </div>
                    {s.address && <div style={{ color: "#6b7280", fontSize: "0.78rem", marginBottom: "6px" }}>📍 {s.address}</div>}
                    <div style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "10px" }}>📏 {s.distance} • ⏱️ {s.time}</div>
                    {s.opening_hours && <div style={{ color: "#d97706", fontSize: "0.78rem", marginBottom: "8px" }}>🕐 {s.opening_hours}</div>}
                    <a href={"tel:" + s.phone} style={{
                      display: "block", background: "#f0fdf4", color: "#16a34a",
                      fontWeight: "700", padding: "8px", borderRadius: "8px",
                      textAlign: "center", marginBottom: "6px", textDecoration: "none",
                    }}>📞 Call {s.phone}</a>
                    <button onClick={() => getRoute(s)} style={{
                      display: "block", width: "100%", background: "#eff6ff",
                      color: "#2563eb", fontWeight: "700", padding: "8px",
                      borderRadius: "8px", border: "1px solid #bfdbfe",
                      cursor: "pointer", marginBottom: "6px", fontSize: "0.85rem",
                    }}>🗺️ Show Route</button>
                    <button onClick={() => openNavigation(s)} style={{
                      display: "block", width: "100%", background: "#16a34a",
                      color: "#fff", fontWeight: "700", padding: "8px",
                      borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.85rem",
                    }}>🧭 Open in Google Maps</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div style={styles.mapLoading}>
            <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>❌ Location unavailable</p>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Please enable GPS and reload</p>
          </div>
        )}
      </div>

      {/* ===== FILTER BAR ===== */}
      <div style={styles.filtersBox}>
        <div style={styles.filtersRow}>
          {filters.map((f) => {
            const count = f.key === "all" ? services.length : totalByType(f.key);
            const active = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                ...styles.filterBtn,
                background: active ? f.color : "#fff",
                borderColor: f.color,
                color: active ? "#fff" : f.color,
              }}>
                {f.label}
                <span style={{
                  marginLeft: "5px", fontSize: "0.72rem", fontWeight: "800",
                  background: active ? "rgba(255,255,255,0.25)" : f.color + "22",
                  padding: "1px 7px", borderRadius: "50px",
                }}>
                  {fetchingServices ? "…" : count}
                </span>
              </button>
            );
          })}
        </div>
        {fetchingServices && (
          <div style={styles.fetchingBar}>
            <div style={styles.fetchingDot} />
            <span>Finding real services near you... expanding search radius if needed</span>
          </div>
        )}
      </div>

      {/* ===== RESULTS ===== */}
      {!fetchingServices && services.length === 0 && !loadingGPS && (
        <div style={styles.noResults}>
          <p style={{ fontSize: "1.2rem" }}>😔 No services found</p>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Try clicking Refresh or check your internet connection</p>
        </div>
      )}

      {filter === "all" ? (
        sections.map((sec) => {
          const list = services.filter(s => s.type === sec.key);
          if (list.length === 0) return null;
          return (
            <div key={sec.key} style={{ marginBottom: "2.5rem" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: sec.bg, borderLeft: "4px solid " + sec.color,
                borderRadius: "12px", padding: "0.8rem 1.2rem", marginBottom: "1rem",
              }}>
                <h3 style={{ color: sec.color, fontWeight: "800", fontSize: "1.05rem", margin: 0 }}>{sec.label}</h3>
                <span style={{ background: sec.color, color: "#fff", padding: "3px 14px", borderRadius: "50px", fontSize: "0.78rem", fontWeight: "700" }}>
                  {list.length} found
                </span>
              </div>
              <div style={styles.servicesGrid}>
                {list.map(s => <ServiceCard key={s.id} s={s} />)}
              </div>
            </div>
          );
        })
      ) : (
        (() => {
          const sec = sections.find(s => s.key === filter);
          if (!sec) return null;
          return (
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: sec.bg, borderLeft: "4px solid " + sec.color,
                borderRadius: "12px", padding: "0.8rem 1.2rem", marginBottom: "1rem",
              }}>
                <h3 style={{ color: sec.color, fontWeight: "800", fontSize: "1.05rem", margin: 0 }}>{sec.label}</h3>
                <span style={{ background: sec.color, color: "#fff", padding: "3px 14px", borderRadius: "50px", fontSize: "0.78rem", fontWeight: "700" }}>
                  {filtered.length} found
                </span>
              </div>
              {filtered.length === 0 && !fetchingServices ? (
                <div style={styles.noResults}>
                  <p>😔 No {sec.label} found nearby</p>
                  <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Click Refresh to search a wider area</p>
                </div>
              ) : (
                <div style={styles.servicesGrid}>
                  {filtered.map(s => <ServiceCard key={s.id} s={s} />)}
                </div>
              )}
            </div>
          );
        })()
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .leaflet-container { border-radius: 16px; }
        .leaflet-popup-content { margin: 10px 14px; }
        .leaflet-popup-content-wrapper { border-radius: 14px; }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    padding: "clamp(1rem, 4vw, 2rem)",
    background: "#f5f7fa",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "1rem",
    flexWrap: "wrap", gap: "0.8rem",
  },
  title: { fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: "bold", color: "#212121", margin: 0 },
  subtitle: {
    color: "#6b7280", marginTop: "4px", fontSize: "0.88rem",
    display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap",
  },
  liveTag: {
    background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a",
    padding: "3px 10px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "700",
  },
  radiusTag: {
    background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb",
    padding: "3px 10px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "700",
  },
  refreshBtn: {
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    color: "#fff", border: "none", borderRadius: "10px",
    padding: "10px 20px", fontWeight: "700", fontSize: "0.88rem",
    cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 12px rgba(255,45,45,0.3)",
  },
  routeBanner: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: "12px", padding: "12px 16px",
    marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem",
  },
  startNavBtn: {
    background: "#16a34a", color: "#fff", border: "none",
    padding: "9px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "0.88rem", cursor: "pointer",
  },
  clearRouteBtn: {
    background: "#ff2d2d", color: "#fff", border: "none",
    padding: "9px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "1rem",
  },
  mapWrapper: {
    height: "clamp(320px, 50vw, 520px)",
    borderRadius: "16px", overflow: "hidden",
    border: "1px solid #e8ecf0", marginBottom: "1.2rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    position: "relative",
    // NO transform/rotation here — map is always north-up
  },
  mapLoading: {
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#fff", color: "#6b7280", gap: "0.8rem",
  },
  spinner: {
    width: "44px", height: "44px", borderRadius: "50%",
    border: "4px solid #e8ecf0", borderTop: "4px solid #2563eb",
    animation: "spin 0.9s linear infinite",
  },
  filtersBox: {
    background: "#fff", border: "1px solid #e8ecf0",
    borderRadius: "14px", padding: "1rem 1.2rem",
    marginBottom: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  filtersRow: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  filterBtn: {
    padding: "8px 14px", borderRadius: "50px", border: "2px solid",
    fontSize: "0.82rem", fontWeight: "700", cursor: "pointer",
    transition: "all 0.2s", display: "flex", alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  fetchingBar: {
    display: "flex", alignItems: "center", gap: "0.6rem",
    marginTop: "0.8rem", color: "#6b7280", fontSize: "0.82rem",
  },
  fetchingDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#2563eb", animation: "pulse 1s infinite", flexShrink: 0,
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "1rem",
  },
  serviceCard: {
    background: "#fff", borderRadius: "14px", padding: "1.2rem",
    display: "flex", flexDirection: "column", gap: "0.8rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e8ecf0",
    transition: "box-shadow 0.2s",
  },
  serviceTop: { display: "flex", gap: "0.8rem", alignItems: "flex-start" },
  serviceIconBox: {
    width: "46px", height: "46px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  serviceName: { color: "#111", fontWeight: "700", fontSize: "0.9rem", lineHeight: 1.4, margin: 0 },
  serviceAddress: {
    color: "#9ca3af", fontSize: "0.75rem", margin: "3px 0 0",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  serviceMeta: { display: "flex", gap: "0.4rem", marginTop: "5px", flexWrap: "wrap" },
  metaBadge: {
    fontSize: "0.72rem", fontWeight: "600", padding: "3px 8px",
    borderRadius: "50px", display: "inline-block",
  },
  serviceBtns: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  callBtn: {
    flex: 1, border: "1px solid", padding: "9px 6px", borderRadius: "10px",
    textAlign: "center", fontSize: "0.78rem", fontWeight: "700",
    textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "70px",
  },
  routeBtn: {
    flex: 1, border: "1px solid", padding: "9px 6px", borderRadius: "10px",
    fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", minWidth: "70px",
  },
  navBtn: {
    flex: 1, background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff", border: "none", padding: "9px 6px", borderRadius: "10px",
    fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", minWidth: "70px",
    boxShadow: "0 3px 10px rgba(22,163,74,0.2)",
  },
  noResults: { textAlign: "center", padding: "3rem 2rem", color: "#6b7280", fontWeight: "500" },
};

export default MapPage;