export default function Pagination({ page, pageSize, totalCount, onPageChange }) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div style={styles.container}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={styles.btn}>← Prev</button>
      <span style={styles.info}>Page {page} of {totalPages} ({totalCount} books)</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={styles.btn}>Next →</button>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' },
  btn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  info: { color: '#666', fontSize: '0.9rem' },
};
