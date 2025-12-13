import React from 'react';

export default function EventCardList({ items, loading, onRowClick }) {
  if (loading)
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>로딩 중...</div>;

  if (!items.length)
    return <div style={{ padding: '40px', textAlign: 'center', color: '#777' }}>검색된 행사가 없습니다.</div>;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          onClick={() => onRowClick(item)}
          style={{
            border: '1px solid #eee',
            borderRadius: '10px',
            padding: '15px',
            cursor: 'pointer',
            background: 'white',
            transition: '0.2s',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#222' }}>
            {item.eventNm}
          </h3>
          <div style={{ color: '#777', marginBottom: '5px' }}>
            📍 {item.opar}
          </div>
          <div style={{ color: '#555', fontSize: '14px', marginBottom: '10px' }}>
            📅 {item.eventStartDate} ~ {item.eventEndDate}
          </div>

          <div style={{
            background: '#ffefd5',
            padding: '6px 10px',
            borderRadius: '6px',
            color: '#ff7c02',
            display: 'inline-block',
            fontSize: '12px'
          }}>
            상세 보기
          </div>
        </div>
      ))}
    </div>
  );
}
