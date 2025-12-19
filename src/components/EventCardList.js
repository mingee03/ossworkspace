import React from 'react';

const EventCardList = ({ items, loading, onRowClick, bookmarks = [], onToggleBookmark }) => {
  
  // 고유 키 생성기
  const getEventKey = (item) => `${item.eventNm}-${item.eventStartDate}-${item.opar}`;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#007bff' }}>데이터 로딩 중... ⏳</div>;
  }

  if (items.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#777', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>데이터가 없습니다.</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
      {items.map((item, index) => {
        // 현재 아이템이 찜 목록에 있는지 확인
        const isFav = bookmarks.some(b => getEventKey(b) === getEventKey(item));

        return (
          <div 
            key={index} 
            onClick={() => onRowClick(item)}
            style={{
              border: '1px solid #eee',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              position: 'relative' // 별표 위치 잡기 위해 필요
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* ⭐ 찜하기 버튼 (카드 우측 상단) */}
            <div 
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭(상세이동) 방지
                onToggleBookmark(item);
              }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 10,
                color: isFav ? '#ffc107' : '#e0e0e0', // 찜하면 노란색, 아니면 회색
                transition: 'color 0.2s'
              }}
            >
              {isFav ? '★' : '☆'}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ 
                backgroundColor: '#e3f2fd', color: '#0d47a1', 
                fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' 
              }}>
                {item.eventStartDate} ~ {item.eventEndDate}
              </span>
            </div>
            
            <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#333', paddingRight: '30px' }}>
              {item.eventNm}
            </h3>
            
            <div style={{ color: '#666', fontSize: '14px' }}>
              📍 {item.opar}
            </div>
            <div style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
              📞 {item.phoneNumber || '번호없음'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventCardList;