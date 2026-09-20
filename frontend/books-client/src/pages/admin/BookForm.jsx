import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBook, updateBook } from '../../store/slices/booksSlice';

const EMPTY = { title: '', author: '', isbn: '', category: '', description: '', price: '', stock: '', coverImage: '' };
const CATEGORIES = ['Programming', 'Fiction', 'History', 'Self-Help', 'Business'];

export default function BookForm({ book, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(book ? { ...book, price: book.price.toString(), stock: book.stock.toString() } : EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parseFloat(form.price) <= 0) { setError('Price must be greater than 0.'); return; }
    setLoading(true);
    const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    try {
      if (book) await dispatch(updateBook({ id: book.id, data })).unwrap();
      else await dispatch(createBook(data)).unwrap();
      onClose();
    } catch (err) {
      setError(err || 'Failed to save book.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, placeholder, type = 'text', extra = {}) => (
    <input
      name={name} type={type} placeholder={placeholder} value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      required style={styles.input} {...extra}
    />
  );

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.modal}>
        <h3 style={styles.title}>{book ? 'Edit Book' : 'Add New Book'}</h3>
        {error && <p style={styles.error}>{error}</p>}
        {field('title', 'Title')}
        {field('author', 'Author')}
        {field('isbn', 'ISBN')}
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={styles.input}>
          <option value="">Select Category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={styles.textarea} />
        <div style={styles.row}>
          {field('price', 'Price', 'number', { min: '0.01', step: '0.01' })}
          {field('stock', 'Stock', 'number', { min: '0' })}
        </div>
        {field('coverImage', 'Cover Image URL')}
        <div style={styles.actions}>
          <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? 'Saving...' : 'Save Book'}</button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: '32px', borderRadius: '12px', width: '480px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  title: { margin: 0, color: '#1a1a2e' },
  error: { color: '#e94560', background: '#ffeef0', padding: '8px', borderRadius: '4px', margin: 0, fontSize: '0.9rem' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' },
  row: { display: 'flex', gap: '12px' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { background: '#f5f5f5', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
  saveBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
};
