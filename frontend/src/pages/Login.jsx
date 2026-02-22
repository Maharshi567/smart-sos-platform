import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('✅ Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>🚨</span>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your SmartSOS account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>📧 Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>🔒 Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one here →</Link>
        </p>
      </div>

      {/* Background decoration */}
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f5f5f5',
    position: 'relative', overflow: 'hidden'
  },
  card: {
    background: '#ffffff',
    padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '440px',
    border: '1px solid #e0e0e0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    position: 'relative', zIndex: 1, margin: '1rem'
  },
  header: { textAlign: 'center', marginBottom: '2.5rem' },
  logo: { fontSize: '3rem' },
  title: { fontSize: '1.8rem', fontWeight: 'bold', color: '#111111', marginTop: '0.5rem' },
  subtitle: { color: '#606060', marginTop: '0.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { color: '#333333', fontSize: '0.9rem', fontWeight: '600' },
  input: {
    background: '#f9f9f9', border: '1px solid #e0e0e0',
    borderRadius: '8px', padding: '14px 16px', color: '#111111',
    fontSize: '1rem', outline: 'none', transition: 'border 0.3s',
    width: '100%'
  },
  submitBtn: {
    background: '#ff0000',
    color: '#fff', padding: '16px', borderRadius: '8px',
    fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,0,0,0.2)', marginTop: '0.5rem',
    transition: 'opacity 0.3s', border: 'none'
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
export default Login;