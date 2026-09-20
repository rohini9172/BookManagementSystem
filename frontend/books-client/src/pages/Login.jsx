import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (token) navigate('/');
    return () => dispatch(clearError());
  }, [token, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Welcome Back 👋</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={styles.input} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={styles.input} />
        <button type="submit" disabled={loading} style={styles.btn}>{loading ? 'Logging in...' : 'Login'}</button>
        <p style={styles.footer}>Don't have an account? <Link to="/register">Register</Link></p>
        <p style={styles.hint}>Demo: admin@books.com / Admin@123</p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f5f5f5' },
  form: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '360px', display: 'flex', flexDirection: 'column', gap: '16px' },
  heading: { margin: 0, color: '#1a1a2e', textAlign: 'center' },
  error: { color: '#e94560', background: '#ffeef0', padding: '10px', borderRadius: '4px', margin: 0, fontSize: '0.9rem' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' },
  btn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
  footer: { textAlign: 'center', margin: 0, fontSize: '0.9rem' },
  hint: { textAlign: 'center', margin: 0, fontSize: '0.8rem', color: '#999' },
};
