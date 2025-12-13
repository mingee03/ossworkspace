import React from 'react';

const EventTable = ({ items, loading, onRowClick }) => {
  const thStyle = { backgroundColor: '#4a90e2', color: 'white', padding: '12px', border: '1px solid #ddd', textAlign: 'center', whiteSpace: 'nowrap' };
  const tdStyle = { border: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', color: '#555', cursor: 'pointer' };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#007bff' }}>데이터 로딩 중... ⏳</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <thead>
        <tr>
          {['행사명', '장소', '기간', '주소', '문의처'].map(head => (
            <th key={head} style={thStyle}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? items.map((item, index) => (
          <tr key={index} onClick={() => onRowClick(item)} 
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
            <td style={tdStyle}><strong>{item.eventNm}</strong></td>
            <td style={tdStyle}>{item.opar}</td>
            <td style={{ ...tdStyle, textAlign: 'center', minWidth: '150px' }}>{item.eventStartDate}<br/>~<br/>{item.eventEndDate}</td>
            <td style={tdStyle}>{item.rdnmadr || item.lnmadr || '-'}</td>
            <td style={tdStyle}>{item.phoneNumber}</td>
          </tr>
        )) : (
          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#777' }}>검색 결과가 없습니다.</td></tr>
        )}
      </tbody>
    </table>
  );
};

export default EventTable;