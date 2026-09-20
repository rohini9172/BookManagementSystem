import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, removeFromCart, updateCartItem, optimisticUpdate } from '../store/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((s) => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const total = items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleChange = (bookId, newQty) => {
    // Instant UI update first
    dispatch(optimisticUpdate({ bookId, quantity: newQty }));
    // Then sync to server
    dispatch(updateCartItem({ bookId, quantity: newQty }));
  };

  if (loading) return <p style={styles.msg}>Loading cart...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🛒 Your Cart</h2>
      {error && <p style={styles.errorMsg}>{error}</p>}
      {items.length === 0 ? (
        <div style={styles.empty}>
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/')} style={styles.shopBtn}>Browse Books</button>
        </div>
      ) : (
        <>
          <div style={styles.list}>
            {items.map((item) => (
              <div key={item.id} style={styles.item}>
                <img
                  src={item.coverImage || 'https://via.placeholder.com/80x100'}
                  alt={item.bookTitle}
                  style={styles.img}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80x100'; }}
                />
                <div style={styles.info}>
                  <h4 style={styles.title}>{item.bookTitle}</h4>
                  <p style={styles.price}>₹{item.price.toFixed(2)} each</p>
                </div>
                <div style={styles.qtyControl}>
                  <button
                    onClick={() => handleChange(item.bookId, item.quantity - 1)}
                    style={styles.qtyBtn}
                  >−</button>
                  <span style={styles.qtyNum}>{item.quantity}</span>
                  <button
                    onClick={() => handleChange(item.bookId, item.quantity + 1)}
                    style={styles.qtyBtn}
                  >+</button>
                </div>
                <span style={styles.subtotal}>₹{item.subtotal.toFixed(2)}</span>
                <button
                  onClick={() => dispatch(removeFromCart(item.bookId))}
                  style={styles.removeBtn}
                >✕</button>
              </div>
            ))}
          </div>
          <div style={styles.summary}>
            <span style={styles.total}>Total: <strong>₹{total.toFixed(2)}</strong></span>
            <button onClick={() => navigate('/checkout')} style={styles.checkoutBtn}>
              Proceed to Checkout →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '24px auto', padding: '0 24px' },
  heading: { color: '#1a1a2e', marginBottom: '24px' },
  msg: { textAlign: 'center', marginTop: '40px' },
  errorMsg: { color: '#c62828', background: '#ffebee', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  empty: { textAlign: 'center', marginTop: '60px' },
  shopBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  item: { display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  img: { width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 },
  info: { flex: 1 },
  title: { margin: '0 0 4px', fontSize: '1rem', color: '#1a1a2e' },
  price: { margin: 0, color: '#666', fontSize: '0.9rem' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: { background: '#f0f0f0', border: '1px solid #ddd', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { minWidth: '28px', textAlign: 'center', fontWeight: '700', fontSize: '1rem' },
  subtotal: { fontWeight: 'bold', color: '#e94560', minWidth: '70px', textAlign: 'right' },
  removeBtn: { background: 'none', border: 'none', color: '#bbb', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' },
  summary: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', marginTop: '24px', padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  total: { fontSize: '1.2rem', color: '#1a1a2e' },
  checkoutBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
};
