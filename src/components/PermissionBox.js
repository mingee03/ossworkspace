import React from 'react';

const PermissionBox = ({ onConfirm, onDeny }) => {
  const boxStyle = {
    backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px',
    padding: '30px', textAlign: 'center', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };
  const btnStyle = { padding: '12px 24px', fontSize: '16px', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: '0 10px', color: 'white' };

  return (
    <div style={boxStyle}>
      <h4>⚡ 더 빠르고 편리한 검색을 원하시나요?</h4>
      <p style={{ color: '#666', margin: '15px 0' }}>
        전체 데이터를 다운로드하면 <strong>스마트 검색</strong>(유사어, 지역명)이 가능합니다.<br/>
        <small>(거절 시 정확한 행사명으로만 검색됩니다.)</small>
      </p>
      <button style={{ ...btnStyle, backgroundColor: '#28a745' }} onClick={onConfirm}>네, 다운로드 (추천)</button>
      <button style={{ ...btnStyle, backgroundColor: '#6c757d' }} onClick={onDeny}>아니요</button>
    </div>
  );
};

export default PermissionBox;