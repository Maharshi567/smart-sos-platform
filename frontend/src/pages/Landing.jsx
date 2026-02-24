import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: "🚨",
      title: "One-Click SOS",
      desc: "Press panic button to instantly alert contacts and authorities",
    },
    {
      icon: "📍",
      title: "Live Location",
      desc: "Real-time GPS tracking shared with trusted contacts",
    },
    {
      icon: "🏥",
      title: "Find Services",
      desc: "Locate nearest hospitals, police stations and fire stations",
    },
    {
      icon: "👥",
      title: "Trusted Contacts",
      desc: "Alert your family and friends instantly during danger",
    },
    {
      icon: "📋",
      title: "Emergency Guides",
      desc: "Life-saving instructions available even offline",
    },
  ];

  const stats = [
    { number: "10K+", label: "Lives Protected" },
    { number: "50K+", label: "Alerts Sent" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  const testimonials = [
    {
      name: "Rahul Mehta",
      role: "IT Professional, Pune",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      story:
        "My father had a sudden heart attack at home. I panicked completely. SmartSOS showed me the nearest hospital just 0.8km away and gave me turn-by-turn directions. We reached in 4 minutes. The doctors said those minutes saved his life. ❤️",
      emergency: "🏥 Medical Emergency",
      color: "#10b981",
      bg: "#f0fdf4",
      border: "#86efac",
      stars: 5,
    },
    {
      name: "Vikram Singh",
      role: "Businessman, Delhi",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      story:
        "There was a massive fire in our apartment building. Complete chaos everywhere. SmartSOS instantly showed the nearest fire station and police station. I directed my family using the map while calling 101. Everyone evacuated safely. 🚒",
      emergency: "🔥 Building Fire",
      color: "#dc2626",
      bg: "#fff5f5",
      border: "#fecaca",
      stars: 5,
    },
    {
      name: "Anjali Desai",
      role: "Teacher, Ahmedabad",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      story:
        "My mother collapsed due to low blood sugar. I panicked but SmartSOS showed the nearest hospital and gave me step-by-step first aid instructions. The ambulance arrived in 7 minutes. The doctors said my quick actions saved her.",
      emergency: "🏥 Medical Emergency",
      color: "#10b981",
      bg: "#f0fdf4",
      border: "#86efac",
      stars: 5,
    },
    {
  name: "Sunita Yadav",
  role: "Nurse, Patna",
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
  story: "A patient in my neighborhood went into diabetic shock. I used SmartSOS to find the nearest medical store open at night and contacted her son. The emergency instructions helped stabilize her until help came.",
  emergency: "💉 Medical Emergency",
  color: "#16a34a",
  bg: "#f0fdf4",
  border: "#bbf7d0",
  stars: 5,
},
{
  name: "Rajesh Kumar",
  role: "Student, Lucknow",
  image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  story: "There was a sudden heart attack in my shop. A customer collapsed. I used SmartSOS to locate the nearest hospital and called 108. The app showed me CPR steps while waiting. The doctors said those initial minutes made all the difference.",
  emergency: "❤️ Cardiac Arrest",
  color: "#dc2626",
  bg: "#fff5f5",
  border: "#fecaca",
  stars: 5,
},
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Profile",
      desc: "Sign up and add your medical info, blood group and trusted emergency contacts",
      img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop",
    },
    {
      step: "02",
      title: "Add Trusted Contacts",
      desc: "Add your family and friends who will receive instant SOS alerts with your location",
      img: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=300&h=200&fit=crop",
    },
    {
      step: "03",
      title: "Press SOS When Needed",
      desc: "One press sends your live location and audio recording to all contacts immediately",
      img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=300&h=200&fit=crop",
    },
  ];

  return (
    <div style={styles.container}>
      {/* ===== NAVBAR ===== */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <div style={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5L12 2z"
                fill="white"
              />
              <path
                d="M10 12l2 2 4-4"
                stroke="#ff2d2d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span style={styles.navName}>SmartSOS</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#how" style={styles.navLink}>
            How It Works
          </a>
          <a href="#features" style={styles.navLink}>
            Features
          </a>
          <a href="#testimonials" style={styles.navLink}>
            Reviews
          </a>
        </div>
        <div style={styles.navButtons}>
          {user ? (
            // ✅ Already logged in — show go to app button
            <button
              onClick={() => navigate("/dashboard")}
              style={styles.navRegisterBtn}
            >
              🏠 Go to App
            </button>
          ) : (
            // ✅ Not logged in — show login and register
            <>
              <button
                onClick={() => navigate("/login")}
                style={styles.navLoginBtn}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                style={styles.navRegisterBtn}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </nav>
      {/* ===== BUILT BY BANNER ===== */}
<div style={{
  background: "#ffffff",
  borderBottom: "1px solid #f0f0f0",
  padding: "clamp(0.8rem, 2vw, 1.2rem) clamp(1rem, 4vw, 3rem)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.8rem",
  flexWrap: "wrap",
  textAlign: "center",
}}>
  <span style={{
    color: "#9ca3af",
    fontSize: "clamp(0.8rem, 2vw, 1rem)",
    fontWeight: "500",
    letterSpacing: "0.05em",
  }}>Built by</span>
  <span style={{
    fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
    fontWeight: "900",
    background: "linear-gradient(135deg, #ff2d2d, #f97316, #ff2d2d)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.02em",
  }}>Maharshi Danidhariya</span>
  <span style={{
    background: "#fff5f5",
    border: "1px solid #fecaca",
    color: "#ff2d2d",
    padding: "3px 12px",
    borderRadius: "50px",
    fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
    fontWeight: "700",
    letterSpacing: "0.05em",
  }}>Full Stack Developer</span>
</div>
      {/* ===== HERO SECTION ===== */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.heroBadge}>
            🛡️ #1 Women Safety Platform in India
          </div>
          <h1 style={styles.heroTitle}>
            Your Safety is Our
            <span style={styles.heroHighlight}> Priority</span>
          </h1>
          <p style={styles.heroSubtitle}>
            One press of a button can save your life. SmartSOS instantly alerts
            your trusted contacts, shares your live location, and connects you
            to emergency services in seconds.
          </p>
          <div style={styles.heroButtons}>
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                style={styles.heroBtn}
              >
                🏠 Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  style={styles.heroBtn}
                >
                  🚀 Get Started Free
                </button>
                <button
                  onClick={() => navigate("/login")}
                  style={styles.heroBtnOutline}
                >
                  🔐 Sign In
                </button>
              </>
            )}
          </div>
          <div style={styles.heroStats}>
            {stats.map((s, i) => (
              <div key={i} style={styles.statItem}>
                <span style={styles.statNumber}>{s.number}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Images */}
        <div style={styles.heroRight}>
          <div style={styles.heroImgGrid}>
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=280&h=340&fit=crop&crop=face"
              alt="Safe woman"
              style={styles.heroImgMain}
            />
            <div style={styles.heroImgCol}>
              <img
                src="https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=180&h=160&fit=crop"
                alt="Phone safety"
                style={styles.heroImgSm}
              />
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=180&h=160&fit=crop"
                alt="Friends safe"
                style={styles.heroImgSm}
              />
            </div>
          </div>

          {/* Floating alert card */}
          <div style={styles.floatingCard}>
            <span style={styles.floatingDot} />
            <div>
              <p style={styles.floatingTitle}>🚨 SOS Alert Sent!</p>
              <p style={styles.floatingText}>Location shared with 3 contacts</p>
            </div>
          </div>

          {/* Floating safe card */}
          <div style={styles.floatingCard2}>
            <span>✅</span>
            <div>
              <p style={styles.floatingTitle}>You are Protected</p>
              <p style={styles.floatingText}>SmartSOS is active</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY SECTION ===== */}
      <section style={styles.trustedSection}>
        <p style={styles.trustedText}>Trusted by women across India 🇮🇳</p>
        <div style={styles.trustedAvatars}>
          {[
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=40&h=40&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face",
          ].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="user"
              style={{
                ...styles.trustedAvatar,
                marginLeft: i === 0 ? 0 : "-10px",
              }}
            />
          ))}
          <span style={styles.trustedCount}>+10,000 users</span>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" style={styles.howSection}>
        <div style={styles.sectionBadge}>How It Works</div>
        <h2 style={styles.sectionTitle}>Simple. Fast. Life-saving.</h2>
        <p style={styles.sectionSubtitle}>
          Set up in 2 minutes and be protected always
        </p>
        <div style={styles.howGrid}>
          {howItWorks.map((h, i) => (
            <div key={i} style={styles.howCard}>
              <div style={styles.howImgWrapper}>
                <img src={h.img} alt={h.title} style={styles.howImg} />
                <div style={styles.howStep}>{h.step}</div>
              </div>
              <h3 style={styles.howTitle}>{h.title}</h3>
              <p style={styles.howDesc}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionBadge}>Features</div>
        <h2 style={styles.sectionTitle}>Everything You Need in an Emergency</h2>
        <p style={styles.sectionSubtitle}>Built for real-world emergencies</p>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIconBox}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BANNER SECTION ===== */}
      <section style={styles.bannerSection}>
        <div style={styles.bannerLeft}>
          <h2 style={styles.bannerTitle}>Be Safe. Be Smart. Be Ready.</h2>
          <p style={styles.bannerText}>
            Join thousands of women who trust SmartSOS to keep them safe every
            day.
          </p>
          <button
            onClick={() => navigate("/register")}
            style={styles.bannerBtn}
          >
            🛡️ Start Protecting Yourself Now — It's Free
          </button>
        </div>
        <div style={styles.bannerRight}>
          <img
            src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=280&fit=crop"
            alt="Safe women"
            style={styles.bannerImg}
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        style={{
          padding: "clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 3rem)",
          background: "#f5f7fa",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
            maxWidth: "600px",
            width: "100%",
            margin: "0 auto 3rem auto",
          }}
        >
          <span
            style={{
              background: "#fff5f5",
              color: "#ff2d2d",
              padding: "6px 16px",
              borderRadius: "50px",
              fontSize: "0.85rem",
              fontWeight: "700",
              border: "1px solid #fecaca",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            💬 Real Stories
          </span>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: "900",
              color: "#111827",
              marginBottom: "0.5rem",
            }}
          >
            Real Stories, Real Safety
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: "1rem",
              margin: "0 auto",
            }}
          >
            Lives saved across different emergencies by real SmartSOS users
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1100px",
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "1.5rem",
                border: "1px solid " + t.border,
                borderTop: "4px solid " + t.color,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                transition: "transform 0.2s",
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              {/* Emergency Badge */}
              <span
                style={{
                  background: t.bg,
                  color: t.color,
                  padding: "5px 14px",
                  borderRadius: "50px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  border: "1px solid " + t.border,
                  alignSelf: "flex-start",
                  display: "inline-block",
                }}
              >
                {t.emergency}
              </span>

              {/* Story */}
              <p
                style={{
                  color: "#374151",
                  fontSize: "0.92rem",
                  lineHeight: 1.8,
                  fontStyle: "italic",
                  flex: 1,
                  margin: 0,
                }}
              >
                "{t.story}"
              </p>

              {/* Stars */}
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: "1rem",
                  letterSpacing: "2px",
                }}
              >
                {"★".repeat(t.stars)}
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: t.border }} />

              {/* User Info */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
              >
                <img
                  src={t.image}
                  alt={t.name}
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid " + t.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: "700",
                      color: "#111827",
                      fontSize: "0.9rem",
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.8rem",
                      margin: "2px 0 0",
                    }}
                  >
                    {t.role}
                  </p>
                </div>
                {/* Verified badge */}
                <span
                  style={{
                    background: t.bg,
                    color: t.color,
                    border: "1px solid " + t.border,
                    borderRadius: "50px",
                    padding: "3px 10px",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  ✅ Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ===== OTHER FEATURES SECTION ===== */}
      <section style={styles.otherSection}>
        <div style={styles.sectionBadge}>More Than Just SOS</div>
        <h2 style={styles.sectionTitle}>Built for Every Emergency</h2>
        <p style={styles.sectionSubtitle}>
          SmartSOS is not just for women safety — it helps in all real life
          emergencies
        </p>
        <div style={styles.otherGrid}>
          {[
            {
              icon: "🚑",
              title: "Medical Emergency",
              desc: "Find nearest hospitals instantly and call ambulance (108) with one tap. Your medical ID and blood group is shared automatically.",
              color: "#dcfce7",
              border: "#86efac",
              text: "#16a34a",
            },
            {
              icon: "🚒",
              title: "Fire Emergency",
              desc: "Locate nearest fire station and call fire brigade (101) instantly. Step by step fire safety instructions available offline.",
              color: "#fff7ed",
              border: "#fed7aa",
              text: "#d97706",
            },
            {
              icon: "🚗",
              title: "Road Accident",
              desc: "Instant SOS with live location helps rescue teams find you fast. Emergency contacts alerted automatically with GPS coordinates.",
              color: "#eff6ff",
              border: "#bfdbfe",
              text: "#2563eb",
            },
            {
              icon: "👮",
              title: "Police Help",
              desc: "Direct one tap call to police (100). Audio recording starts automatically as evidence during any crime or threat.",
              color: "#faf5ff",
              border: "#e9d5ff",
              text: "#7c3aed",
            },
            {
              icon: "🏥",
              title: "Find Nearby Services",
              desc: "Live map shows nearest hospitals, police stations and fire stations around your current location in real time.",
              color: "#fff5f5",
              border: "#fecaca",
              text: "#dc2626",
            },
            {
              icon: "📋",
              title: "Emergency Instructions",
              desc: "Step by step guides for CPR, bleeding control, burns, choking and more — works offline when internet is not available.",
              color: "#f0fdf4",
              border: "#bbf7d0",
              text: "#15803d",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                ...styles.otherCard,
                background: item.color,
                borderColor: item.border,
              }}
            >
              <div style={{ ...styles.otherIcon, color: item.text }}>
                {item.icon}
              </div>
              <h3 style={{ ...styles.otherTitle, color: item.text }}>
                {item.title}
              </h3>
              <p style={styles.otherDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* ===== CTA SECTION ===== */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Don't Wait for an Emergency</h2>
          <p style={styles.ctaSubtitle}>
            Set up your safety profile in 2 minutes. Be prepared always.
          </p>
          <div style={styles.ctaButtons}>
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                style={styles.ctaBtn}
              >
                🏠 Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  style={styles.ctaBtn}
                >
                  🚀 Get Started Free
                </button>
                <button
                  onClick={() => navigate("/login")}
                  style={styles.ctaBtnOutline}
                >
                  🔐 Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrand}>
            <div style={styles.logoBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5L12 2z"
                  fill="white"
                />
                <path
                  d="M10 12l2 2 4-4"
                  stroke="#ff2d2d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span style={styles.navName}>SmartSOS</span>
          </div>
          <p style={styles.footerTagline}>🛡️ Built for Safety. Always Ready.</p>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopy}>© 2026 SmartSOS. All rights reserved.</p>
          <div style={styles.footerLinks}>
            <span style={styles.footerLink}>
              Creator : Maharshi Danidhariya
            </span>
          </div>
        </div>
      </footer>

      <style>{`
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,45,45,0.3); }
    50% { box-shadow: 0 0 0 15px rgba(255,45,45,0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  #how, #features, #testimonials { scroll-margin-top: 80px; }

  /* ✅ MOBILE RESPONSIVE FIXES */
  * { box-sizing: border-box; }

  @media (max-width: 768px) {
    /* Hide hero images on mobile */
    .hero-right { display: none !important; }

    /* Hide nav links on mobile */
    .nav-links { display: none !important; }

    /* Stack hero on mobile */
    .hero-section {
      flex-direction: column !important;
      text-align: center !important;
      padding: 2rem 1rem !important;
    }

    /* Full width sections */
    section {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }

    /* Grids become 1 column on small screens */
    .how-grid {
      grid-template-columns: 1fr !important;
    }

    /* Banner stack */
    .banner-section {
      flex-direction: column !important;
    }

    /* Footer stack */
    .footer-top {
      flex-direction: column !important;
      text-align: center !important;
    }

    /* Testimonials 1 column */
    .testimonials-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 480px) {
    /* Very small phones */
    h1 { font-size: 1.8rem !important; }
    h2 { font-size: 1.4rem !important; }
    button { min-height: 44px; }
    input { font-size: 16px !important; }
  }
`}</style>
    </div>
  );
};

