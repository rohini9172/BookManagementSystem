import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkout, clearLastOrder } from '../store/slices/cartSlice';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, lastOrder } = useSelector((s) => s.cart);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (lastOrder) {
      navigate('/orders');
      dispatch(clearLastOrder());
    }
  }, [lastOrder, navigate, dispatch]);

  const total = items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    dispatch(checkout({ shippingAddress: address }));
  };

  if (items.length === 0 && !lastOrder) {
    return (
      <div style={styles.container}>
        <p>Your cart is empty. <button onClick={() => navigate('/')} style={styles.link}>Shop now</button></p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Checkout</h2>
      <div style={styles.layout}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3>Shipping Address</h3>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full shipping address..."
            required
            rows={4}
            style={styles.textarea}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Placing Order...' : '✓ Place Order'}
          </button>
        </form>
        <div style={styles.summary}>
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} style={styles.summaryItem}>
              <span>{item.bookTitle} × {item.quantity}</span>
              <span>₹{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div style={styles.divider} />
          <div style={styles.summaryItem}>
            <strong>Total</strong>
            <strong style={{ color: '#e94560' }}>₹{total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '24px auto', padding: '0 24px' },
  heading: { color: '#1a1a2e', marginBottom: '24px' },
  layout: { display: 'flex', gap: '32px' },
  form: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  textarea: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' },
  submitBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '14px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
  summary: { width: '280px', background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: 'fit-content' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' },
  divider: { borderTop: '1px solid #eee', margin: '12px 0' },
  link: { background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', textDecoration: 'underline' },
};
