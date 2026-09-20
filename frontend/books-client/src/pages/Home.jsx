import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '../store/slices/booksSlice';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';

const CATEGORIES = ['', 'Programming', 'Fiction', 'History', 'Self-Help', 'Business'];

export default function Home() {
  const dispatch = useDispatch();
  const { items, totalCount, page, pageSize, loading, error } = useSelector((s) => s.books);
  const [filters, setFilters] = useState({ title: '', author: '', isbn: '', category: '', minPrice: '', maxPrice: '', inStock: false });
  const [currentPage, setCurrentPage] = useState(1);

  const loadBooks = useCallback(() => {
    const params = { page: currentPage, pageSize };
    if (filters.title) params.title = filters.title;
    if (filters.author) params.author = filters.author;
    if (filters.isbn) params.isbn = filters.isbn;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.inStock) params.inStock = true;
    dispatch(fetchBooks(params));
  }, [dispatch, currentPage, pageSize, filters]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setCurrentPage(1);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={styles.filterTitle}>🔍 Search & Filter</h3>
        {['title', 'author', 'isbn'].map((field) => (
          <input key={field} name={field} placeholder={`Search by ${field}`} value={filters[field]}
            onChange={handleFilterChange} style={styles.input} />
        ))}
        <select name="category" value={filters.category} onChange={handleFilterChange} style={styles.input}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
        <div style={styles.priceRow}>
          <input name="minPrice" type="number" placeholder="Min ₹" value={filters.minPrice} onChange={handleFilterChange} style={{ ...styles.input, width: '48%' }} />
          <input name="maxPrice" type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={handleFilterChange} style={{ ...styles.input, width: '48%' }} />
        </div>
        <label style={styles.checkLabel}>
          <input type="checkbox" name="inStock" checked={filters.inStock} onChange={handleFilterChange} />
          In Stock Only
        </label>
        <button onClick={() => { setFilters({ title: '', author: '', isbn: '', category: '', minPrice: '', maxPrice: '', inStock: false }); setCurrentPage(1); }} style={styles.clearBtn}>
          Clear Filters
        </button>
      </div>
      <div style={styles.main}>
        <h2 style={styles.heading}>📚 All Books <span style={styles.count}>({totalCount})</span></h2>
        {loading && <p>Loading books...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={styles.grid}>
          {items.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
        {!loading && items.length === 0 && <p style={styles.empty}>No books found.</p>}
        <Pagination page={currentPage} pageSize={pageSize} totalCount={totalCount} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: '24px', padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  sidebar: { width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  filterTitle: { margin: '0 0 8px', color: '#1a1a2e' },
  input: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  priceRow: { display: 'flex', gap: '4%' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' },
  clearBtn: { background: '#f5f5f5', border: '1px solid #ddd', padding: '8px', borderRadius: '4px', cursor: 'pointer' },
  main: { flex: 1 },
  heading: { margin: '0 0 16px', color: '#1a1a2e' },
  count: { color: '#999', fontSize: '1rem', fontWeight: 'normal' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  empty: { textAlign: 'center', color: '#999', marginTop: '40px' },
};
