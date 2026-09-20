import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, deleteBook } from '../../store/slices/booksSlice';
import BookForm from './BookForm';
import AdminOrders from './AdminOrders';
import Pagination from '../../components/Pagination';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { items, totalCount, pageSize, loading } = useSelector((s) => s.books);
  const allOrders = useSelector((s) => s.orders.allOrders);
  const [activeTab, setActiveTab] = useState('books');
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeTab === 'books') {
      dispatch(fetchBooks({ page: currentPage, pageSize, ...(search && { title: search }) }));
    }
  }, [dispatch, activeTab, currentPage, pageSize, search]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this book?')) dispatch(deleteBook(id));
  };
  const handleEdit = (book) => { setEditBook(book); setShowForm(true); };
  const handleAdd = () => { setEditBook(null); setShowForm(true); };
  const handleClose = () => { setShowForm(false); setEditBook(null); };

  const pendingCount = allOrders.filter(o => o.status === 'Pending').length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>⚙️ Admin Dashboard</h2>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('books')}
          style={{ ...styles.tab, ...(activeTab === 'books' ? styles.tabActive : {}) }}
        >
          📚 Books
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.tabActive : {}) }}
        >
          📦 Orders
          {pendingCount > 0 && <span style={styles.pendingBadge}>{pendingCount}</span>}
        </button>
      </div>

      {/* Books Tab */}
      {activeTab === 'books' && (
        <>
          <div style={styles.toolbar}>
            <input
              placeholder="Search books..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={styles.search}
            />
            <div style={styles.toolbarRight}>
              <span style={styles.count}>{totalCount} books total</span>
              <button onClick={handleAdd} style={styles.addBtn}>+ Add Book</button>
            </div>
          </div>
          {loading ? <p style={styles.msg}>Loading...</p> : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Cover</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Author</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((book) => (
                    <tr key={book.id} style={styles.tr}>
                      <td style={styles.td}>
                        <img
                          src={book.coverImage || 'https://via.placeholder.com/40x55'}
                          alt=""
                          style={styles.thumb}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40x55'; }}
                        />
                      </td>
                      <td style={styles.td}>{book.title}</td>
                      <td style={styles.td}>{book.author}</td>
                      <td style={styles.td}><span style={styles.catBadge}>{book.category}</span></td>
                      <td style={styles.td}>₹{book.price.toFixed(2)}</td>
                      <td style={styles.td}>
                        <span style={{ color: book.stock > 0 ? '#2e7d32' : '#c62828', fontWeight: '600' }}>{book.stock}</span>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleEdit(book)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(book.id)} style={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={currentPage} pageSize={pageSize} totalCount={totalCount} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && <AdminOrders />}

      {showForm && <BookForm book={editBook} onClose={handleClose} />}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1150px', margin: '24px auto', padding: '0 24px' },
  header: { marginBottom: '20px' },
  heading: { margin: 0, color: '#1a1a2e', fontSize: '1.5rem' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #eee', paddingBottom: '0' },
  tab: { padding: '10px 24px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.95rem', color: '#666', borderBottom: '3px solid transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  tabActive: { color: '#1a1a2e', borderBottomColor: '#e94560', fontWeight: '600' },
  pendingBadge: { background: '#e94560', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.75rem' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  search: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', width: '280px', fontSize: '0.9rem' },
  count: { color: '#666', fontSize: '0.9rem' },
  addBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  msg: { textAlign: 'center', padding: '40px', color: '#999' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  thead: { background: '#1a1a2e', color: '#fff' },
  th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '0.9rem', verticalAlign: 'middle' },
  thumb: { width: '40px', height: '55px', objectFit: 'cover', borderRadius: '3px' },
  catBadge: { background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' },
  editBtn: { background: '#1565c0', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem' },
  deleteBtn: { background: '#c62828', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
};