const styles = {
  container: { background: "#ffffff", minHeight: "100vh", color: "#212121" },

  // Navbar
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 clamp(1rem, 4vw, 3rem)",
    height: "64px",
    background: "#ffffff",
    borderBottom: "1px solid #f0f0f0",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    overflow: "hidden", // ✅ prevent navbar overflow
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  logoBox: {
    width: "38px",
    height: "38px",
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(255,45,45,0.3)",
  },
  navName: { fontSize: "1.3rem", fontWeight: "800", color: "#ff2d2d" },
  navLinks: {
    display: "flex",
    gap: "2rem",
    "@media(max-width:768px)": { display: "none" }, // won't work in inline styles
  },
  navLink: {
    color: "#6b7280",
    fontSize: "0.9rem",
    fontWeight: "500",
    textDecoration: "none",
    cursor: "pointer",
  },
  navButtons: { display: "flex", gap: "1rem", alignItems: "center" },
  navLoginBtn: {
    background: "transparent",
    color: "#212121",
    padding: "10px 22px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "600",
  },
  navRegisterBtn: {
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(255,45,45,0.3)",
  },

  // Hero
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(2rem, 5vw, 5rem) clamp(1rem, 4vw, 3rem)",
    gap: "2rem",
    flexDirection: "column", // ✅ stack on mobile
    background:
      "linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff5f5 100%)",
    overflow: "hidden",
  },
  heroLeft: {
    flex: 1,
    minWidth: "0", // ✅ prevents overflow
    width: "100%",
    maxWidth: "560px",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-block",
    background: "#fff5f5",
    border: "1px solid #fecaca",
    padding: "8px 20px",
    borderRadius: "50px",
    color: "#dc2626",
    fontSize: "0.85rem",
    marginBottom: "1.5rem",
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: "clamp(1.8rem, 6vw, 3.8rem)",
    fontWeight: "900",
    lineHeight: 1.15,
    marginBottom: "1rem",
    color: "#111827",
    wordBreak: "break-word", // ✅ prevents text overflow
  },
  heroHighlight: { color: "#ff2d2d" },
  heroSubtitle: {
    fontSize: "clamp(0.9rem, 3vw, 1.1rem)",
    color: "#6b7280",
    lineHeight: 1.8,
    marginBottom: "2rem",
    maxWidth: "100%", // ✅ full width on mobile
  },
  heroButtons: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "2rem",
    justifyContent: "center", // ✅ center on mobile
  },
  heroBtn: {
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    color: "#fff",
    padding: "16px 36px",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 8px 24px rgba(255,45,45,0.35)",
    animation: "pulse 2s infinite",
  },
  heroBtnOutline: {
    background: "#ffffff",
    color: "#374151",
    padding: "16px 36px",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "2px solid #e5e7eb",
  },
  heroStats: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
    justifyContent: "center", // ✅ center on mobile
  },
  statItem: { display: "flex", flexDirection: "column", gap: "4px" },
  statNumber: { fontSize: "1.8rem", fontWeight: "900", color: "#ff2d2d" },
  statLabel: { fontSize: "0.82rem", color: "#9ca3af", fontWeight: "500" },

  // Hero Images
  heroRight: {
    display: "none", // ✅ hide images on mobile
    flex: 1,
    minWidth: "280px",
    maxWidth: "460px",
    position: "relative",
    margin: "0 auto",
  },
  heroImgGrid: { display: "flex", gap: "12px", alignItems: "flex-start" },
  heroImgMain: {
    width: "260px",
    height: "340px",
    objectFit: "cover",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  heroImgCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingTop: "30px",
  },
  heroImgSm: {
    width: "160px",
    height: "160px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  },
  floatingCard: {
    position: "absolute",
    bottom: "20px",
    left: "-20px",
    background: "#ffffff",
    padding: "12px 18px",
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    animation: "float 3s ease-in-out infinite",
    border: "1px solid #fee2e2",
  },
  floatingCard2: {
    position: "absolute",
    top: "-30px",
    right: "-10px",
    background: "#ffffff",
    padding: "12px 18px",
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    animation: "float 3s ease-in-out infinite 1.5s",
    border: "1px solid #dcfce7",
  },
  floatingDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#ff2d2d",
    display: "inline-block",
    animation: "pulse 1s infinite",
  },
  floatingTitle: { fontSize: "0.85rem", fontWeight: "700", color: "#111827" },
  floatingText: { fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" },

  // Trusted
  trustedSection: {
    background: "#f9fafb",
    padding: "2rem 3rem",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    justifyContent: "center",
    flexWrap: "wrap",
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
  },
  trustedText: { color: "#6b7280", fontSize: "0.95rem", fontWeight: "500" },
  trustedAvatars: { display: "flex", alignItems: "center" },
  trustedAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "2px solid #ffffff",
    objectFit: "cover",
  },
  trustedCount: {
    color: "#374151",
    fontSize: "0.9rem",
    fontWeight: "600",
    marginLeft: "12px",
  },

  // How it works
  howSection: {
    padding: "5rem 3rem",
    background: "#ffffff",
    textAlign: "center",
  },
  sectionBadge: {
    display: "inline-block",
    background: "#fff5f5",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "6px 18px",
    borderRadius: "50px",
    fontSize: "0.82rem",
    fontWeight: "700",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "0.8rem",
  },
  sectionSubtitle: { color: "#6b7280", fontSize: "1rem", marginBottom: "3rem" },
  howGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "2rem",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  howCard: {
    background: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #f0f0f0",
    textAlign: "left",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    transition: "transform 0.2s",
  },
  howImgWrapper: { position: "relative" },
  howImg: { width: "100%", height: "180px", objectFit: "cover" },
  howStep: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: "900",
  },
  howTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#111827",
    padding: "1.2rem 1.2rem 0.4rem",
  },
  howDesc: {
    fontSize: "0.88rem",
    color: "#6b7280",
    lineHeight: 1.7,
    padding: "0 1.2rem 1.2rem",
  },

  // Features
  featuresSection: {
    padding: "5rem 3rem",
    background: "#f9fafb",
    textAlign: "center",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  featureCard: {
    background: "#ffffff",
    padding: "2rem",
    borderRadius: "16px",
    border: "1px solid #f0f0f0",
    textAlign: "left",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  featureIconBox: {
    width: "52px",
    height: "52px",
    background: "#fff5f5",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.6rem",
    marginBottom: "1rem",
  },
  featureTitle: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "0.6rem",
  },
  featureDesc: { color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.7 },

  // Banner
  bannerSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "2rem",
    padding: "4rem 3rem",
    flexWrap: "wrap",
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
  },
  bannerLeft: { flex: 1, minWidth: "280px" },
  bannerTitle: {
    fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "1rem",
  },
  bannerText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: "1rem",
    lineHeight: 1.7,
    marginBottom: "1.5rem",
    maxWidth: "460px",
  },
  bannerBtn: {
    background: "#ffffff",
    color: "#ff2d2d",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  bannerRight: {
    flex: 1,
    minWidth: "260px",
    maxWidth: "400px",
    margin: "0 auto",
  },
  bannerImg: {
    width: "100%",
    height: "240px",
    objectFit: "cover",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  // Testimonials
  testimonialsSection: {
    padding: "5rem 3rem",
    background: "#ffffff",
    textAlign: "center",
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  testimonialCard: {
    background: "#f9fafb",
    padding: "2rem",
    borderRadius: "20px",
    border: "1px solid #f0f0f0",
    textAlign: "left",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  stars: { fontSize: "1rem", marginBottom: "1rem" },
  testimonialText: {
    color: "#374151",
    fontSize: "0.95rem",
    lineHeight: 1.8,
    marginBottom: "1.5rem",
    fontStyle: "italic",
  },
  testimonialUser: { display: "flex", alignItems: "center", gap: "1rem" },
  testimonialAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fecaca",
  },
  testimonialName: { color: "#111827", fontWeight: "700", fontSize: "0.95rem" },
  testimonialRole: { color: "#9ca3af", fontSize: "0.82rem", marginTop: "2px" },

  // CTA
  ctaSection: {
    padding: "5rem 3rem",
    textAlign: "center",
    background: "linear-gradient(135deg, #fff5f5, #ffffff)",
  },
  ctaContent: { maxWidth: "600px", margin: "0 auto" },
  ctaTitle: {
    fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "1rem",
  },
  ctaSubtitle: {
    color: "#6b7280",
    fontSize: "1rem",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  ctaButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaBtn: {
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    color: "#fff",
    padding: "16px 36px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 8px 24px rgba(255,45,45,0.3)",
  },
  ctaBtnOutline: {
    background: "#ffffff",
    color: "#374151",
    padding: "16px 36px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "2px solid #e5e7eb",
  },

  // Footer
  footer: { background: "#e0f2fe", padding: "2.5rem 3rem" },
  footerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  footerBrand: { display: "flex", alignItems: "center", gap: "10px" },
  footerTagline: { color: "#0369a1", fontSize: "0.9rem" },
  footerBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  footerCopy: { color: "#0369a1", fontSize: "0.85rem" },
  footerLinks: { display: "flex", gap: "1.5rem" },
  footerLink: { color: "#0369a1", fontSize: "0.85rem", cursor: "pointer" },
  otherSection: {
    padding: "5rem 3rem",
    background: "#f9fafb",
    textAlign: "center",
  },
  otherGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.2rem",
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "left",
  },
  otherCard: {
    padding: "1.8rem",
    borderRadius: "16px",
    border: "1px solid",
    transition: "transform 0.2s",
  },
  otherIcon: { fontSize: "2.2rem", marginBottom: "0.8rem" },
  otherTitle: {
    fontSize: "1.05rem",
    fontWeight: "700",
    marginBottom: "0.6rem",
  },
  otherDesc: {
    color: "#6b7280",
    fontSize: "0.88rem",
    lineHeight: 1.7,
  },
};

export default Landing;
