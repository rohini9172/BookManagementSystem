import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../store/slices/ordersSlice';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_META = {
  Pending:    { bg: '#fff8e1', color: '#f57f17', icon: '🕐' },
  Processing: { bg: '#e3f2fd', color: '#1565c0', icon: '⚙️' },
  Shipped:    { bg: '#f3e5f5', color: '#6a1b9a', icon: '🚚' },
  Delivered:  { bg: '#e8f5e9', color: '#2e7d32', icon: '✅' },
  Cancelled:  { bg: '#ffebee', color: '#c62828', icon: '✕'  },
};

const POLL_INTERVAL = 30_000;

function StatusTimeline({ status }) {
  if (status === 'Cancelled') {
    return (
      <div style={tl.cancelBox}>
        <span style={{ fontSize: '1.1rem' }}>✕</span>
        <span style={tl.cancelText}>Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div style={tl.root}>
      {STATUS_STEPS.map((step, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        const future = idx > currentIdx;

        return (
          <div key={step} style={tl.stepCol}>
            {/* Circle + connector row */}
            <div style={tl.circleRow}>
              {/* Left connector */}
              <div style={{
                ...tl.connector,
                background: idx === 0 ? 'transparent' : (done || active ? '#1a1a2e' : '#e0e0e0'),
              }} />

              {/* Circle */}
              <div style={{
                ...tl.circle,
                background: done ? '#1a1a2e' : active ? '#e94560' : '#e0e0e0',
                boxShadow: active ? '0 0 0 5px #e9456025' : 'none',
                transform: active ? 'scale(1.18)' : 'scale(1)',
                zIndex: 1,
              }}>
                <span style={{ fontSize: done ? '0.75rem' : '0.9rem' }}>
                  {done ? '✓' : STATUS_META[step].icon}
                </span>
              </div>

              {/* Right connector */}
              <div style={{
                ...tl.connector,
                background: idx === STATUS_STEPS.length - 1 ? 'transparent' : (done ? '#1a1a2e' : '#e0e0e0'),
              }} />
            </div>

            {/* Label */}
            <span style={{
              ...tl.label,
              color: future ? '#bbb' : active ? '#e94560' : '#1a1a2e',
              fontWeight: active ? '700' : '400',
            }}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const dispatch = useDispatch();
  const { userOrders: orders, loading, error } = useSelector((s) => s.orders);
  const [expanded, setExpanded] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const refresh = useCallback(() => {
    dispatch(fetchUserOrders());
    setLastRefreshed(new Date());
  }, [dispatch]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2 style={styles.heading}>My Orders</h2>
        <div style={styles.topBarRight}>
          {lastRefreshed && (
            <span style={styles.lastRefreshed}>Updated {lastRefreshed.toLocaleTimeString()}</span>
          )}
          <button onClick={refresh} disabled={loading} style={styles.refreshBtn}>
            {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      {error && <p style={styles.errorMsg}>{error}</p>}

      {!loading && orders.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>No orders yet.</p>
          <a href="/" style={styles.shopLink}>Browse Books →</a>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map((order) => {
            const meta = STATUS_META[order.status] || STATUS_META.Pending;
            const isExpanded = expanded === order.id;

            return (
              <div key={order.id} style={styles.card}>
                <div style={styles.cardHeader} onClick={() => setExpanded(isExpanded ? null : order.id)}>
                  <div style={styles.headerLeft}>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={styles.headerRight}>
                    <span style={{ ...styles.statusBadge, background: meta.bg, color: meta.color }}>
                      {meta.icon} {order.status}
                    </span>
                    <span style={styles.amount}>₹{order.totalAmount.toFixed(2)}</span>
                    <span style={styles.chevron}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={styles.details}>
                    <StatusTimeline status={order.status} />
                    <div style={styles.divider} />
                    <div style={styles.addressRow}>
                      <span style={styles.addressLabel}>Shipping Address</span>
                      <span style={styles.addressValue}>📍 {order.shippingAddress}</span>
                    </div>
                    <div style={styles.divider} />
                    <div style={styles.itemsList}>
                      {order.items.map((item) => (
                        <div key={item.id} style={styles.itemRow}>
                          <img
                            src={item.coverImage || 'https://via.placeholder.com/40x56'}
                            alt={item.bookTitle}
                            style={styles.itemImg}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40x56'; }}
                          />
                          <div style={styles.itemInfo}>
                            <span style={styles.itemTitle}>{item.bookTitle}</span>
                            <span style={styles.itemUnit}>₹{item.price.toFixed(2)} × {item.quantity}</span>
                          </div>
                          <span style={styles.itemSubtotal}>₹{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={styles.totalRow}>
                      <span>Order Total</span>
                      <strong style={{ color: '#e94560' }}>₹{order.totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '820px', margin: '24px auto', padding: '0 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { margin: 0, color: '#1a1a2e' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  lastRefreshed: { fontSize: '0.78rem', color: '#bbb' },
  refreshBtn: { background: '#f0f0f0', border: '1px solid #ddd', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  errorMsg: { color: '#c62828', background: '#ffebee', padding: '10px', borderRadius: '6px', marginBottom: '16px' },
  emptyBox: { textAlign: 'center', marginTop: '80px' },
  emptyText: { color: '#bbb', fontSize: '1.1rem', marginBottom: '16px' },
  shopLink: { color: '#e94560', textDecoration: 'none', fontWeight: '600' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #f0f0f0' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  orderId: { fontWeight: '700', fontSize: '1rem', color: '#1a1a2e' },
  orderDate: { color: '#bbb', fontSize: '0.85rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap' },
  amount: { fontWeight: '700', color: '#e94560', fontSize: '1rem' },
  chevron: { color: '#ccc', fontSize: '0.8rem' },
  details: { padding: '20px', borderTop: '1px solid #f5f5f5' },
  divider: { borderTop: '1px solid #f0f0f0', margin: '16px 0' },
  addressRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  addressLabel: { fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' },
  addressValue: { fontSize: '0.9rem', color: '#444' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  itemImg: { width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  itemTitle: { fontSize: '0.9rem', color: '#333', fontWeight: '500' },
  itemUnit: { fontSize: '0.78rem', color: '#aaa' },
  itemSubtotal: { fontWeight: '700', color: '#1a1a2e', fontSize: '0.9rem' },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #f0f0f0', fontSize: '1rem' },
};

// Timeline styles — fixed layout: each step column has equal width,
// connectors are flex-grow lines that sit between circles
const tl = {
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    margin: '8px 0 4px',
  },
  stepCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  circleRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  connector: {
    flex: 1,
    height: '3px',
    borderRadius: '2px',
    transition: 'background 0.3s',
  },
  circle: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s',
  },
  label: {
    fontSize: '0.72rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    transition: 'color 0.3s',
  },
  cancelBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffebee',
    padding: '10px 16px',
    borderRadius: '8px',
    color: '#c62828',
    fontWeight: '600',
    fontSize: '0.9rem',
    margin: '8px 0',
  },
  cancelText: { color: '#c62828', fontWeight: '600' },
};
