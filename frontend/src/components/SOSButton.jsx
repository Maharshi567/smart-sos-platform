import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const SOSButton = ({ onActivate, onDeactivate }) => {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePress = () => {
    if (sosActive) {
      deactivate();
      return;
    }
    let count = 3;
    setCountdown(count);
    const cd = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(cd);
        setCountdown(null);
        activate();
      }
    }, 1000);
  };

  const activate = async () => {
    setSosActive(true);
    toast.error('🚨 SOS ACTIVATED!', { autoClose: false, toastId: 'sos' });

    // Start audio recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      console.log('Mic not available');
    }

    // Save emergency
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await axios.post('/api/emergency', {
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          status: 'active'
        });
      });
    } catch { }

    // Track location
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        axios.post('/api/location', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }).catch(() => {});
      });
    }, 5000);

    if (onActivate) onActivate();
  };

  const deactivate = () => {
    setSosActive(false);
    setRecording(false);
    setRecordingTime(0);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    toast.dismiss('sos');
    toast.success('✅ SOS Deactivated. Stay safe!');
    if (onDeactivate) onDeactivate();
  };

  return (
    <div style={styles.wrapper}>
      {/* Countdown */}
      {countdown !== null && (
        <div style={styles.countdownBox}>
          <span style={styles.countdownNum}>{countdown}</span>
          <p style={styles.countdownText}>Activating SOS...</p>
          <button onClick={() => { setCountdown(null); }} style={styles.cancelCd}>
            Cancel
          </button>
        </div>
      )}

      {/* Rings */}
      <div style={styles.ringsWrapper}>
        {[280, 240, 200].map((size, i) => (
          <div key={i} style={{
            ...styles.ring,
            width: size, height: size,
            animationDelay: `${i * 0.5}s`,
            borderColor: sosActive ? 'rgba(255,0,0,0.4)' : 'rgba(255,45,45,0.25)'
          }} />
        ))}

        {/* Main Button */}
        <button
          onClick={handlePress}
          style={{
            ...styles.btn,
            background: sosActive
              ? 'radial-gradient(circle, #ff0000, #7f0000)'
              : 'radial-gradient(circle, #ff4444, #cc0000)',
            animation: sosActive
              ? 'sosPulse 0.6s ease-in-out infinite'
              : 'sosPulse 2s ease-in-out infinite',
          }}
        >
          <span style={styles.btnIcon}>🆘</span>
          <span style={styles.btnText}>SOS</span>
          <span style={styles.btnSub}>
            {sosActive ? 'TAP TO CANCEL' : 'PRESS FOR HELP'}
          </span>
        </button>
      </div>

      {/* Recording badge */}
      {sosActive && recording && (
        <div style={styles.recBadge}>
          🔴 Recording {formatTime(recordingTime)}
        </div>
      )}

      {/* Status */}
      <p style={{ ...styles.status, color: sosActive ? '#ff2d2d' : '#48bb78' }}>
        {sosActive ? '🚨 EMERGENCY MODE ACTIVE' : '🛡️ Ready to protect you'}
      </p>

      <style>{`
        @keyframes sosPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,45,45,0.6); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 25px rgba(255,45,45,0); }
        }
        @keyframes ringAnim {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '1.5rem', padding: '2rem 0',
    position: 'relative'
  },
  countdownBox: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
    borderRadius: '20px', gap: '0.5rem'
  },
  countdownNum: {
    fontSize: '7rem', fontWeight: '900', color: '#ff2d2d',
    lineHeight: 1, animation: 'sosPulse 1s infinite'
  },
  countdownText: { color: '#fff', fontSize: '1.1rem' },
  cancelCd: {
    background: 'rgba(255,255,255,0.1)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)', padding: '10px 28px',
    borderRadius: '50px', cursor: 'pointer', fontSize: '0.95rem', marginTop: '0.5rem'
  },
  ringsWrapper: {
    position: 'relative', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  ring: {
    position: 'absolute', borderRadius: '50%',
    border: '2px solid', animation: 'ringAnim 2s ease-out infinite'
  },
  btn: {
    width: '165px', height: '165px', borderRadius: '50%', border: 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', zIndex: 1,
    boxShadow: '0 0 50px rgba(255,45,45,0.5)', position: 'relative'
  },
  btnIcon: { fontSize: '2rem', marginBottom: '2px' },
  btnText: { fontSize: '1.9rem', fontWeight: '900', color: '#fff', lineHeight: 1 },
  btnSub: {
    fontSize: '0.58rem', color: 'rgba(255,255,255,0.85)',
    marginTop: '5px', letterSpacing: '0.5px', textAlign: 'center'
  },
  recBadge: {
    background: 'rgba(255,45,45,0.15)', border: '1px solid #ff2d2d',
    color: '#ff2d2d', padding: '8px 22px', borderRadius: '50px',
    fontWeight: 'bold', fontSize: '0.9rem'
  },
  status: { fontWeight: '600', fontSize: '0.95rem' }
};

export default SOSButton;