import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import FakeCall from "../components/FakeCall";
import EmergencyContacts from "../components/EmergencyContacts";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── CORE ──
  const [sosActive, setSosActive]               = useState(false);
  const [location, setLocation]                 = useState(null);
  const [fakeCallActive, setFakeCallActive]     = useState(false);
  const [sosSending, setSosSending]             = useState(false);
  const [sosCountdown, setSosCountdown]         = useState(0);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationDenied, setLocationDenied]     = useState(false);
  const [showNoContactsPopup, setShowNoContactsPopup] = useState(false);
  // BUG FIX #3 — ref to know if countdown is running so cancel works
  const sosCountingRef = useRef(false);
  const sosCountIntervalRef = useRef(null);

  // ── SHAKE TO SOS ──
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [shakeCount, setShakeCount]     = useState(0);
  const lastShakeRef    = useRef(0);
  const shakeTimeoutRef = useRef(null);
  const lastAccelRef    = useRef({ x: 0, y: 0, z: 0 });

  // ── SOS TIMER ──
  const [timerActive, setTimerActive]       = useState(false);
  const [timerMinutes, setTimerMinutes]     = useState(30);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [showTimerSetup, setShowTimerSetup] = useState(false);
  const timerRef = useRef(null);

  // ── LIVE LOCATION SHARING ──
  const [showLiveShare, setShowLiveShare]     = useState(false);
  const [liveShareActive, setLiveShareActive] = useState(false);
  const [shareLink, setShareLink]             = useState("");
  const [shareDuration, setShareDuration]     = useState(2);
  const [shareTimeLeft, setShareTimeLeft]     = useState(0);
  const [shareStarting, setShareStarting]     = useState(false);
  // BUG FIX #1 — use ref so stopLiveShare always has fresh trackingId
  const trackingIdRef        = useRef(null);
  const liveShareIntervalRef = useRef(null);
  const shareCountdownRef    = useRef(null);
  // BUG FIX #2 — separate flag ref so we don't call stopLiveShare inside setState
  const shareExpiredRef = useRef(false);

  const quickActions = [
    { icon: "🗺️", label: "Live Map",     path: "/map",          color: "#3b82f6" },
    { icon: "👥", label: "Contacts",     path: "/contacts",     color: "#10b981" },
    { icon: "📋", label: "Instructions", path: "/instructions", color: "#f59e0b" },
    { icon: "👤", label: "Profile",      path: "/profile",      color: "#8b5cf6" },
  ];

  const emergencyNumbers = [
    { label: "🚓 Police",     number: "100",  color: "#3b82f6" },
    { label: "🚑 Ambulance",  number: "108",  color: "#10b981" },
    { label: "🚒 Fire",       number: "101",  color: "#f97316" },
    { label: "🆘 Women Help", number: "1091", color: "#e94560" },
  ];

  // ============================================================
  // LOCATION
  // ============================================================
  // BUG FIX — define requestLocation before the useEffect that calls it
  const requestLocation = useCallback(() => {
    setShowLocationPopup(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationDenied(false);
        toast.success("📍 Location access granted! You are protected.");
      },
      () => {
        setLocationDenied(true);
        toast.error("❌ Location denied! SOS will not work without location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationDenied(true); return; }
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") requestLocation();
        else if (result.state === "denied") setLocationDenied(true);
        else setShowLocationPopup(true);
      }).catch(() => setShowLocationPopup(true));
    } else {
      setShowLocationPopup(true);
    }
  }, [requestLocation]);

  // ============================================================
  // SOS SEND HELPER
  // ============================================================
  const sendSOS = useCallback(async (customMessage = null) => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat      = pos.coords.latitude;
          const lng      = pos.coords.longitude;
          const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
          const time     = new Date().toLocaleString("en-IN");

          try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://smart-sos-platform.onrender.com/api/contacts", {
              headers: { Authorization: "Bearer " + token },
            });
            const contacts = await res.json();

            if (!contacts || contacts.length === 0) {
  setShowNoContactsPopup(true);
  resolve(false); return;
}

            const message = customMessage ||
              `🚨 *EMERGENCY ARRIVED - NEED HELP!* 🚨\n\n` +
              `*${user?.name?.toUpperCase() || "SOMEONE"}* is in danger and needs immediate help!\n\n` +
              `📍 *Live Location:*\n${mapsLink}\n\n` +
              `⏰ *Time:* ${time}\n\n` +
              `🆘 *Please call or go to their location IMMEDIATELY!*\n\n` +
              `_Sent automatically via SmartSOS Emergency App_`;

            contacts.forEach((contact, index) => {
              if (contact.phone) {
                let phone = contact.phone.replace(/[\s\-\(\)\+]/g, "");
                if (phone.length === 10) phone = "91" + phone;
                setTimeout(() => {
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
                }, index * 2000);
              }
            });

            toast.success(`🚨 SOS sent to ${contacts.length} contacts!`, { autoClose: 8000 });
            resolve(true);
          } catch {
            toast.error("❌ Failed to load contacts! Call 112 directly!");
            resolve(false);
          }
        },
        () => { toast.error("❌ GPS not available! Enable GPS and try again."); resolve(false); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    });
  }, [user, navigate]);

  // ============================================================
  // MAIN SOS BUTTON — BUG FIX #3: proper countdown cancel
  // ============================================================
  const handleSOS = async () => {
    // If countdown is running — CANCEL it
    if (sosCountingRef.current) {
      clearInterval(sosCountIntervalRef.current);
      sosCountingRef.current = false;
      setSosCountdown(0);
      toast.info("✅ SOS countdown cancelled.");
      return;
    }

    // If SOS already active — deactivate
    if (sosActive) {
      setSosActive(false);
      setSosSending(false);
      toast.info("✅ SOS deactivated");
      return;
    }

    if (!location) {
      toast.error("❌ Location not available! Please enable GPS first.");
      setShowLocationPopup(true);
      return;
    }

    // Start 3-second countdown
    sosCountingRef.current = true;
    setSosCountdown(3);
    let count = 3;

    sosCountIntervalRef.current = setInterval(() => {
      count--;
      setSosCountdown(count);
      if (count <= 0) {
        clearInterval(sosCountIntervalRef.current);
        sosCountingRef.current = false;
      }
    }, 1000);

    await new Promise((r) => setTimeout(r, 3000));

    // Was cancelled during wait?
    if (!sosCountingRef.current && count > 0) return;

    sosCountingRef.current = false;
    setSosCountdown(0);
    setSosActive(true);
    setSosSending(true);
    await sendSOS();
    setSosSending(false);
  };

  // Cleanup SOS interval on unmount
  useEffect(() => {
    return () => clearInterval(sosCountIntervalRef.current);
  }, []);

  // ============================================================
  // SHAKE TO SOS
  // ============================================================
  const handleMotion = useCallback((event) => {
    const { x, y, z } = event.accelerationIncludingGravity || {};
    if (x == null) return;
    const deltaX = Math.abs(x - lastAccelRef.current.x);
    const deltaY = Math.abs(y - lastAccelRef.current.y);
    const deltaZ = Math.abs(z - lastAccelRef.current.z);
    lastAccelRef.current = { x, y, z };

    const shakeThreshold = 18; // slightly lower = more sensitive
    if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
      const now = Date.now();
      if (now - lastShakeRef.current > 400) {
        lastShakeRef.current = now;
        setShakeCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            toast.warning("🤳 3 Shakes detected! Sending SOS...", { autoClose: 4000 });
            sendSOS();
            setSosActive(true);
            return 0;
          }
          clearTimeout(shakeTimeoutRef.current);
          shakeTimeoutRef.current = setTimeout(() => setShakeCount(0), 3000);
          return next;
        });
      }
    }
  }, [sendSOS]);

  const enableShake = async () => {
    // iOS 13+ requires explicit permission
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== "granted") {
          toast.error("❌ Motion permission denied! Go to Settings → Safari → Motion & Orientation Access.");
          return;
        }
      } catch {
        toast.error("❌ Could not request motion permission!");
        return;
      }
    }
    if (!window.DeviceMotionEvent) {
      toast.error("❌ This device doesn't support shake detection.");
      return;
    }
    window.addEventListener("devicemotion", handleMotion, true);
    setShakeEnabled(true);
    setShakeCount(0);
    toast.success("🤳 Shake to SOS enabled! Shake phone 3 times rapidly.", { autoClose: 5000 });
  };

  const disableShake = () => {
    window.removeEventListener("devicemotion", handleMotion, true);
    setShakeEnabled(false);
    setShakeCount(0);
    toast.info("Shake to SOS disabled.");
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("devicemotion", handleMotion, true);
      clearTimeout(shakeTimeoutRef.current);
    };
  }, [handleMotion]);

  // ============================================================
  // SOS TIMER
  // ============================================================
  const startTimer = () => {
    if (timerMinutes < 1 || timerMinutes > 480) {
      toast.error("Set timer between 1 and 480 minutes."); return;
    }
    const totalSeconds = timerMinutes * 60;
    setTimerRemaining(totalSeconds);
    setTimerActive(true);
    setShowTimerSetup(false);
    toast.success(`⏰ Timer started! Check in within ${timerMinutes} min or SOS auto-sends.`, { autoClose: 6000 });

    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          toast.error("⏰ Timer expired! Auto-sending SOS!", { autoClose: 8000 });
          sendSOS(
            `⏰ *SOS TIMER EXPIRED - AUTO ALERT!* ⏰\n\n` +
            `*${user?.name?.toUpperCase() || "SOMEONE"}* set a safety timer and did NOT check in!\n\n` +
            `📍 Please check on them and verify they are safe!\n\n` +
            `_Sent automatically via SmartSOS Safety Timer_`
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelTimer = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    setTimerRemaining(0);
    toast.success("✅ Checked in safely! Timer cancelled.");
  };

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);

  const fmtTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const fmtShareTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
    return `${s}s`;
  };

  // ============================================================
  // LIVE LOCATION SHARING — BUG FIX #1 #2
  // ============================================================
  // BUG FIX #2: stopLiveShare defined BEFORE startLiveShare, using ref not state
  const stopLiveShare = useCallback(async (silent = false) => {
    clearInterval(liveShareIntervalRef.current);
    clearInterval(shareCountdownRef.current);
    shareExpiredRef.current = false;
    setLiveShareActive(false);
    setShareLink("");
    setShareTimeLeft(0);

    // BUG FIX #1: Use trackingIdRef.current instead of trackingId state
    if (trackingIdRef.current) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`https://smart-sos-platform.onrender.com/api/tracking/${trackingIdRef.current}/stop`, {
          method: "PATCH",
          headers: { Authorization: "Bearer " + token },
        });
      } catch {}
      trackingIdRef.current = null;
    }
    if (!silent) toast.info("📍 Live location sharing stopped.");
  }, []);

  const startLiveShare = async () => {
    if (!location) {
      toast.error("❌ Location required!"); setShowLocationPopup(true); return;
    }
    setShareStarting(true);

    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 12000, maximumAge: 0,
        })
      );

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const token = localStorage.getItem("token");

