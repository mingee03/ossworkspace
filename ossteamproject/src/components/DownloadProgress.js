import React from 'react';

const DownloadProgress = ({ progress, message }) => {
  return (
    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', color: '#007bff' }}>데이터 수집 중... 잠시만 기다려주세요.</p>
      <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '5px', height: '10px', marginBottom: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#007bff', transition: 'width 0.3s ease' }}></div>
      </div>
      <span style={{ fontSize: '12px' }}>{message} ({progress}%)</span>
    </div>
  );
};

export default DownloadProgress;