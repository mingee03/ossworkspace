import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 0) return null;

  const btnStyle = { padding: '8px 16px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
      <button 
        style={{ ...btnStyle, opacity: currentPage === 1 ? 0.5 : 1 }} 
        onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
      >◀ 이전</button>
      
      <span style={{ fontWeight: 'bold', color: '#555' }}>{currentPage} / {totalPages} 페이지</span>
      
      <button 
        style={{ ...btnStyle, opacity: currentPage === totalPages ? 0.5 : 1 }} 
        onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
      >다음 ▶</button>
    </div>
  );
};

export default Pagination;