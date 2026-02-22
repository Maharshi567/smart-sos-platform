import React, { useState, useEffect, useRef } from 'react';

const RINGTONE_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const CALLERS = [
  { name: 'Mom', avatar: '👩', number: '+91 98765 43210' },
  { name: 'Dad', avatar: '👨', number: '+91 98765 43211' },
  { name: 'Sister', avatar: '👧', number: '+91 98765 43212' },
  { name: 'Best Friend', avatar: '👫', number: '+91 98765 43213' },
  { name: 'Office', avatar: '💼', number: '+91 98765 43214' },
];

const FakeCall = ({ onClose }) => {
  const [phase, setPhase] = useState('ringing');
  const [callTime, setCallTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [caller] = useState(CALLERS[Math.floor(Math.random() * CALLERS.length)]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // ✅ Start ringtone
    const audio = new Audio(RINGTONE_URL);
    audio.loop = true;
    audio.volume = 1.0;
    audio.play().catch(() => {});
    audioRef.current = audio;

    const autoDismiss = setTimeout(() => {
      handleDecline();
    }, 30000);

    return () => {
      clearTimeout(autoDismiss);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = () => {
    // ✅ Stop ringtone when answered
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPhase('active');
  };

  const handleDecline = () => {
    // ✅ Stop ringtone when declined
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPhase('ended');
    setTimeout(() => onClose && onClose(), 1500);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />

        {/* Status Label */}
        <div style={styles.header}>
          {phase === 'ringing' && (
            <p style={styles.incomingLabel}>📞 Incoming Call...</p>
          )}
          {phase === 'active' && (
            <p style={styles.activeLabel}>🟢 Call Connected</p>
          )}
          {phase === 'ended' && (
            <p style={styles.endedLabel}>📵 Call Ended</p>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          ...styles.avatar,
          border: phase === 'active'
            ? '3px solid #48bb78'
            : phase === 'ended'
            ? '3px solid #ff2d2d'
            : '3px solid #3b82f6',
          animation: phase === 'ringing'
            ? 'avatarPulse 1.5s ease-in-out infinite'
            : 'none'
        }}>
          <span style={styles.avatarEmoji}>{caller.avatar}</span>
        </div>

        {/* Caller Info */}
        <h2 style={styles.callerName}>{caller.name}</h2>
        <p style={styles.callerNumber}>{caller.number}</p>

        {/* Ringing dots */}
        {phase === 'ringing' && (
          <div style={styles.ringingDots}>
            <span style={{ ...styles.dot, animationDelay: '0s' }} />
            <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
            <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Call Timer */}
        {phase === 'active' && (
          <p style={styles.callTimer}>{formatCallTime(callTime)}</p>
        )}

        {/* Ended text */}
        {phase === 'ended' && (
          <p style={styles.endedText}>Call disconnected</p>
        )}

        {/* ===== RINGING BUTTONS ===== */}
        {phase === 'ringing' && (
          <div style={styles.actions}>
            <div style={styles.actionWrapper}>
              <button onClick={handleDecline} style={styles.declineBtn}>
                📵
              </button>
              <span style={styles.actionLabel}>Decline</span>
            </div>
            <div style={styles.actionWrapper}>
              <button onClick={handleAnswer} style={styles.answerBtn}>
                📞
              </button>
              <span style={styles.actionLabel}>Answer</span>
            </div>
          </div>
        )}

        {/* ===== ACTIVE CALL BUTTONS ===== */}
        {phase === 'active' && (
          <div style={styles.actions}>
            <div style={styles.actionWrapper}>
              <button
                onClick={() => setMuted(!muted)}
                style={{
                  ...styles.muteBtn,
                  background: muted
                    ? 'rgba(255,45,45,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  border: muted
                    ? '2px solid #ff2d2d'
                    : '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {muted ? '🔇' : '🎙️'}
              </button>
              <span style={styles.actionLabel}>
                {muted ? 'Unmute' : 'Mute'}
              </span>
            </div>

            <div style={styles.actionWrapper}>
              <button style={styles.speakerBtn}>🔊</button>
              <span style={styles.actionLabel}>Speaker</span>
            </div>

            <div style={styles.actionWrapper}>
              <button onClick={handleDecline} style={styles.endBtn}>
                📵
              </button>
              <span style={styles.actionLabel}>End Call</span>
            </div>
          </div>
        )}

        {/* Tip */}
        <p style={styles.tip}>
          🛡️ This is a simulated call for your safety
        </p>
      </div>

      <style>{`
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
          50% { box-shadow: 0 0 0 20px rgba(59,130,246,0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes answerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(72,187,120,0.5); }
          50% { box-shadow: 0 0 0 15px rgba(72,187,120,0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.92)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, backdropFilter: 'blur(8px)'
  },
  card: {
    background: 'linear-gradient(145deg, #232d45, #1e2a45)',
    borderRadius: '28px', padding: '3rem 2rem',
    width: '90%', maxWidth: '340px', textAlign: 'center',
    border: '1px solid #2d4a7a',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    position: 'relative', overflow: 'hidden'
  },
  bgCircle1: {
    position: 'absolute', top: '-60px', right: '-60px',
    width: '200px', height: '200px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(72,187,120,0.1), transparent)',
    pointerEvents: 'none'
  },
  bgCircle2: {
    position: 'absolute', bottom: '-60px', left: '-60px',
    width: '180px', height: '180px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent)',
    pointerEvents: 'none'
  },
  header: { marginBottom: '1.5rem' },
  incomingLabel: { color: '#3b82f6', fontWeight: '600', fontSize: '1rem' },
  activeLabel: { color: '#48bb78', fontWeight: '600', fontSize: '1rem' },
  endedLabel: { color: '#ff2d2d', fontWeight: '600', fontSize: '1rem' },
  avatar: {
    width: '100px', height: '100px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e3a5f, #2d4a7a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.2rem', transition: 'border 0.3s'
  },
  avatarEmoji: { fontSize: '3.2rem' },
  callerName: { fontSize: '1.7rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.4rem' },
  callerNumber: { color: '#a0aec0', fontSize: '0.9rem', marginBottom: '1.2rem' },
  ringingDots: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '2rem' },
  dot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#3b82f6', display: 'inline-block',
    animation: 'dotBounce 1.2s ease-in-out infinite'
  },
  callTimer: {
    fontSize: '1.4rem', fontWeight: 'bold', color: '#48bb78',
    fontFamily: 'monospace', marginBottom: '2rem'
  },
  endedText: { color: '#ff2d2d', fontSize: '1rem', marginBottom: '2rem' },
  actions: {
    display: 'flex', justifyContent: 'center',
    gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap'
  },
  actionWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  actionLabel: { color: '#a0aec0', fontSize: '0.75rem' },
  declineBtn: {
    width: '68px', height: '68px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff2d2d, #cc0000)',
    border: 'none', fontSize: '1.8rem', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(255,45,45,0.4)'
  },
  answerBtn: {
    width: '68px', height: '68px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #48bb78, #2f855a)',
    border: 'none', fontSize: '1.8rem', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(72,187,120,0.4)',
    animation: 'answerPulse 1.2s ease-in-out infinite'
  },
  muteBtn: {
    width: '68px', height: '68px', borderRadius: '50%',
    fontSize: '1.8rem', cursor: 'pointer', transition: 'all 0.3s'
  },
  speakerBtn: {
    width: '68px', height: '68px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    fontSize: '1.8rem', cursor: 'pointer'
  },
  endBtn: {
    width: '68px', height: '68px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff2d2d, #cc0000)',
    border: 'none', fontSize: '1.8rem', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(255,45,45,0.4)'
  },
  tip: {
    color: '#4a5568', fontSize: '0.78rem',
    borderTop: '1px solid #2d4a7a', paddingTop: '1rem'
  },
};

export default FakeCall;