const res = await fetch("https://smart-sos-platform.onrender.com/api/tracking/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ lat, lng, duration: shareDuration, name: user?.name || "User" }),
      });

      const data = await res.json();
      if (!data.trackingId) throw new Error("No tracking ID returned from server");

      // BUG FIX #1: Store in ref so stopLiveShare always has fresh value
      trackingIdRef.current = data.trackingId;
      const link = `${window.location.origin}/track/${data.trackingId}`;

      setShareLink(link);
      setLiveShareActive(true);
      setShowLiveShare(false);
      setShareStarting(false);

      const totalSeconds = shareDuration * 3600;
      setShareTimeLeft(totalSeconds);
      shareExpiredRef.current = false;

      // Send WhatsApp to all contacts
      try {
        const contactRes = await fetch("https://smart-sos-platform.onrender.com/api/contacts", {
          headers: { Authorization: "Bearer " + token },
        });
        const contacts = await contactRes.json();

        if (contacts && contacts.length > 0) {
          const waMsg =
            `📍 *LIVE LOCATION SHARED* 📍\n\n` +
            `*${user?.name || "Someone"}* is sharing their live location with you!\n\n` +
            `🔗 *Track them here:*\n${link}\n\n` +
            `⏰ *Active for:* ${shareDuration} hour${shareDuration > 1 ? "s" : ""}\n\n` +
            `_Shared via SmartSOS Safety App_`;

          contacts.forEach((contact, index) => {
            if (contact.phone) {
              let phone = contact.phone.replace(/[\s\-\(\)\+]/g, "");
              if (phone.length === 10) phone = "91" + phone;
              setTimeout(() => {
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`, "_blank");
              }, index * 2000);
            }
          });
          toast.success(`📍 Live location sent to ${contacts.length} contacts via WhatsApp!`, { autoClose: 8000 });
        }
      } catch {
        toast.warning("⚠️ Location sharing started but could not send WhatsApp. Share link manually.");
      }

      // Update GPS every 30 seconds
      liveShareIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (p) => {
            try {
              await fetch(`https://smart-sos-platform.onrender.com/api/tracking/${trackingIdRef.current}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude }),
              });
            } catch {}
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
        );
      }, 30000);

      // BUG FIX #2: Countdown — don't call stopLiveShare inside setState
      // Instead set a flag ref and handle it in a separate effect check
      shareCountdownRef.current = setInterval(() => {
        setShareTimeLeft((prev) => {
          if (prev <= 1) {
            shareExpiredRef.current = true; // flag only — no side effects in setState
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setShareStarting(false);
      trackingIdRef.current = null;
      toast.error("❌ Failed to start live sharing! Check your internet connection.");
    }
  };

  // BUG FIX #2: Watch for expiry flag and call stopLiveShare outside setState
  useEffect(() => {
    if (shareTimeLeft === 0 && shareExpiredRef.current) {
      toast.info("⏰ Live location link expired.");
      stopLiveShare(true);
    }
  }, [shareTimeLeft, stopLiveShare]);

  const copyLink = () => {
    if (!shareLink) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareLink)
        .then(() => toast.success("✅ Link copied!"))
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const el = document.createElement("textarea");
      el.value = shareLink;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("✅ Link copied!");
    } catch {
      toast.error("❌ Could not copy. Please copy the link manually.");
    }
  };

  // BUG FIX #6: Fixed name text — was `user?.name || "I'm"` which showed "I'm" as a name
  const shareViaWhatsApp = () => {
    const name = user?.name || "Someone";
    const msg =
      `📍 *Track my live location!*\n\n` +
      `*${name}* is sharing their live location with you.\n\n` +
      `🔗 ${shareLink}\n\n` +
      `⏰ Still active for: ${fmtShareTime(shareTimeLeft)}\n\n` +
      `_Via SmartSOS Safety App_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  useEffect(() => {
    return () => {
      clearInterval(liveShareIntervalRef.current);
      clearInterval(shareCountdownRef.current);
    };
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{
      ...styles.container,
      background: sosActive ? "linear-gradient(180deg,#fff5f5,#f5f7fa)" : "#f5f7fa",
    }}>

      {/* ── LOCATION POPUP ── */}
      {showLocationPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupCard}>
            <div style={styles.popupIcon}>📍</div>
            <h2 style={styles.popupTitle}>Location Access Required</h2>
            <p style={styles.popupText}>
              SmartSOS needs your location to send accurate emergency alerts.
              Without location access, SOS will not work!
            </p>
            <div style={styles.popupFeatures}>
              {[
                "🚨 Send your exact location during SOS",
                "🏥 Find nearest hospitals and police",
                "📍 Share live location with contacts",
              ].map((f, i) => (
                <div key={i} style={styles.popupFeature}>{f}</div>
              ))}
            </div>
            <button onClick={requestLocation} style={styles.popupAllowBtn}>
              📍 Allow Location Access
            </button>
            <button onClick={() => {
              setShowLocationPopup(false);
              setLocationDenied(true);
              toast.warning("⚠️ Location denied! SOS features will not work properly.");
            }} style={styles.popupDenyBtn}>
              Deny (Not recommended)
            </button>
          </div>
        </div>
      )}
      {showNoContactsPopup && (
  <div style={styles.popupOverlay}>
    <div style={styles.popupCard}>
      <div style={styles.popupIcon}>👥</div>
      <h2 style={styles.popupTitle}>No Contacts Added!</h2>
      <p style={styles.popupText}>
        You need at least 1 emergency contact before using SOS.
        Add a trusted contact who will receive your emergency alert.
      </p>
      <button onClick={() => { setShowNoContactsPopup(false); navigate("/contacts"); }}
        style={styles.popupAllowBtn}>
        👥 Add Emergency Contact
      </button>
      <button onClick={() => setShowNoContactsPopup(false)} style={styles.popupDenyBtn}>
        Cancel
      </button>
    </div>
  </div>
)}
      {/* ── LOCATION DENIED BAR ── */}
      {locationDenied && !showLocationPopup && (
        <div style={styles.locationWarning}>
          <span>⚠️ Location access denied! SOS will not work.</span>
          <button onClick={() => setShowLocationPopup(true)} style={styles.locationWarningBtn}>
            Enable Location
          </button>
        </div>
      )}

      {/* ── LIVE SHARE SETUP MODAL ── */}
      {showLiveShare && (
        <div style={styles.popupOverlay}>
          <div style={{ ...styles.popupCard, maxWidth: "400px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📍</div>
            <h2 style={styles.popupTitle}>Share Live Location</h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.2rem", lineHeight: 1.6 }}>
              Generate a link your contacts open to watch your live location on a map. Link auto-expires.
            </p>

            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "0.9rem", marginBottom: "1.2rem", textAlign: "left" }}>
              <p style={{ fontWeight: "700", color: "#16a34a", margin: "0 0 0.5rem", fontSize: "0.85rem" }}>✅ How it works:</p>
              {[
                "A unique tracking link is created for you",
                "Your contacts get the link via WhatsApp",
                "They open it → see your live location on map",
                "Location updates every 30 seconds automatically",
                "Link expires automatically — no permanent tracking",
              ].map((s, i) => (
                <p key={i} style={{ color: "#374151", fontSize: "0.8rem", margin: "3px 0", display: "flex", gap: "6px" }}>
                  <span style={{ color: "#16a34a", flexShrink: 0 }}>→</span> {s}
                </p>
              ))}
            </div>

            <p style={{ fontWeight: "700", color: "#374151", fontSize: "0.85rem", marginBottom: "0.6rem", textAlign: "left" }}>
              ⏰ Link active for how long?
            </p>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.4rem", justifyContent: "center", flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 6, 8].map(h => (
                <button key={h} onClick={() => setShareDuration(h)} style={{
                  padding: "10px 16px", borderRadius: "50px", border: "2px solid",
                  borderColor: shareDuration === h ? "#3b82f6" : "#e8ecf0",
                  background: shareDuration === h ? "#3b82f6" : "#fff",
                  color: shareDuration === h ? "#fff" : "#374151",
                  fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                }}>
                  {h}h
                </button>
              ))}
            </div>

            <button onClick={startLiveShare} disabled={shareStarting}
              style={{ ...styles.popupAllowBtn, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", marginBottom: "0.8rem", opacity: shareStarting ? 0.7 : 1 }}>
              {shareStarting ? "⏳ Starting..." : `📍 Start Sharing — ${shareDuration}h`}
            </button>
            <button onClick={() => setShowLiveShare(false)} style={styles.popupDenyBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* BUG FIX #4 #5: Fixed liveShareBar — removed duplicate gap, improved mobile layout */}
      {liveShareActive && shareLink && (
        <div style={styles.liveShareBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%" }}>
            <div style={styles.liveShareDot} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: "800", color: "#1d4ed8", fontSize: "0.88rem" }}>
                📍 Live Location Active
              </p>
              <p style={{ margin: "1px 0 0", color: "#6b7280", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shareLink}
              </p>
            </div>
            <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "4px 10px", borderRadius: "50px", fontSize: "0.72rem", fontWeight: "700", flexShrink: 0 }}>
              ⏰ {fmtShareTime(shareTimeLeft)}
            </span>
          </div>
          {/* Buttons on separate row for mobile */}
          <div style={{ display: "flex", gap: "0.5rem", width: "100%", marginTop: "0.5rem" }}>
            <button onClick={copyLink} style={{ ...styles.liveShareBtn, background: "#dbeafe", color: "#1d4ed8", flex: 1 }}>
              📋 Copy Link
            </button>
            <button onClick={shareViaWhatsApp} style={{ ...styles.liveShareBtn, background: "#16a34a", color: "#fff", flex: 1 }}>
              📲 WhatsApp
            </button>
            <button onClick={() => stopLiveShare(false)} style={{ ...styles.liveShareBtn, background: "#ff2d2d", color: "#fff", flex: 1 }}>
              ✕ Stop
            </button>
          </div>
        </div>
      )}

      {/* ── SOS TIMER SETUP MODAL ── */}
      {showTimerSetup && (
        <div style={styles.popupOverlay}>
          <div style={{ ...styles.popupCard, maxWidth: "380px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⏰</div>
            <h2 style={styles.popupTitle}>Set Safety Timer</h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.4rem", lineHeight: 1.6 }}>
              If you don't check in by the selected time, SOS is automatically sent to all your contacts.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.2rem", justifyContent: "center" }}>
              {[10, 15, 20, 30, 45, 60, 90, 120].map(mins => (
                <button key={mins} onClick={() => setTimerMinutes(mins)} style={{
                  padding: "8px 14px", borderRadius: "50px", border: "2px solid",
                  borderColor: timerMinutes === mins ? "#ff2d2d" : "#e8ecf0",
                  background: timerMinutes === mins ? "#ff2d2d" : "#fff",
                  color: timerMinutes === mins ? "#fff" : "#374151",
                  fontWeight: "700", fontSize: "0.82rem", cursor: "pointer",
                }}>
                  {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ display: "block", color: "#374151", fontWeight: "600", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                Or enter custom minutes:
              </label>
              <input
                type="number" min="1" max="480" value={timerMinutes}
                onChange={e => setTimerMinutes(Number(e.target.value))}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e8ecf0", fontSize: "1.1rem", fontWeight: "700", textAlign: "center", outline: "none", boxSizing: "border-box" }}
              />
              <p style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: "0.4rem", textAlign: "center" }}>
                {timerMinutes >= 60 ? `${Math.floor(timerMinutes / 60)}h ${timerMinutes % 60}m` : `${timerMinutes} minutes`}
              </p>
            </div>
            <button onClick={startTimer} style={{ ...styles.popupAllowBtn, marginBottom: "0.8rem" }}>
              ⏰ Start Timer — {timerMinutes < 60 ? `${timerMinutes} min` : `${timerMinutes / 60}h`}
            </button>
            <button onClick={() => setShowTimerSetup(false)} style={styles.popupDenyBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.greeting}>Hello, {user?.name?.split(" ")[0]} 👋</h2>
          <p style={{ ...styles.subGreeting, color: sosActive ? "#ff2d2d" : "#6b7280" }}>
            {sosActive ? "🚨 EMERGENCY MODE ACTIVE" : "🛡️ You are protected"}
          </p>
        </div>
        <div style={{
          ...styles.locationBadge,
          borderColor: location ? "#16a34a" : "#dc2626",
          color: location ? "#16a34a" : "#dc2626",
          background: location ? "#f0fdf4" : "#fff5f5",
          cursor: location ? "default" : "pointer",
        }} onClick={() => !location && setShowLocationPopup(true)}>
          {location ? "📍 Location Active" : "❌ No GPS — Tap to fix"}
        </div>
      </div>

      {/* ── ACTIVE TIMER BAR ── */}
      {timerActive && (
        <div style={styles.timerBar}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: "800", color: "#d97706", fontSize: "0.95rem" }}>⏰ Safety Timer Active</p>
            <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: "0.8rem" }}>
              SOS auto-sends in{" "}
              <strong style={{ color: timerRemaining < 60 ? "#ff2d2d" : "#d97706" }}>
                {fmtTimer(timerRemaining)}
              </strong>
            </p>
          </div>
          <div style={{ flex: 1, margin: "0 0.8rem" }}>
            <div style={{ background: "#fed7aa", borderRadius: "4px", height: "8px" }}>
              <div style={{
                background: timerRemaining < 60 ? "#ff2d2d" : "#f97316",
                height: "100%", borderRadius: "4px",
                width: `${(timerRemaining / (timerMinutes * 60)) * 100}%`,
                transition: "width 1s, background 0.5s",
              }} />
            </div>
          </div>
          <button onClick={cancelTimer} style={styles.timerCheckInBtn}>✅ I'm Safe!</button>
        </div>
      )}

      {/* ── SHAKE INDICATOR ── */}
      {shakeEnabled && shakeCount > 0 && (
        <div style={styles.shakeIndicator}>
          <span style={{ fontSize: "1.5rem" }}>🤳</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: "700", color: "#dc2626" }}>Shake detected! {shakeCount}/3</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280" }}>Shake {3 - shakeCount} more time(s) to send SOS</p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{
                width: "14px", height: "14px", borderRadius: "50%",
                background: n <= shakeCount ? "#ff2d2d" : "#e8ecf0",
                transition: "background 0.2s",
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ── SOS SECTION ── */}
      <div style={styles.sosSection}>
        {sosCountdown > 0 && (
          <div style={styles.countdownBanner}>
            <span style={styles.countdownNum}>{sosCountdown}</span>
            <div>
              <p style={styles.countdownTitle}>Sending SOS in {sosCountdown}s...</p>
              {/* BUG FIX #3: Now pressing again ACTUALLY cancels */}
              <p style={styles.countdownSub}>Press SOS again to cancel</p>
            </div>
          </div>
        )}
        <button onClick={handleSOS} disabled={sosSending} style={{
          ...styles.sosBtn,
          background: sosActive
            ? "linear-gradient(135deg,#dc2626,#991b1b)"
            : "linear-gradient(135deg,#ff2d2d,#e94560)",
          animation: sosActive ? "sosPulse 1.5s infinite" : "sosPulse 3s infinite",
          opacity: sosSending ? 0.8 : 1,
        }}>
          <span style={styles.sosBadge}>SOS</span>
          <span style={styles.sosLabel}>
            {sosSending ? "SENDING..." : sosCountdown > 0 ? "CANCEL" : sosActive ? "CANCEL" : "SOS"}
          </span>
          <span style={styles.sosSubLabel}>
            {sosActive ? "Tap to deactivate" : sosCountdown > 0 ? "Tap to cancel" : "PRESS FOR HELP"}
          </span>
        </button>
        <p style={styles.sosStatus}>
          {sosActive ? "🔴 SOS Active — WhatsApp alerts sent to contacts" : "🛡️ Ready to protect you"}
        </p>
      </div>

      {/* ── SOS ACTIVE ALERTS ── */}
      {sosActive && (
        <div style={styles.alertsGrid}>
          {["✅ WhatsApp Sent", "📍 Location Shared", "🎙️ Stay Safe", "🚨 Help Coming"].map((msg, i) => (
            <div key={i} style={styles.alertCard}>{msg}</div>
          ))}
        </div>
      )}

      {/* ── HOW SOS WORKS ── */}
      <div style={styles.howCard}>
        <h3 style={styles.howTitle}>📲 How SOS Works</h3>
        <div style={styles.howSteps}>
          {[
            { num: "1", text: "Press the red SOS button" },
            { num: "2", text: "3 second countdown starts — press again to cancel" },
            { num: "3", text: "WhatsApp opens for each contact with your live location" },
            { num: "4", text: "Tap Send — family gets EMERGENCY ARRIVED message!" },
          ].map((step, i) => (
            <div key={i} style={styles.howStep}>
              <span style={styles.stepNum}>{step.num}</span>
              <span style={styles.stepText}>{step.text}</span>
            </div>
          ))}
        </div>
        <p style={styles.howNote}>⚠️ Add at least 5 contacts for maximum safety coverage!</p>
      </div>

      {/* ── EMERGENCY NUMBERS ── */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚡ Emergency Numbers</h3>
        <div style={styles.numbersGrid}>
          {emergencyNumbers.map((n, i) => (
            <a key={i} href={"tel:" + n.number} style={{ ...styles.numberCard, borderColor: n.color }}>
              <span style={styles.numberLabel}>{n.label}</span>
              <span style={{ ...styles.numberValue, color: n.color }}>{n.number}</span>
              <span style={styles.numberCall}>📞 Call Now</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔧 Quick Actions</h3>
        <div style={styles.actionsGrid}>
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} style={{ ...styles.actionCard, borderColor: a.color }}>
              <span style={styles.actionIcon}>{a.icon}</span>
              <span style={styles.actionLabel}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── EMERGENCY CONTACTS ── */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>👥 Your Emergency Contacts</h3>
        <EmergencyContacts compact={true} />
      </div>

      {/* ── WOMEN SAFETY TOOLS ── */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>👩 Women Safety Tools</h3>
        <div style={styles.safetyTools}>
          <button onClick={() => setFakeCallActive(true)} style={styles.fakeCallBtn}>📱 Fake Call</button>
          <button onClick={() => navigate("/instructions")} style={styles.guideBtn}>📋 Safety Guides</button>
          <button onClick={() => navigate("/map")} style={styles.mapBtn}>🗺️ Find Services</button>
        </div>
      </div>

      {/* ── ADVANCED SAFETY FEATURES ── */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🛡️ Advanced Safety Features</h3>
        <div style={styles.advancedGrid}>

          {/* Shake to SOS */}
          <div style={{ ...styles.advancedCard, borderColor: shakeEnabled ? "#ff2d2d" : "#e8ecf0", background: shakeEnabled ? "#fff5f5" : "#fff" }}>
            <div style={styles.advancedTop}>
              <div style={{ ...styles.advancedIconBox, background: shakeEnabled ? "#fff5f5" : "#f9fafb" }}>
                <span style={{ fontSize: "1.8rem" }}>🤳</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ ...styles.advancedTitle, color: shakeEnabled ? "#ff2d2d" : "#111" }}>
                  Shake to SOS {shakeEnabled && "🟢"}
                </p>
                <p style={styles.advancedDesc}>
                  {shakeEnabled
                    ? `Active — shake 3 times rapidly to trigger SOS (${shakeCount}/3 detected)`
                    : "Shake your phone 3 times rapidly to send SOS without touching screen"}
                </p>
              </div>
            </div>
            <button onClick={shakeEnabled ? disableShake : enableShake}
              style={{ ...styles.advancedBtn, background: shakeEnabled ? "#ff2d2d" : "linear-gradient(135deg,#ff2d2d,#e94560)" }}>
              {shakeEnabled ? "🔴 Disable Shake SOS" : "🤳 Enable Shake to SOS"}
            </button>
          </div>

          {/* SOS Timer */}
          <div style={{ ...styles.advancedCard, borderColor: timerActive ? "#f97316" : "#e8ecf0", background: timerActive ? "#fff7ed" : "#fff" }}>
            <div style={styles.advancedTop}>
              <div style={{ ...styles.advancedIconBox, background: timerActive ? "#fff7ed" : "#f9fafb" }}>
                <span style={{ fontSize: "1.8rem" }}>⏰</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ ...styles.advancedTitle, color: timerActive ? "#f97316" : "#111" }}>
                  Safety Timer {timerActive && "🟠"}
                </p>
                <p style={styles.advancedDesc}>
                  {timerActive
                    ? `SOS auto-sends in ${fmtTimer(timerRemaining)}`
                    : "Set a time — if you don't check in, SOS is auto-sent to contacts"}
                </p>
              </div>
            </div>
            {timerActive ? (
              <button onClick={cancelTimer} style={{ ...styles.advancedBtn, background: "#16a34a" }}>
                ✅ I'm Safe — Cancel Timer
              </button>
            ) : (
              <button onClick={() => setShowTimerSetup(true)}
                style={{ ...styles.advancedBtn, background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                ⏰ Set Safety Timer
              </button>
            )}
          </div>

          {/* Live Location Sharing */}
          <div style={{ ...styles.advancedCard, borderColor: liveShareActive ? "#3b82f6" : "#e8ecf0", background: liveShareActive ? "#eff6ff" : "#fff" }}>
            <div style={styles.advancedTop}>
              <div style={{ ...styles.advancedIconBox, background: liveShareActive ? "#dbeafe" : "#f0f9ff" }}>
                <span style={{ fontSize: "1.8rem" }}>📍</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ ...styles.advancedTitle, color: liveShareActive ? "#1d4ed8" : "#111" }}>
                  Live Location Sharing {liveShareActive && "🔵"}
                </p>
                <p style={styles.advancedDesc}>
                  {liveShareActive
                    ? `Active — contacts can track you live. Expires in ${fmtShareTime(shareTimeLeft)}`
                    : "Generate a link — contacts open it to watch your live location on map"}
                </p>
              </div>
            </div>

            {liveShareActive ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ background: "#dbeafe", borderRadius: "10px", padding: "8px 12px" }}>
                  <span style={{ fontSize: "0.73rem", color: "#1d4ed8", fontWeight: "600", wordBreak: "break-all" }}>
                    🔗 {shareLink}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={copyLink} style={{ ...styles.advancedBtn, background: "#3b82f6", flex: 1, padding: "10px 6px", fontSize: "0.8rem" }}>
                    📋 Copy
                  </button>
                  <button onClick={shareViaWhatsApp} style={{ ...styles.advancedBtn, background: "#16a34a", flex: 1, padding: "10px 6px", fontSize: "0.8rem" }}>
                    📲 WhatsApp
                  </button>
                </div>
                <button onClick={() => stopLiveShare(false)} style={{ ...styles.advancedBtn, background: "#ff2d2d" }}>
                  ✕ Stop Sharing
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLiveShare(true)}
                style={{ ...styles.advancedBtn, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                📍 Share Live Location
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── SAFETY TIP ── */}
      <div style={styles.tipsCard}>
        <h3 style={styles.tipsTitle}>💡 Safety Tip of the Day</h3>
        <p style={styles.tipsText}>
          Before travelling alone at night, enable <strong>Shake to SOS</strong>, set a <strong>Safety Timer</strong>,
          and share your <strong>Live Location</strong> with a family member — all three together give you maximum protection.
        </p>
      </div>

      {fakeCallActive && <FakeCall onClose={() => setFakeCallActive(false)} />}

      <style>{`
        @keyframes sosPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,45,45,0.5); }
          50%      { box-shadow: 0 0 0 30px rgba(255,45,45,0); }
        }
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(1.4); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes countPulse {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.15); }
        }
        @keyframes popupIn {
          from { opacity:0; transform:scale(0.9) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// STYLES
// ============================================================
const styles = {
  container: {
    minHeight: "100vh", padding: "clamp(1rem,4vw,2rem)",
    transition: "background 0.5s", maxWidth: "1100px",
    margin: "0 auto", width: "100%", boxSizing: "border-box",
  },

  // Modals
  popupOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.72)", display: "flex",
    alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: "1rem", backdropFilter: "blur(5px)",
  },
  popupCard: {
    background: "#fff", borderRadius: "24px",
    padding: "2.2rem 1.8rem", maxWidth: "420px", width: "100%",
    textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    animation: "popupIn 0.4s ease", maxHeight: "90vh", overflowY: "auto",
  },
  popupIcon: { fontSize: "3.5rem", marginBottom: "0.8rem" },
  popupTitle: { fontSize: "1.45rem", fontWeight: "900", color: "#111827", marginBottom: "0.8rem" },
  popupText: { color: "#6b7280", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: "1.3rem" },
  popupFeatures: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.3rem", textAlign: "left" },
  popupFeature: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "9px 13px", color: "#374151", fontSize: "0.85rem", fontWeight: "500" },
  popupAllowBtn: {
    background: "linear-gradient(135deg,#ff2d2d,#e94560)", color: "#fff",
    padding: "15px 20px", borderRadius: "12px", fontSize: "0.98rem",
    fontWeight: "800", cursor: "pointer", border: "none", width: "100%",
    marginBottom: "0.8rem", boxShadow: "0 4px 20px rgba(255,45,45,0.3)",
  },
  popupDenyBtn: {
    background: "none", border: "1px solid #e8ecf0", color: "#9ca3af",
    padding: "12px 20px", borderRadius: "10px", fontSize: "0.85rem", cursor: "pointer", width: "100%",
  },

  // Bars
  locationWarning: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "12px",
    padding: "12px 16px", marginBottom: "1rem", color: "#dc2626",
    fontWeight: "600", fontSize: "0.88rem", flexWrap: "wrap", gap: "0.5rem",
  },
  locationWarningBtn: { background: "#ff2d2d", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" },

  // BUG FIX #4 #5: Removed duplicate gap, restructured for mobile
  liveShareBar: {
    display: "flex", flexDirection: "column",
    background: "#eff6ff", border: "2px solid #3b82f6",
    borderRadius: "14px", padding: "12px 14px",
    marginBottom: "1rem",
  },
  liveShareDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0, animation: "livePulse 1.5s infinite" },
  // Unified button style for liveShareBar
  liveShareBtn: { border: "none", padding: "8px 10px", borderRadius: "8px", fontWeight: "700", fontSize: "0.78rem", cursor: "pointer", textAlign: "center" },

  timerBar: { display: "flex", alignItems: "center", gap: "0.8rem", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "14px", padding: "12px 16px", marginBottom: "1rem", flexWrap: "wrap" },
  timerCheckInBtn: { background: "#16a34a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "10px", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 10px rgba(22,163,74,0.3)" },
  shakeIndicator: { display: "flex", alignItems: "center", gap: "0.8rem", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "14px", padding: "12px 16px", marginBottom: "1rem", animation: "fadeIn 0.3s ease" },

  // Header
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.8rem" },
  greeting: { fontSize: "clamp(1.3rem,4vw,1.8rem)", fontWeight: "bold", color: "#212121", margin: 0 },
  subGreeting: { marginTop: "4px", fontSize: "0.92rem", fontWeight: "500", margin: 0 },
  locationBadge: { padding: "8px 16px", borderRadius: "50px", border: "1px solid", fontSize: "0.82rem", fontWeight: "600", whiteSpace: "nowrap" },

  // SOS
  sosSection: { background: "#fff", borderRadius: "24px", border: "1px solid #e8ecf0", marginBottom: "1.5rem", padding: "2rem 1rem", boxShadow: "0 4px 20px rgba(255,45,45,0.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" },
  countdownBanner: { display: "flex", alignItems: "center", gap: "1rem", background: "#fff5f5", border: "1px solid #fecaca", padding: "12px 20px", borderRadius: "16px", animation: "fadeIn 0.3s ease" },
  countdownNum: { fontSize: "2.5rem", fontWeight: "900", color: "#ff2d2d", animation: "countPulse 1s infinite", minWidth: "40px", textAlign: "center" },
  countdownTitle: { color: "#dc2626", fontWeight: "700", fontSize: "0.95rem", margin: 0 },
  countdownSub: { color: "#9ca3af", fontSize: "0.78rem", margin: "2px 0 0" },
  sosBtn: { width: "180px", height: "180px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", transition: "transform 0.15s", WebkitTapHighlightColor: "transparent" },
  sosBadge: { background: "rgba(255,255,255,0.25)", color: "#fff", padding: "3px 12px", borderRadius: "50px", fontSize: "0.72rem", fontWeight: "700", letterSpacing: "2px" },
  sosLabel: { color: "#fff", fontSize: "2rem", fontWeight: "900", letterSpacing: "2px" },
  sosSubLabel: { color: "rgba(255,255,255,0.85)", fontSize: "0.7rem", fontWeight: "600", letterSpacing: "1px" },
  sosStatus: { color: "#6b7280", fontSize: "0.85rem", fontWeight: "500", margin: 0, textAlign: "center" },

  alertsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.8rem", marginBottom: "1.5rem", animation: "fadeIn 0.5s ease" },
  alertCard: { background: "#f0fdf4", border: "1px solid #86efac", padding: "12px 8px", borderRadius: "12px", color: "#16a34a", textAlign: "center", fontSize: "0.82rem", fontWeight: "600" },

  howCard: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "16px", padding: "1.4rem", marginBottom: "1.5rem" },
  howTitle: { color: "#16a34a", fontSize: "0.98rem", fontWeight: "800", margin: "0 0 0.9rem 0" },
  howSteps: { display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "0.9rem" },
  howStep: { display: "flex", alignItems: "center", gap: "0.8rem" },
  stepNum: { background: "#16a34a", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: "700", flexShrink: 0 },
  stepText: { color: "#374151", fontSize: "0.88rem", fontWeight: "500" },
  howNote: { color: "#d97706", fontSize: "0.8rem", fontWeight: "600", margin: 0 },

  section: { marginBottom: "2rem" },
  sectionTitle: { fontSize: "1rem", fontWeight: "700", color: "#212121", marginBottom: "1rem", paddingLeft: "10px", borderLeft: "3px solid #ff2d2d" },

  numbersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: "0.7rem" },
  numberCard: { background: "#fff", border: "1px solid", borderRadius: "14px", padding: "1.1rem 0.7rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer" },
  numberLabel: { color: "#6b7280", fontSize: "0.78rem", textAlign: "center" },
  numberValue: { fontSize: "1.35rem", fontWeight: "bold" },
  numberCall: { color: "#9ca3af", fontSize: "0.72rem" },

  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(95px,1fr))", gap: "0.7rem" },
  actionCard: { background: "#fff", border: "1px solid", borderRadius: "14px", padding: "1.3rem 0.8rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "transform 0.15s", WebkitTapHighlightColor: "transparent" },
  actionIcon: { fontSize: "1.7rem" },
  actionLabel: { color: "#374151", fontSize: "0.78rem", fontWeight: "600", textAlign: "center" },

  safetyTools: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.7rem" },
  fakeCallBtn: { background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff", padding: "13px 16px", borderRadius: "12px", fontSize: "0.88rem", fontWeight: "bold", cursor: "pointer", border: "none", boxShadow: "0 4px 15px rgba(139,92,246,0.25)" },
  guideBtn: { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", padding: "13px 16px", borderRadius: "12px", fontSize: "0.88rem", fontWeight: "bold", cursor: "pointer", border: "none", boxShadow: "0 4px 15px rgba(245,158,11,0.25)" },
  mapBtn: { background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", padding: "13px 16px", borderRadius: "12px", fontSize: "0.88rem", fontWeight: "bold", cursor: "pointer", border: "none", boxShadow: "0 4px 15px rgba(59,130,246,0.25)" },

  advancedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: "1rem" },
  advancedCard: { background: "#fff", borderRadius: "16px", padding: "1.2rem", border: "1px solid", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "0.9rem", transition: "border-color 0.3s,background 0.3s" },
  advancedTop: { display: "flex", gap: "0.8rem", alignItems: "flex-start" },
  advancedIconBox: { width: "48px", height: "48px", borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  advancedTitle: { fontWeight: "800", fontSize: "0.92rem", margin: "0 0 4px 0" },
  advancedDesc: { color: "#6b7280", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 },
  advancedBtn: { color: "#fff", border: "none", padding: "11px 16px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", width: "100%", boxShadow: "0 3px 12px rgba(0,0,0,0.12)", WebkitTapHighlightColor: "transparent" },

  tipsCard: { background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "16px", padding: "1.4rem", marginBottom: "2rem" },
  tipsTitle: { color: "#dc2626", fontSize: "0.98rem", fontWeight: "bold", marginBottom: "0.7rem" },
  tipsText: { color: "#6b7280", fontSize: "0.88rem", lineHeight: 1.75 },
};

export default Dashboard;