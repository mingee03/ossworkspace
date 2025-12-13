import React from 'react';

const panelStyle = {
  width: '280px',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '12px',
  background: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  position: 'sticky',
  height: 'fit-content',
  top: '90px'
};

const labelStyle = { fontWeight: 'bold', marginBottom: '8px', display: 'block', color: '#333' };

const controlStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '15px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

export default function FilterPanel({
  startDate, setStartDate,
  endDate, setEndDate,
  region, setRegion,
  category, setCategory,
  onSearch
}) {
  return (
    <div style={panelStyle}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#222' }}>🔎 필터</h3>

      {/* 날짜 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>📅 날짜</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={controlStyle} />
        <span style={{ display: 'block', margin: '6px 0', textAlign: 'center' }}>~</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={controlStyle} />
      </div>

      {/* 지역 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>📍 지역</label>
        <select value={region} onChange={e => setRegion(e.target.value)} style={controlStyle}>
          <option value="">전체</option>
          <option value="서울">서울</option>
          <option value="부산">부산</option>
          <option value="대구">대구</option>
          <option value="광주">광주</option>
          <option value="대전">대전</option>
          <option value="경기">경기</option>
          <option value="인천">인천</option>
          <option value="강원">강원</option>
          <option value="전북">전북</option>
          <option value="전남">전남</option>
          <option value="경북">경북</option>
          <option value="경남">경남</option>
          <option value="제주">제주</option>
        </select>
      </div>

      {/* 카테고리 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>🎭 카테고리</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={controlStyle}>
          <option value="">전체</option>
          <option value="공연">공연</option>
          <option value="전시">전시</option>
          <option value="축제">축제</option>
          <option value="행사">행사</option>
        </select>
      </div>

      <button
        onClick={onSearch}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#ff7c02',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        적용하기
      </button>
    </div>
  );
}
