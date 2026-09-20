import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookById, clearSelected } from '../store/slices/booksSlice';
import { addToCart, updateCartItem } from '../store/slices/cartSlice';

export default function BookDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: book, loading, error } = useSelector((s) => s.books);
  const { user } = useSelector((s) => s.auth);
  const cartItem = useSelector((s) => s.cart.items.find((i) => i.bookId === parseInt(id)));
  const qty = cartItem?.quantity ?? 0;

  useEffect(() => {
    dispatch(fetchBookById(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  if (loading) return <p style={styles.msg}>Loading...</p>;
  if (error)   return <p style={{ ...styles.msg, color: 'red' }}>{error}</p>;
  if (!book)   return null;

  const outOfStock = book.stock === 0;

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    dispatch(addToCart({ bookId: book.id, quantity: 1 }));
  };

  const handleIncrease = () => dispatch(updateCartItem({ bookId: book.id, quantity: qty + 1 }));
  const handleDecrease = () => dispatch(updateCartItem({ bookId: book.id, quantity: qty - 1 }));

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
      <div style={styles.card}>
        <img
          src={book.coverImage || 'https://via.placeholder.com/250x350?text=No+Cover'}
          alt={book.title}
          style={styles.img}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/250x350?text=No+Cover'; }}
        />
        <div style={styles.info}>
          <span style={styles.category}>{book.category}</span>
          <h1 style={styles.title}>{book.title}</h1>
          <p style={styles.author}>by {book.author}</p>
          <p style={styles.isbn}>ISBN: {book.isbn}</p>
          <p style={styles.desc}>{book.description}</p>

          <div style={styles.priceRow}>
            <span style={styles.price}>₹{book.price.toFixed(2)}</span>
            <span style={{ color: outOfStock ? '#f44336' : '#4caf50' }}>
              {outOfStock ? '✗ Out of Stock' : `✓ In Stock (${book.stock} available)`}
            </span>
          </div>

          {user?.role !== 'Admin' && (
            <div style={styles.cartSection}>
              {qty === 0 ? (
                <button
                  onClick={handleAdd}
                  disabled={outOfStock}
                  style={{ ...styles.addBtn, opacity: outOfStock ? 0.5 : 1 }}
                >
                  🛒 Add to Cart
                </button>
              ) : (
                <div style={styles.inCartBox}>
                  <div style={styles.inCartLabel}>
                    <span style={styles.inCartText}>✓ Added to Cart</span>
                    <button onClick={() => navigate('/cart')} style={styles.viewCartBtn}>
                      View Cart →
                    </button>
                  </div>
                  <div style={styles.qtyRow}>
                    <button onClick={handleDecrease} style={styles.qtyBtn}>−</button>
                    <span style={styles.qtyDisplay}>{qty}</span>
                    <button
                      onClick={handleIncrease}
                      disabled={qty >= book.stock}
                      style={{ ...styles.qtyBtn, opacity: qty >= book.stock ? 0.4 : 1 }}
                    >
                      +
                    </button>
                    <span style={styles.qtyTotal}>
                      = ₹{(book.price * qty).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '24px auto', padding: '0 24px' },
  msg: { textAlign: 'center', marginTop: '40px' },
  back: { background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px' },
  card: { display: 'flex', gap: '32px', background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  img: { width: '250px', height: '350px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  category: { background: '#e3f2fd', color: '#1565c0', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', alignSelf: 'flex-start' },
  title: { margin: 0, fontSize: '1.8rem', color: '#1a1a2e' },
  author: { margin: 0, color: '#666', fontSize: '1.1rem' },
  isbn: { margin: 0, color: '#999', fontSize: '0.85rem' },
  desc: { margin: 0, color: '#444', lineHeight: 1.6 },
  priceRow: { display: 'flex', alignItems: 'center', gap: '24px' },
  price: { fontSize: '2rem', fontWeight: 'bold', color: '#e94560' },
  cartSection: { marginTop: '4px' },
  addBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', width: '100%' },
  inCartBox: { background: '#f0faf0', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  inCartLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  inCartText: { color: '#2e7d32', fontWeight: '600', fontSize: '0.95rem' },
  viewCartBtn: { background: 'none', border: 'none', color: '#1565c0', cursor: 'pointer', fontSize: '0.88rem', textDecoration: 'underline', padding: 0 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  qtyBtn: { background: '#fff', border: '1px solid #ccc', width: '34px', height: '34px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyDisplay: { fontSize: '1.2rem', fontWeight: '700', minWidth: '32px', textAlign: 'center', color: '#1a1a2e' },
  qtyTotal: { marginLeft: '8px', color: '#e94560', fontWeight: '700', fontSize: '1rem' },
};
