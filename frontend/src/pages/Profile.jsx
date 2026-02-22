import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    medicalConditions: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        medicalConditions: user.medicalConditions || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/api/auth/profile", form);
      toast.success("✅ Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const infoFields = [
    { icon: "👤", label: "Full Name", key: "name", type: "text" },
    { icon: "📧", label: "Email", key: "email", type: "email" },
    { icon: "📱", label: "Phone", key: "phone", type: "tel" },
    { icon: "📍", label: "Address", key: "address", type: "text" },
  ];

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <div style={styles.profileHero}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || "👤"}
          </div>
          <div style={styles.onlineDot}></div>
        </div>
        <h2 style={styles.profileName}>{user?.name}</h2>
        <p style={styles.profileEmail}>{user?.email}</p>
        <div style={styles.profileBadges}>
          {form.bloodGroup && (
            <span style={styles.bloodBadge}>🩸 {form.bloodGroup}</span>
          )}
          <span style={styles.safeBadge}>🛡️ Protected</span>
        </div>
      </div>

      {/* Profile Info */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>📋 Personal Information</h3>
          <button
            onClick={() => setEditing(!editing)}
            style={editing ? styles.cancelBtn : styles.editBtn}
          >
            {editing ? "✕ Cancel" : "✏️ Edit"}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={styles.fieldsGrid}>
            {infoFields.map((f) => (
              <div key={f.key} style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>
                  {f.icon} {f.label}
                </label>
                {editing ? (
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    style={styles.input}
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                  />
                ) : (
                  <p style={styles.fieldValue}>
                    {form[f.key] || <span style={styles.notSet}>Not set</span>}
                  </p>
                )}
              </div>
            ))}

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>🩸 Blood Group</label>
              {editing ? (
                <select
                  value={form.bloodGroup}
                  onChange={(e) =>
                    setForm({ ...form, bloodGroup: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
              ) : (
                <p style={styles.fieldValue}>
                  {form.bloodGroup || (
                    <span style={styles.notSet}>Not set</span>
                  )}
                </p>
              )}
            </div>

            <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
              <label style={styles.fieldLabel}>🏥 Medical Conditions</label>
              {editing ? (
                <textarea
                  value={form.medicalConditions}
                  onChange={(e) =>
                    setForm({ ...form, medicalConditions: e.target.value })
                  }
                  style={{
                    ...styles.input,
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  placeholder="Allergies, conditions, medications..."
                />
              ) : (
                <p style={styles.fieldValue}>
                  {form.medicalConditions || (
                    <span style={styles.notSet}>None listed</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {editing && (
            <button type="submit" style={styles.saveBtn} disabled={loading}>
              {loading ? "⏳ Saving..." : "💾 Save Changes"}
            </button>
          )}
        </form>
      </div>

      {/* Medical Card */}
      <div style={styles.medCard}>
        <div style={styles.medCardHeader}>
          <span style={styles.medCardIcon}>🏥</span>
          <h3 style={styles.medCardTitle}>Medical ID Card</h3>
          <span style={styles.medCardSub}>In case of emergency</span>
        </div>
        <div style={styles.medCardBody}>
          <div style={styles.medRow}>
            <span style={styles.medKey}>Name:</span>
            <span style={styles.medVal}>{user?.name || "—"}</span>
          </div>
          <div style={styles.medRow}>
            <span style={styles.medKey}>Blood Type:</span>
            <span
              style={{
                ...styles.medVal,
                color: "#ff2d2d",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              {form.bloodGroup || "—"}
            </span>
          </div>
          <div style={styles.medRow}>
            <span style={styles.medKey}>Phone:</span>
            <span style={styles.medVal}>{form.phone || "—"}</span>
          </div>
          <div style={styles.medRow}>
            <span style={styles.medKey}>Conditions:</span>
            <span style={styles.medVal}>
              {form.medicalConditions || "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} style={styles.logoutBtn}>
        🚪 Logout from Account
      </button>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    background: "#f5f7fa",
    maxWidth: "800px",
    margin: "0 auto",
  },
  profileHero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2.5rem",
    background: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e8ecf0",
    marginBottom: "2rem",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  avatarWrapper: { position: "relative", marginBottom: "1rem" },
  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#fff",
    border: "4px solid #fecaca",
  },
  onlineDot: {
    position: "absolute",
    bottom: "4px",
    right: "4px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#16a34a",
    border: "3px solid #ffffff",
  },
  profileName: { fontSize: "1.6rem", fontWeight: "bold", color: "#212121" },
  profileEmail: { color: "#6b7280", margin: "4px 0 1rem" },
  profileBadges: {
    display: "flex",
    gap: "0.8rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  bloodBadge: {
    background: "#fff5f5",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "6px 16px",
    borderRadius: "50px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  safeBadge: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    color: "#16a34a",
    padding: "6px 16px",
    borderRadius: "50px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "2rem",
    border: "1px solid #e8ecf0",
    marginBottom: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  cardTitle: { fontSize: "1.1rem", fontWeight: "bold", color: "#212121" },
  editBtn: {
    background: "#eff6ff",
    border: "1px solid #93c5fd",
    color: "#2563eb",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  cancelBtn: {
    background: "#fff5f5",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min-content, 1fr))",
    gap: "1.5rem",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  fieldLabel: { color: "#6b7280", fontSize: "0.85rem", fontWeight: "600" },
  fieldValue: {
    color: "#212121",
    fontSize: "1rem",
    padding: "4px 0",
    borderBottom: "1px solid #e8ecf0",
    wordBreak: "break-word", // allows breaking long words if needed
    overflowWrap: "break-word", // modern equivalent
    maxWidth: "100%", // ensures it stays inside its column
  },
  notSet: { color: "#9ca3af", fontStyle: "italic" },
  input: {
    background: "#f9fafb",
    border: "1px solid #e8ecf0",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#212121",
    fontSize: "0.95rem",
    outline: "none",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #ff2d2d, #e94560)",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "1.5rem",
    boxShadow: "0 4px 12px rgba(255,45,45,0.3)",
  },
  medCard: {
    background: "#fff9f0",
    border: "2px solid #fed7aa",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "2rem",
  },
  medCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    marginBottom: "1.2rem",
  },
  medCardIcon: { fontSize: "1.8rem" },
  medCardTitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#d97706",
    flex: 1,
  },
  medCardSub: { color: "#9ca3af", fontSize: "0.8rem" },
  medCardBody: { display: "flex", flexDirection: "column", gap: "0.8rem" },
  medRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    borderBottom: "1px solid rgba(253,186,116,0.3)",
    paddingBottom: "0.8rem",
  },
  medKey: { color: "#9ca3af", fontSize: "0.85rem", minWidth: "100px" },
  medVal: { color: "#212121", fontSize: "0.95rem", flex: 1 },
  logoutBtn: {
    background: "#fff5f5",
    border: "2px solid #fecaca",
    color: "#dc2626",
    padding: "14px 32px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    marginBottom: "2rem",
  },
};

export default Profile;
