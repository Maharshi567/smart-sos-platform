import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relation: '', email: '' });

  // ✅ OTP states
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const relations = ['Family', 'Friend', 'Guardian', 'Colleague', 'Doctor', 'Other'];

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/api/contacts');
      setContacts(res.data);
    } catch {
      toast.error('Failed to load contacts');
    }
  };

  // ✅ Reset OTP when form closes
  const handleToggleForm = () => {
    setShowForm(!showForm);
    setOtpStep(false);
    setOtpInput('');
    setPhoneVerified(false);
    setCountdown(0);
    setForm({ name: '', phone: '', relation: '', email: '' });
  };

  // ✅ Start countdown
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
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
      toast.error('❌ Enter valid 10 digit phone number!');
      return;
    }

    // Check duplicate phone before sending OTP
    const duplicate = contacts.find(c => c.phone === form.phone.trim());
    if (duplicate) {
      toast.error('❌ This phone number is already added!');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone })
      });
      const data = await res.json();

      if (data.success) {
        setOtpStep(true);
        startCountdown();

        // Clean phone number
        let phone = form.phone.replace(/[\s\-\(\)\+]/g, '');
        if (phone.length === 10) phone = '91' + phone;

        const message =
          '🔐 SmartSOS Contact Verification OTP: *' + data.otp + '*\n\n' +
          'Valid for 10 minutes.\n' +
          'Do not share with anyone.';

        // Open WhatsApp
        window.open(
          'https://wa.me/' + phone + '?text=' + encodeURIComponent(message),
          '_blank'
        );

        toast.success('📲 WhatsApp opened! Send the message to yourself and note the OTP!', {
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
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp: otpInput })
      });
      const data = await res.json();

      if (data.success) {
        setPhoneVerified(true);
        setOtpStep(false);
        setOtpInput('');
        toast.success('✅ Phone number verified!');
      } else {
        toast.error('❌ ' + (data.error || 'Invalid OTP!'));
      }
    } catch (err) {
      toast.error('❌ Verification failed. Try again!');
    }
    setVerifyingOtp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) { toast.error('Please enter a name'); return; }
    if (!form.phone.trim()) { toast.error('Please enter a phone number'); return; }
    if (form.phone.length < 10) { toast.error('Please enter a valid phone number'); return; }
    if (!form.relation) { toast.error('Please select a relation'); return; }

    // ✅ Must verify phone first
    if (!phoneVerified) {
      toast.warning('⚠️ Please verify the phone number via WhatsApp OTP first!');
      return;
    }

    const duplicatePhone = contacts.find(c => c.phone === form.phone.trim());
    if (duplicatePhone) { toast.error('A contact with this phone number already exists!'); return; }

    const duplicateName = contacts.find(c => c.name.toLowerCase() === form.name.trim().toLowerCase());
    if (duplicateName) { toast.error('A contact with this name already exists!'); return; }

    setLoading(true);
    try {
      await axios.post('/api/contacts', form);
      toast.success('✅ Contact added successfully!');
      setForm({ name: '', phone: '', relation: '', email: '' });
      setPhoneVerified(false);
      setOtpStep(false);
      setShowForm(false);
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await axios.delete(`/api/contacts/${id}`);
      toast.success('Contact deleted');
      setContacts(contacts.filter(c => c._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getRelationIcon = (rel) => {
    const icons = { Family: '👨‍👩‍👧', Friend: '👫', Guardian: '🛡️', Colleague: '💼', Doctor: '👨‍⚕️', Other: '👤' };
    return icons[rel] || '👤';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>👥 Trusted Contacts</h2>
          <p style={styles.subtitle}>People who will be alerted during SOS</p>
        </div>
        <button onClick={handleToggleForm} style={styles.addBtn}>
          {showForm ? '✕ Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* ===== ADD CONTACT FORM ===== */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>➕ Add New Contact</h3>
          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Name */}
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>👤 Full Name *</label>
                <input
                  placeholder="Contact name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              {/* ✅ Phone with OTP */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  📱 Phone Number *
                  {phoneVerified && (
                    <span style={styles.verifiedBadge}>✅ Verified</span>
                  )}
                </label>
                <div style={styles.phoneRow}>
                  <input
                    placeholder="10 digit number"
                    value={form.phone}
                    onChange={e => {
                      setForm({ ...form, phone: e.target.value });
                      setPhoneVerified(false);
                      setOtpStep(false);
                      setOtpInput('');
                    }}
                    style={{ ...styles.input, flex: 1 }}
                    disabled={phoneVerified}
                    maxLength={10}
                    type="tel"
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
                      {sendingOtp ? '⏳' : countdown > 0 ? countdown + 's' : '📲 OTP'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ OTP Verification Box */}
            {otpStep && !phoneVerified && (
              <div style={styles.otpBox}>
                <div style={styles.otpHeader}>
                  <span style={styles.otpIcon}>📲</span>
                  <div>
                    <p style={styles.otpTitle}>Check WhatsApp!</p>
                    <p style={styles.otpSubtitle}>
                      Open WhatsApp → Tap Send on the message → Check your sent messages for the OTP → Enter it below
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
                    {verifyingOtp ? '⏳' : '✅ Verify'}
                  </button>
                </div>

                <p style={styles.otpHint}>
                  💡 Tap Send in WhatsApp first, then check sent messages for the OTP number
                </p>

                {countdown > 0 ? (
                  <p style={styles.otpTimer}>⏱️ Resend in {countdown}s</p>
                ) : (
                  <button type="button" onClick={handleSendOTP} style={styles.resendBtn}>
                    🔄 Resend OTP via WhatsApp
                  </button>
                )}
              </div>
            )}

            {/* Relation & Email */}
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>💞 Relation *</label>
                <select
                  value={form.relation}
                  onChange={e => setForm({ ...form, relation: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="">Select relation</option>
                  {relations.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📧 Email (Optional)</label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Warning if phone not verified */}
            {!phoneVerified && form.phone.length >= 10 && (
              <div style={styles.warningBox}>
                ⚠️ Please verify the phone number via WhatsApp OTP before adding contact!
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                background: phoneVerified
                  ? 'linear-gradient(135deg, #ff2d2d, #e94560)'
                  : '#9ca3af',
                cursor: phoneVerified ? 'pointer' : 'not-allowed',
              }}
              disabled={loading}
            >
              {loading ? '⏳ Adding...' : phoneVerified ? '✅ Add Contact' : '🔒 Verify Phone First'}
            </button>
          </form>
        </div>
      )}

      {/* ===== CONTACTS LIST ===== */}
      {contacts.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>👥</span>
          <h3 style={styles.emptyTitle}>No Contacts Yet</h3>
          <p style={styles.emptyText}>Add trusted contacts who will be alerted during emergencies</p>
          <button onClick={() => setShowForm(true)} style={styles.emptyBtn}>
            + Add Your First Contact
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {contacts.map(c => (
            <div key={c._id} style={styles.contactCard}>
              <div style={styles.contactTop}>
                <div style={styles.avatar}>{getRelationIcon(c.relation)}</div>
                <div style={styles.contactInfo}>
                  <h3 style={styles.contactName}>{c.name}</h3>
                  <span style={styles.relationBadge}>{c.relation}</span>
                </div>
                <span style={styles.contactVerifiedBadge}>✅ Verified</span>
              </div>
              <div style={styles.contactDetails}>
                <p style={styles.detail}>📱 {c.phone}</p>
                {c.email && <p style={styles.detail}>📧 {c.email}</p>}
              </div>
              <div style={styles.contactBtns}>
                <a href={'tel:' + c.phone} style={styles.callBtn}>📞 Call</a>
                <button onClick={() => handleDelete(c._id)} style={styles.deleteBtn}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ️</span>
        <p style={styles.infoText}>
          All contacts are WhatsApp OTP verified. They will receive your live location when you press SOS.
          Add at least 3 trusted contacts for best safety coverage.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', padding: 'clamp(1rem, 4vw, 2rem)', background: '#f5f7fa' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'
  },
  title: { fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 'bold', color: '#212121' },
  subtitle: { color: '#6b7280', marginTop: '4px' },
  addBtn: {
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)',
    color: '#fff', padding: '12px 24px', borderRadius: '12px',
    fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255,45,45,0.3)', border: 'none'
  },
  formCard: {
    background: '#ffffff', border: '1px solid #e8ecf0',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
  },
  formTitle: { color: '#212121', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: {
    color: '#374151', fontSize: '0.85rem', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'
  },
  verifiedBadge: {
    background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #86efac', borderRadius: '50px',
    padding: '2px 10px', fontSize: '0.72rem', fontWeight: '700',
  },
  input: {
    background: '#f9fafb', border: '1px solid #e8ecf0',
    borderRadius: '10px', padding: '12px 14px', color: '#212121',
    fontSize: '0.95rem', outline: 'none', width: '100%',
  },

  // Phone row
  phoneRow: { display: 'flex', gap: '0.5rem', alignItems: 'stretch' },
  otpSendBtn: {
    background: '#25D366', color: '#fff', border: 'none',
    borderRadius: '10px', padding: '0 14px', fontSize: '0.82rem',
    fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
    minWidth: '70px', transition: 'opacity 0.2s',
  },

  // OTP Box
  otpBox: {
    background: '#f0fdf4', border: '1px solid #86efac',
    borderRadius: '12px', padding: '1.2rem',
    display: 'flex', flexDirection: 'column', gap: '0.8rem',
  },
  otpHeader: { display: 'flex', alignItems: 'flex-start', gap: '0.8rem' },
  otpIcon: { fontSize: '1.8rem', flexShrink: 0 },
  otpTitle: { color: '#16a34a', fontWeight: '700', fontSize: '0.95rem', margin: 0 },
  otpSubtitle: { color: '#374151', fontSize: '0.8rem', margin: '3px 0 0', lineHeight: 1.5 },
  otpInputRow: { display: 'flex', gap: '0.6rem' },
  otpInput: {
    flex: 1, background: '#fff', border: '1px solid #86efac',
    borderRadius: '8px', padding: '12px 14px', color: '#111',
    fontSize: '1.1rem', fontWeight: '700', outline: 'none',
    letterSpacing: '4px', textAlign: 'center',
  },
  verifyBtn: {
    background: '#16a34a', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '12px 16px', fontSize: '0.88rem',
    fontWeight: '700', cursor: 'pointer', minWidth: '80px',
  },
  otpHint: { color: '#6b7280', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 },
  otpTimer: { color: '#d97706', fontSize: '0.82rem', fontWeight: '600', margin: 0, textAlign: 'center' },
  resendBtn: {
    background: 'none', border: '1px solid #25D366',
    color: '#16a34a', borderRadius: '8px', padding: '8px',
    fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', width: '100%',
  },

  // Warning
  warningBox: {
    background: '#fefce8', border: '1px solid #fde68a',
    borderRadius: '10px', padding: '12px 14px',
    color: '#d97706', fontSize: '0.85rem', fontWeight: '600',
  },

  submitBtn: {
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)', color: '#fff',
    padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold',
    cursor: 'pointer', alignSelf: 'flex-start', minWidth: '180px',
    boxShadow: '0 4px 12px rgba(255,45,45,0.3)', border: 'none',
    transition: 'all 0.2s',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', gap: '1rem'
  },
  emptyIcon: { fontSize: '4rem' },
  emptyTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#212121' },
  emptyText: { color: '#6b7280', maxWidth: '400px', lineHeight: 1.7 },
  emptyBtn: {
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)', color: '#fff',
    padding: '14px 32px', borderRadius: '12px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem',
    boxShadow: '0 4px 12px rgba(255,45,45,0.3)', border: 'none'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.2rem', marginBottom: '2rem'
  },
  contactCard: {
    background: '#ffffff', border: '1px solid #e8ecf0',
    borderRadius: '16px', padding: '1.5rem', display: 'flex',
    flexDirection: 'column', gap: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  contactTop: { display: 'flex', alignItems: 'center', gap: '1rem' },
  avatar: {
    width: '55px', height: '55px', borderRadius: '50%',
    background: 'rgba(255,45,45,0.08)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
    border: '2px solid #fecaca', flexShrink: 0
  },
  contactInfo: { flex: 1 },
  contactName: { color: '#212121', fontWeight: 'bold', fontSize: '1rem' },
  relationBadge: {
    display: 'inline-block', background: 'rgba(255,45,45,0.08)',
    color: '#ff2d2d', padding: '2px 12px', borderRadius: '50px',
    fontSize: '0.75rem', fontWeight: '600', marginTop: '4px'
  },
  contactVerifiedBadge: {
    background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #86efac', borderRadius: '50px',
    padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700',
    flexShrink: 0, alignSelf: 'flex-start',
  },
  contactDetails: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detail: { color: '#6b7280', fontSize: '0.875rem' },
  contactBtns: { display: 'flex', gap: '0.8rem' },
  callBtn: {
    flex: 1, background: '#f0fdf4', border: '1px solid #86efac',
    color: '#16a34a', padding: '10px', borderRadius: '10px',
    textAlign: 'center', fontSize: '0.9rem', fontWeight: '600',
  },
  deleteBtn: {
    background: '#fff5f5', border: '1px solid #fecaca',
    color: '#dc2626', padding: '10px 16px', borderRadius: '10px',
    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', border: 'none'
  },
  infoBox: {
    display: 'flex', gap: '1rem', alignItems: 'flex-start',
    background: '#eff6ff', border: '1px solid #bfdbfe',
    borderRadius: '12px', padding: '1.2rem', marginTop: '1rem'
  },
  infoIcon: { fontSize: '1.5rem', flexShrink: 0 },
  infoText: { color: '#4b5563', lineHeight: 1.7, fontSize: '0.9rem' },
};

export default Contacts;