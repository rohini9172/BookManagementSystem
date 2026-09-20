import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCartItem, optimisticUpdate } from '../store/slices/cartSlice';

export default function BookCard({ book }) {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);
  const cartItem   = useSelector((s) => s.cart.items.find((i) => i.bookId === book.id));
  const qty        = cartItem?.quantity ?? 0;
  const outOfStock = book.stock === 0;

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    dispatch(addToCart({ bookId: book.id, quantity: 1 }));
  };

  const handleChange = (newQty) => {
    // 1. Update UI instantly
    dispatch(optimisticUpdate({ bookId: book.id, quantity: newQty }));
    // 2. Sync to server in background
    dispatch(updateCartItem({ bookId: book.id, quantity: newQty }));
  };

  return (
    <div style={styles.card}>
      {/* Clickable area — image + info only */}
      <div onClick={() => navigate(`/books/${book.id}`)} style={styles.clickable}>
        <img
          src={book.coverImage || 'https://via.placeholder.com/150x200?text=No+Cover'}
          alt={book.title}
          style={styles.img}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200?text=No+Cover'; }}
        />
        <div style={styles.body}>
          <h3 style={styles.title}>{book.title}</h3>
          <p style={styles.author}>{book.author}</p>
          <p style={styles.category}>{book.category}</p>
          <div style={styles.footer}>
            <span style={styles.price}>₹{book.price.toFixed(2)}</span>
            <span style={{ color: outOfStock ? '#f44336' : '#4caf50', fontSize: '0.78rem' }}>
              {outOfStock ? 'Out of Stock' : `Stock: ${book.stock}`}
            </span>
          </div>
        </div>
      </div>

      {/* Cart controls — sibling div, no Link interference */}
      {user?.role !== 'Admin' && (
        <div style={styles.cartArea}>
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              style={{ ...styles.addBtn, opacity: outOfStock ? 0.45 : 1, cursor: outOfStock ? 'not-allowed' : 'pointer' }}
            >
              🛒 Add to Cart
            </button>
          ) : (
            <div style={styles.qtyRow}>
              <button onClick={() => handleChange(qty - 1)} style={styles.qtyBtn}>−</button>
              <span style={styles.qtyBadge}>🛒 {qty} in cart</span>
              <button
                onClick={() => handleChange(qty + 1)}
                disabled={qty >= book.stock}
                style={{ ...styles.qtyBtn, opacity: qty >= book.stock ? 0.4 : 1, cursor: qty >= book.stock ? 'not-allowed' : 'pointer' }}
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  clickable: { display: 'flex', flexDirection: 'column', cursor: 'pointer', flex: 1, color: 'inherit' },
  img: { width: '100%', height: '200px', objectFit: 'cover' },
  body: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  title: { margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1a1a2e' },
  author: { margin: 0, fontSize: '0.85rem', color: '#666' },
  category: { margin: 0, fontSize: '0.75rem', background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '12px', alignSelf: 'flex-start' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  price: { fontWeight: 'bold', color: '#e94560', fontSize: '1.1rem' },
  cartArea: { padding: '0 12px 12px' },
  addBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', width: '100%', fontSize: '0.88rem' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  qtyBtn: { background: '#f0f0f0', border: '1px solid #ddd', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  qtyBadge: { flex: 1, textAlign: 'center', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', padding: '5px 6px', fontSize: '0.8rem', fontWeight: '600' },
};
