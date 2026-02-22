import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmergencyContacts = ({ compact = false }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/contacts');
        setContacts(res.data);
      } catch {
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getIcon = (relation) => {
    const map = {
      Family: '👨‍👩‍👧', Friend: '👫', Guardian: '🛡️',
      Colleague: '💼', Doctor: '👨‍⚕️', Other: '👤'
    };
    return map[relation] || '👤';
  };

  const getColor = (relation) => {
    const map = {
      Family: '#e94560', Friend: '#3b82f6', Guardian: '#10b981',
      Colleague: '#f59e0b', Doctor: '#8b5cf6', Other: '#a0aec0'
    };
    return map[relation] || '#a0aec0';
  };

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (contacts.length === 0) return (
    <div style={styles.empty}>
      <span style={styles.emptyIcon}>👥</span>
      <p style={styles.emptyText}>No emergency contacts added yet</p>
      <a href="/contacts" style={styles.emptyLink}>+ Add Contacts →</a>
    </div>
  );

  if (compact) {
    return (
      <div style={styles.compactWrapper}>
        {contacts.slice(0, 4).map((c, i) => (
          <a key={i} href={`tel:${c.phone}`} style={styles.compactCard}>
            <div style={{ ...styles.compactAvatar, background: `${getColor(c.relation)}22`, border: `1px solid ${getColor(c.relation)}44` }}>
              {getIcon(c.relation)}
            </div>
            <span style={styles.compactName}>{c.name.split(' ')[0]}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h3 style={styles.title}>👥 Emergency Contacts</h3>
        <span style={styles.count}>{contacts.length} contacts</span>
      </div>

      <div style={styles.list}>
        {contacts.map((c, i) => (
          <div key={i} style={styles.contactRow}>
            <div style={{
              ...styles.avatar,
              background: `${getColor(c.relation)}15`,
              border: `1px solid ${getColor(c.relation)}40`
            }}>
              {getIcon(c.relation)}
            </div>
            <div style={styles.info}>
              <p style={styles.name}>{c.name}</p>
              <p style={styles.phone}>{c.phone}</p>
            </div>
            <div style={styles.actions}>
              <span style={{ ...styles.badge, color: getColor(c.relation), borderColor: `${getColor(c.relation)}44`, background: `${getColor(c.relation)}15` }}>
                {c.relation}
              </span>
              <a href={`tel:${c.phone}`} style={styles.callBtn}>📞</a>
            </div>
          </div>
        ))}
      </div>

      {/* SOS Alert simulation */}
      <div style={styles.alertBox}>
        <span style={styles.alertIcon}>🚨</span>
        <p style={styles.alertText}>
          All {contacts.length} contacts will be alerted with your live location when SOS is triggered
        </p>
      </div>
    </div>
  );
};

const styles = {
  loading: {
    display: 'flex', justifyContent: 'center', padding: '2rem'
  },
  spinner: {
    width: '32px', height: '32px', borderRadius: '50%',
    border: '3px solid #2d4a7a', borderTop: '3px solid #e94560',
    animation: 'spin 1s linear infinite'
  },
  empty: {
    textAlign: 'center', padding: '2rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem'
  },
  emptyIcon: { fontSize: '2.5rem' },
  emptyText: { color: '#a0aec0', fontSize: '0.9rem' },
  emptyLink: {
    color: '#e94560', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none'
  },
  compactWrapper: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  compactCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '6px', textDecoration: 'none', transition: 'transform 0.2s'
  },
  compactAvatar: {
    width: '52px', height: '52px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
  },
  compactName: { color: '#a0aec0', fontSize: '0.75rem', fontWeight: '600' },
  wrapper: {
    background: '#1e2a45', borderRadius: '16px',
    border: '1px solid #2d4a7a', padding: '1.5rem'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.2rem'
  },
  title: { color: '#fff', fontSize: '1rem', fontWeight: 'bold' },
  count: {
    background: 'rgba(233,69,96,0.15)', color: '#e94560',
    padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '600'
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' },
  contactRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0.8rem', background: 'rgba(255,255,255,0.03)',
    borderRadius: '10px', border: '1px solid #2d4a7a'
  },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', flexShrink: 0
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    color: '#fff', fontWeight: '600', fontSize: '0.9rem',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
  },
  phone: { color: '#a0aec0', fontSize: '0.8rem', marginTop: '2px' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 },
  badge: {
    padding: '3px 10px', borderRadius: '50px',
    fontSize: '0.72rem', fontWeight: '600', border: '1px solid'
  },
  callBtn: {
    background: 'rgba(72,187,120,0.15)', border: '1px solid #48bb78',
    color: '#48bb78', width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', textDecoration: 'none', cursor: 'pointer'
  },
  alertBox: {
    display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
    background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.2)',
    borderRadius: '10px', padding: '1rem'
  },
  alertIcon: { fontSize: '1.2rem', flexShrink: 0 },
  alertText: { color: '#a0aec0', fontSize: '0.82rem', lineHeight: 1.6 },
};

export default EmergencyContacts;