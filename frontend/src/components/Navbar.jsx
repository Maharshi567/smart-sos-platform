import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    // Always show the button on all devices
    setShowInstall(true);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      // Android Chrome — native install prompt
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') setShowInstall(false);
    } else {
      // Desktop / iPhone — show manual instructions
      alert("To install SmartSOS:\n\n📱 Android: Tap ⋮ menu → 'Add to Home Screen'\n💻 Chrome: Click ⋮ → 'Install SmartSOS'\n🌐 Edge: Click ... → 'Apps' → 'Install'\n🍎 iPhone Safari: Tap Share → 'Add to Home Screen'");
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/map', label: 'Map', icon: '🗺️' },
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/instructions', label: 'Instructions', icon: '📋' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <>
      <nav style={styles.nav}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => navigate('/dashboard')}>
          <div style={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5L12 2z" fill="white"/>
              <path d="M10 12l2 2 4-4" stroke="#ff2d2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.brandName}>SmartSOS</span>
        </div>

        {/* Desktop Links */}
        <div style={styles.desktopLinks}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                ...(location.pathname === link.path ? styles.activeLink : {})
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {location.pathname === link.path && (
                <div style={styles.activeDot} />
              )}
            </Link>
          ))}
        </div>

        {/* Right Side — Desktop */}
        <div style={styles.rightSide}>
          {showInstall && (
            <button onClick={handleInstall} style={styles.installBtn}>
              📲 Install App
            </button>
          )}
          <div style={styles.userBadge}>
            <div style={styles.userAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>

        {/* Hamburger — Mobile only */}
        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {/* User info on mobile */}
          <div style={styles.mobileUser}>
            <div style={styles.mobileAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={styles.mobileUserName}>{user?.name}</p>
              <p style={styles.mobileUserEmail}>{user?.email}</p>
            </div>
          </div>

          {/* Nav Links */}
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.mobileLink,
                ...(location.pathname === link.path ? styles.mobileLinkActive : {})
              }}
              onClick={() => setMenuOpen(false)}
            >
              <span style={styles.mobileLinkIcon}>{link.icon}</span>
              <span>{link.label}</span>
              {location.pathname === link.path && (
                <span style={styles.mobileActiveBadge}>●</span>
              )}
            </Link>
          ))}

          {/* Install App — Mobile */}
          {showInstall && (
            <button onClick={handleInstall} style={styles.mobileInstallBtn}>
              📲 Install App
            </button>
          )}

          {/* Logout */}
          <button onClick={handleLogout} style={styles.mobileLogout}>
            🚪 Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
};

const isMobile = window.innerWidth <= 768;

const styles = {
  nav: {
    background: '#ffffff',
    padding: '0 1.5rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  brand: {
    display: 'flex', alignItems: 'center',
    gap: '10px', cursor: 'pointer', flexShrink: 0
  },
  logoBox: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)',
    borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,45,45,0.3)'
  },
  brandName: { fontSize: '1.2rem', fontWeight: '800', color: '#ff2d2d' },

  desktopLinks: {
    display: 'flex', alignItems: 'center', gap: '0.2rem',
  },
  link: {
    color: '#6b7280', padding: '8px 12px', borderRadius: '10px',
    fontSize: '0.85rem', fontWeight: '500', display: 'flex',
    alignItems: 'center', gap: '6px', transition: 'all 0.2s',
    position: 'relative', textDecoration: 'none', whiteSpace: 'nowrap'
  },
  activeLink: {
    color: '#ff2d2d', background: 'rgba(255,45,45,0.08)', fontWeight: '600'
  },
  activeDot: {
    position: 'absolute', bottom: '-2px', left: '50%',
    transform: 'translateX(-50%)', width: '4px', height: '4px',
    background: '#ff2d2d', borderRadius: '50%'
  },

  rightSide: {
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  installBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff', padding: '8px 16px', borderRadius: '10px',
    fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
    whiteSpace: 'nowrap', border: 'none',
  },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0
  },
  userName: {
    color: '#374151', fontSize: '0.88rem',
    fontWeight: '600', whiteSpace: 'nowrap'
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)',
    color: '#fff', padding: '8px 16px', borderRadius: '10px',
    fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(255,45,45,0.3)', whiteSpace: 'nowrap',
    border: 'none',
  },

  hamburger: {
    display: 'none',
    background: 'none', border: 'none',
    color: '#374151', fontSize: '1.5rem',
    cursor: 'pointer', padding: '8px',
    borderRadius: '8px',
    ...(isMobile ? { display: 'flex' } : {})
  },

  mobileMenu: {
    position: 'fixed', top: '64px', left: 0, right: 0,
    background: '#ffffff', display: 'flex', flexDirection: 'column',
    padding: '1rem', gap: '0.4rem',
    borderBottom: '1px solid #e8ecf0',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    zIndex: 999, maxHeight: 'calc(100vh - 64px)',
    overflowY: 'auto'
  },
  mobileUser: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem', background: '#f9fafb',
    borderRadius: '12px', marginBottom: '0.5rem'
  },
  mobileAvatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0
  },
  mobileUserName: { color: '#212121', fontWeight: '700', fontSize: '0.95rem', margin: 0 },
  mobileUserEmail: { color: '#6b7280', fontSize: '0.8rem', marginTop: '2px', margin: 0 },
  mobileLink: {
    color: '#374151', padding: '12px 16px', borderRadius: '10px',
    fontSize: '0.95rem', display: 'flex', alignItems: 'center',
    gap: '12px', fontWeight: '500', textDecoration: 'none',
    transition: 'background 0.2s'
  },
  mobileLinkActive: {
    background: 'rgba(255,45,45,0.08)', color: '#ff2d2d', fontWeight: '600'
  },
  mobileLinkIcon: { fontSize: '1.2rem', width: '24px', textAlign: 'center' },
  mobileActiveBadge: { marginLeft: 'auto', color: '#ff2d2d', fontSize: '0.6rem' },
  mobileInstallBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff', padding: '14px 16px', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600',
    cursor: 'pointer', border: 'none',
  },
  mobileLogout: {
    background: 'linear-gradient(135deg, #ff2d2d, #e94560)',
    color: '#fff', padding: '14px 16px', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600', marginTop: '0.5rem',
    cursor: 'pointer', border: 'none'
  }
};

export default Navbar;