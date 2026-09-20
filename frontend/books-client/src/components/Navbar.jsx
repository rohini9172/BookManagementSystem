import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart.items.reduce((acc, i) => acc + i.quantity, 0));
  const isAdmin = user?.role === 'Admin';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>📚 BookStore</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        {user ? (
          <>
            {/* Cart & Orders only for regular users */}
            {!isAdmin && (
              <>
                <Link to="/cart" style={styles.link}>
                  🛒 Cart {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                </Link>
                <Link to="/orders" style={styles.link}>My Orders</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" style={styles.link}>⚙️ Admin Panel</Link>
            )}
            <span style={styles.user}>Hi, {user.name} {isAdmin && <span style={styles.roleBadge}>Admin</span>}</span>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#1a1a2e', color: '#fff', position: 'sticky', top: 0, zIndex: 100 },
  brand: { color: '#e94560', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 'bold' },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#eee', textDecoration: 'none', fontSize: '0.95rem' },
  user: { color: '#aaa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' },
  roleBadge: { background: '#e94560', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' },
  badge: { background: '#e94560', borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', marginLeft: '4px' },
};
