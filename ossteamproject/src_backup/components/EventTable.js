import React from 'react';

const EventTable = ({ items, bookmarks = [], onRowClick, onToggleBookmark }) => {
  const thStyle = { backgroundColor: '#4a90e2', color: 'white', padding: '12px', border: '1px solid #ddd', textAlign: 'center', whiteSpace: 'nowrap' };
  const tdStyle = { border: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', color: '#555', cursor: 'pointer' };
  const starStyle = { cursor: 'pointer', fontSize: '18px', textAlign: 'center', userSelect: 'none' };

  // 고유 키 생성기
  const getEventKey = (item) => `${item.eventNm}-${item.eventStartDate}-${item.opar}`;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <thead>
        <tr>
          <th style={thStyle}>찜</th>
          {['행사명', '장소', '기간', '주소', '문의처'].map(head => (
            <th key={head} style={thStyle}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? items.map((item, index) => {
          // 이 아이템이 찜 목록에 있는지 확인
          const isFav = bookmarks.some(b => getEventKey(b) === getEventKey(item));

          return (
            <tr key={index} onClick={() => onRowClick(item)} 
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              
              {/* ⭐ 찜 버튼 (클릭 시 부모에게 알림) */}
              <td style={{ ...tdStyle, ...starStyle }} 
                  onClick={(e) => { e.stopPropagation(); onToggleBookmark(item); }}>
                {isFav ? '⭐' : '☆'}
              </td>

              <td style={tdStyle}><strong>{item.eventNm}</strong></td>
              <td style={tdStyle}>{item.opar}</td>
              <td style={{ ...tdStyle, textAlign: 'center', minWidth: '150px' }}>{item.eventStartDate}<br/>~<br/>{item.eventEndDate}</td>
              <td style={tdStyle}>{item.rdnmadr || item.lnmadr || '-'}</td>
              <td style={tdStyle}>{item.phoneNumber}</td>
            </tr>
          );
        }) : (
          <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#777' }}>데이터가 없습니다.</td></tr>
        )}
      </tbody>
    </table>
  );
};

export default EventTable;