import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', bloodGroup: '', medicalConditions: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fields = [
    { key: 'name', label: '👤 Full Name', type: 'text', placeholder: 'Enter your full name' },
    { key: 'email', label: '📧 Email Address', type: 'email', placeholder: 'Enter your email' },
    { key: 'password', label: '🔒 Password', type: 'password', placeholder: 'Create a strong password' },
  ];

  // ✅ Start countdown timer
  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ✅ Send OTP via WhatsApp
  const handleSendOTP = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error('❌ Enter valid 10 digit phone number!');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('https://smart-sos-platform.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone })
      });
      const data = await res.json();

      if (data.success) {
        setOtp(data.otp);
        setOtpStep(true);
        startCountdown();

        // ✅ Clean phone number
        let phone = form.phone.replace(/[\s\-\(\)\+]/g, '');
        if (phone.length === 10) phone = '91' + phone;

        // ✅ Open WhatsApp — user sends OTP to themselves
        const message =
          '🔐 Your SmartSOS OTP is: *' + data.otp + '*\n\n' +
          'Valid for 10 minutes.\n' +
          'Do not share with anyone.';

        window.open(
          'https://wa.me/' + phone + '?text=' + encodeURIComponent(message),
          '_blank'
        );

        toast.success('📲 WhatsApp opened! Send the message to yourself and check your OTP!', {
          autoClose: 6000
        });
      } else {
        toast.error('❌ Failed to generate OTP');
      }
    } catch (err) {
      toast.error('❌ Server error. Try again!');
    }
    setSendingOtp(false);
  };

  // ✅ Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error('❌ Enter 6 digit OTP!');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch('https://smart-sos-platform.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp: otpInput })
      });
      const data = await res.json();

      if (data.success) {
        setPhoneVerified(true);
        setOtpStep(false);
        toast.success('✅ Phone number verified!');
      } else {
        toast.error('❌ ' + (data.error || 'Invalid OTP!'));
      }
    } catch (err) {
      toast.error('❌ Verification failed. Try again!');
    }
    setVerifyingOtp(false);
  };

  // ✅ Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneVerified && form.phone) {
      toast.warning('⚠️ Please verify your phone number first!');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success('🎉 Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logo}>🛡️</span>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join SmartSOS and stay protected</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Basic Fields */}
          {fields.map(f => (
            <div key={f.key} style={styles.inputGroup}>
              <label style={styles.label}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={styles.input}
                required={['name', 'email', 'password'].includes(f.key)}
              />
            </div>
          ))}

          {/* ✅ Phone Number with OTP */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              📱 Phone Number
              {phoneVerified && (
                <span style={styles.verifiedBadge}>✅ Verified</span>
              )}
            </label>
            <div style={styles.phoneRow}>
              <input
                type="tel"
                placeholder="Enter 10 digit number"
                value={form.phone}
                onChange={e => {
                  setForm({ ...form, phone: e.target.value });
                  setPhoneVerified(false);
                  setOtpStep(false);
                }}
                style={{ ...styles.input, flex: 1 }}
                disabled={phoneVerified}
                maxLength={10}
              />
              {!phoneVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp || countdown > 0}
                  style={{
                    ...styles.otpSendBtn,
                    opacity: sendingOtp || countdown > 0 ? 0.6 : 1,
                  }}
                >
                  {sendingOtp
                    ? '⏳'
                    : countdown > 0
                    ? countdown + 's'
                    : 'Send OTP'}
                </button>
              )}
            </div>
          </div>

          {/* ✅ OTP Input Box */}
          {otpStep && !phoneVerified && (
            <div style={styles.otpBox}>
              <div style={styles.otpHeader}>
                <span style={styles.otpIcon}>📲</span>
                <div>
                  <p style={styles.otpTitle}>Check WhatsApp!</p>
                  <p style={styles.otpSubtitle}>
                    Open the WhatsApp message sent to yourself and enter the OTP below
                  </p>
                </div>
              </div>

              <div style={styles.otpInputRow}>
                <input
                  type="number"
                  placeholder="Enter 6 digit OTP"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  style={styles.otpInput}
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={verifyingOtp}
                  style={styles.verifyBtn}
                >
                  {verifyingOtp ? '⏳' : 'Verify'}
                </button>
              </div>

              <p style={styles.otpHint}>
                💡 Tap Send in WhatsApp first, then check your sent messages for the OTP
              </p>

              {countdown > 0 && (
                <p style={styles.otpTimer}>
                  ⏱️ Resend OTP in {countdown}s
                </p>
              )}
              {countdown === 0 && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  style={styles.resendBtn}
                >
                  🔄 Resend OTP via WhatsApp
                </button>
              )}
            </div>
          )}

          {/* Blood Group */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>🩸 Blood Group</label>
            <select
              value={form.bloodGroup}
              onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
              style={styles.input}
            >
              <option value="">Select blood group</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          {/* Medical Conditions */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>🏥 Medical Conditions (Optional)</label>
            <textarea
              placeholder="Any allergies, medical conditions, medications..."
              value={form.medicalConditions}
              onChange={e => setForm({ ...form, medicalConditions: e.target.value })}
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
          </button>

        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in →</Link>
        </p>
      </div>

      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f5f5f5',
    position: 'relative', overflow: 'hidden', padding: '2rem 1rem'
  },
  card: {
    background: '#ffffff',
    padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '480px',
    border: '1px solid #e0e0e0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    position: 'relative', zIndex: 1
  },
  header: { textAlign: 'center', marginBottom: '2.5rem' },
  logo: { fontSize: '3rem' },
  title: { fontSize: '1.8rem', fontWeight: 'bold', color: '#111111', marginTop: '0.5rem' },
  subtitle: { color: '#606060', marginTop: '0.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: {
    color: '#333333', fontSize: '0.9rem', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '0.5rem'
  },
  verifiedBadge: {
    background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #86efac', borderRadius: '50px',
    padding: '2px 10px', fontSize: '0.75rem', fontWeight: '700',
  },
  input: {
    background: '#f9f9f9', border: '1px solid #e0e0e0',
    borderRadius: '8px', padding: '13px 16px', color: '#111111',
    fontSize: '1rem', outline: 'none', width: '100%',
    WebkitAppearance: 'none'
  },

  // Phone row
  phoneRow: {
    display: 'flex', gap: '0.6rem', alignItems: 'stretch'
  },
  otpSendBtn: {
    background: '#25D366', color: '#fff',
    border: 'none', borderRadius: '8px',
    padding: '0 16px', fontSize: '0.85rem',
    fontWeight: '700', cursor: 'pointer',
    whiteSpace: 'nowrap', minWidth: '80px',
    transition: 'opacity 0.2s',
  },

  // OTP Box
  otpBox: {
    background: '#f0fdf4', border: '1px solid #86efac',
    borderRadius: '12px', padding: '1.2rem',
    display: 'flex', flexDirection: 'column', gap: '0.8rem',
  },
  otpHeader: {
    display: 'flex', alignItems: 'flex-start', gap: '0.8rem',
  },
  otpIcon: { fontSize: '1.8rem', flexShrink: 0 },
  otpTitle: {
    color: '#16a34a', fontWeight: '700',
    fontSize: '0.95rem', margin: 0,
  },
  otpSubtitle: {
    color: '#374151', fontSize: '0.82rem',
    margin: '3px 0 0', lineHeight: 1.5,
  },
  otpInputRow: {
    display: 'flex', gap: '0.6rem',
  },
  otpInput: {
    flex: 1, background: '#fff',
    border: '1px solid #86efac', borderRadius: '8px',
    padding: '12px 14px', color: '#111111',
    fontSize: '1.1rem', fontWeight: '700',
    outline: 'none', letterSpacing: '4px',
    textAlign: 'center',
  },
  verifyBtn: {
    background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: '8px',
    padding: '12px 18px', fontSize: '0.9rem',
    fontWeight: '700', cursor: 'pointer',
    minWidth: '70px',
  },
  otpHint: {
    color: '#6b7280', fontSize: '0.78rem',
    margin: 0, lineHeight: 1.5,
  },
  otpTimer: {
    color: '#d97706', fontSize: '0.82rem',
    fontWeight: '600', margin: 0,
    textAlign: 'center',
  },
  resendBtn: {
    background: 'none', border: '1px solid #25D366',
    color: '#16a34a', borderRadius: '8px',
    padding: '8px', fontSize: '0.85rem',
    fontWeight: '600', cursor: 'pointer',
    width: '100%',
  },

  submitBtn: {
    background: '#ff0000',
    color: '#fff', padding: '16px', borderRadius: '8px',
    fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,0,0,0.2)', marginTop: '0.5rem',
    border: 'none', transition: 'opacity 0.2s',
  },
  footer: { textAlign: 'center', marginTop: '2rem', color: '#606060' },
  link: { color: '#ff0000', fontWeight: 'bold' },
  bgCircle1: {
    position: 'absolute', top: '-100px', right: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,0,0,0.04), transparent)'
  },
  bgCircle2: {
    position: 'absolute', bottom: '-100px', left: '-100px',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,0,0,0.03), transparent)'
  }
};

export default Register;