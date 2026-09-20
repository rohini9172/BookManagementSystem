import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/ordersSlice';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_META = {
  Pending:    { bg: '#fff8e1', color: '#f57f17', icon: '🕐' },
  Processing: { bg: '#e3f2fd', color: '#1565c0', icon: '⚙️' },
  Shipped:    { bg: '#f3e5f5', color: '#6a1b9a', icon: '🚚' },
  Delivered:  { bg: '#e8f5e9', color: '#2e7d32', icon: '✅' },
  Cancelled:  { bg: '#ffebee', color: '#c62828', icon: '✕'  },
};

const NEXT_ACTIONS = {
  Pending:    [{ label: '⚙️ Mark Processing', status: 'Processing', color: '#1565c0' }, { label: '✕ Cancel', status: 'Cancelled', color: '#c62828' }],
  Processing: [{ label: '🚚 Mark Shipped',    status: 'Shipped',    color: '#6a1b9a' }, { label: '✕ Cancel', status: 'Cancelled', color: '#c62828' }],
  Shipped:    [{ label: '✅ Mark Delivered',  status: 'Delivered',  color: '#2e7d32' }],
  Delivered:  [],
  Cancelled:  [],
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { allOrders, adminLoading, error } = useSelector((s) => s.orders);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    dispatch(fetchAllOrders(filter === 'All' ? null : filter));
  }, [dispatch, filter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (e, orderId, status) => {
    // Always stop — button is outside the toggle row but be safe
    e.stopPropagation();
    setUpdating(orderId);
    const result = await dispatch(updateOrderStatus({ id: orderId, status }));
    setUpdating(null);
    if (!result.error) load();
  };

  const countByStatus = allOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={s.container}>
      <div style={s.topBar}>
        <h3 style={s.heading}>📦 Order Management</h3>
        <button onClick={load} style={s.refreshBtn} disabled={adminLoading}>
          {adminLoading ? '⟳ Loading...' : '⟳ Refresh'}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={s.tabs}>
        {STATUSES.map((st) => {
          const count = st === 'All' ? allOrders.length : (countByStatus[st] || 0);
          const meta  = STATUS_META[st];
          const isActive = filter === st;
          return (
            <button key={st} onClick={() => setFilter(st)}
              style={{ ...s.tab, ...(isActive ? s.tabActive : {}) }}>
              {meta?.icon ?? '📋'} {st}
              <span style={{
                ...s.tabCount,
                background: isActive ? 'rgba(255,255,255,0.25)' : (st === 'Pending' && count > 0 ? '#e94560' : '#eee'),
                color:      isActive ? '#fff'                    : (st === 'Pending' && count > 0 ? '#fff'    : '#666'),
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p style={s.error}>{error}</p>}

      {adminLoading ? (
        <div style={s.center}>Loading orders...</div>
      ) : allOrders.length === 0 ? (
        <div style={s.center}>No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}orders found.</div>
      ) : (
        <div style={s.list}>
          {allOrders.map((order) => {
            const meta      = STATUS_META[order.status] || STATUS_META.Pending;
            const actions   = NEXT_ACTIONS[order.status] || [];
            const isExp     = expanded === order.id;
            const isUpdating = updating === order.id;

            return (
              <div key={order.id} style={s.card}>

                {/* ── Clickable info row ── */}
                <div style={s.infoRow} onClick={() => setExpanded(isExp ? null : order.id)}>
                  <div style={s.cell}>
                    <span style={s.orderId}>#{order.id}</span>
                    <span style={s.meta}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={s.cell}>
                    <span style={s.customerName}>{order.userName}</span>
                    <span style={s.meta}>{order.userEmail}</span>
                  </div>
                  <div style={s.cell}>
                    <span style={{ ...s.statusBadge, background: meta.bg, color: meta.color }}>
                      {meta.icon} {order.status}
                    </span>
                  </div>
                  <div style={{ ...s.cell, alignItems: 'flex-end' }}>
                    <span style={s.amount}>₹{order.totalAmount.toFixed(2)}</span>
                    <span style={s.meta}>{order.items?.length ?? 0} item(s)</span>
                  </div>
                  <span style={s.chevron}>{isExp ? '▲' : '▼'}</span>
                </div>

                {/* ── Action buttons row — completely separate from toggle row ── */}
                {actions.length > 0 && (
                  <div style={s.actionsRow}>
                    <span style={s.actionsLabel}>Update status:</span>
                    {actions.map((a) => (
                      <button
                        key={a.status}
                        disabled={isUpdating}
                        onClick={(e) => handleStatusChange(e, order.id, a.status)}
                        style={{
                          ...s.actionBtn,
                          background: a.color + '15',
                          color: a.color,
                          border: `1px solid ${a.color}50`,
                          opacity: isUpdating ? 0.5 : 1,
                          cursor: isUpdating ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isUpdating ? '...' : a.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Expanded details ── */}
                {isExp && (
                  <div style={s.details}>
                    <div style={s.detailGrid}>
                      <div>
                        <p style={s.detailLabel}>Shipping Address</p>
                        <p style={s.detailValue}>📍 {order.shippingAddress}</p>
                      </div>
                      <div>
                        <p style={s.detailLabel}>Order Date</p>
                        <p style={s.detailValue}>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div style={s.itemsTable}>
                      <div style={s.itemsHead}>
                        <span>Book</span><span>Qty</span><span>Subtotal</span>
                      </div>
                      {order.items.map((item) => (
                        <div key={item.id} style={s.itemRow}>
                          <div style={s.itemBook}>
                            <img
                              src={item.coverImage || 'https://via.placeholder.com/36x50'}
                              alt={item.bookTitle}
                              style={s.itemImg}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/36x50'; }}
                            />
                            <div>
                              <p style={s.itemTitle}>{item.bookTitle}</p>
                              <p style={s.itemPrice}>₹{item.price.toFixed(2)} each</p>
                            </div>
                          </div>
                          <span style={s.itemQty}>× {item.quantity}</span>
                          <span style={s.itemSubtotal}>₹{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                      <div style={s.itemsFoot}>
                        <span>Order Total</span>
                        <span style={{ color: '#e94560', fontWeight: '700' }}>₹{order.totalAmount.toFixed(2)}</span>
                      </div>
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

const s = {
  container: { padding: 0 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  heading: { margin: 0, color: '#1a1a2e', fontSize: '1.1rem' },
  refreshBtn: { background: '#f0f0f0', border: '1px solid #ddd', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '7px 14px', border: '1px solid #ddd', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' },
  tabCount: { borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '700' },
  error: { color: '#c62828', background: '#ffebee', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  center: { textAlign: 'center', padding: '40px', color: '#999' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  card: { background: '#fff', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0', overflow: 'hidden' },

  // Info row — the only clickable part for expand/collapse
  infoRow: { display: 'flex', alignItems: 'center', padding: '14px 18px', gap: '12px', cursor: 'pointer', userSelect: 'none' },
  cell: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: '100px' },
  orderId: { fontWeight: '700', fontSize: '0.95rem', color: '#1a1a2e' },
  meta: { fontSize: '0.75rem', color: '#aaa' },
  customerName: { fontWeight: '600', fontSize: '0.88rem', color: '#333' },
  statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700', alignSelf: 'flex-start', whiteSpace: 'nowrap' },
  amount: { fontWeight: '700', color: '#e94560', fontSize: '0.95rem' },
  chevron: { color: '#ccc', fontSize: '0.75rem', flexShrink: 0 },

  // Action buttons — own row, NOT inside the clickable infoRow
  actionsRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px 10px', borderTop: '1px solid #f5f5f5', background: '#fafafa', flexWrap: 'wrap' },
  actionsLabel: { fontSize: '0.78rem', color: '#aaa', marginRight: '4px' },
  actionBtn: { padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap', transition: 'opacity 0.15s' },

  // Expanded details
  details: { padding: '16px 18px 18px', borderTop: '2px solid #f0f0f0', background: '#fafafa' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  detailLabel: { margin: '0 0 4px', fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { margin: 0, fontSize: '0.88rem', color: '#444' },
  itemsTable: { background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' },
  itemsHead: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', padding: '8px 14px', background: '#f5f5f5', fontSize: '0.75rem', color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  itemRow: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', padding: '10px 14px', alignItems: 'center', borderTop: '1px solid #f0f0f0' },
  itemBook: { display: 'flex', alignItems: 'center', gap: '10px' },
  itemImg: { width: '32px', height: '44px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 },
  itemTitle: { margin: 0, fontSize: '0.85rem', color: '#333', fontWeight: '500' },
  itemPrice: { margin: 0, fontSize: '0.75rem', color: '#aaa' },
  itemQty: { color: '#666', fontSize: '0.85rem', textAlign: 'center' },
  itemSubtotal: { fontWeight: '700', color: '#1a1a2e', fontSize: '0.88rem', textAlign: 'right' },
  itemsFoot: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: '2px solid #eee', fontSize: '0.9rem', fontWeight: '600' },
};
