import React from 'react';

const SearchBar = ({ 
  // 🟢 [변경] 검색어가 두 개로 나뉩니다.
  eventName, setEventName, 
  orgName, setOrgName,
  
  startDate, setStartDate, 
  endDate, setEndDate,     
  onSearch, mode, onSwitchMode, disabled 
}) => {
  // 스타일 정의
  const inputStyle = { padding: '12px', width: '200px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '4px' };
  const dateStyle = { padding: '12px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' };
  const btnStyle = { padding: '12px 24px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

  // 엔터키 쳤을 때 검색 실행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 상태 메시지 */}
      <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>
        {mode === 'API' && <span style={{ color: '#d9534f' }}>⚠️ [기본 모드] 정확한 명칭을 입력해야 검색됩니다.</span>}
        {mode === 'SMART' && <span style={{ color: '#28a745' }}>✅ [스마트 모드] 부분 검색 & 날짜 검색 가능</span>}
      </div>

      {/* 검색 입력 영역 (FlexBox로 정렬) */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        
        {/* 1. 날짜 선택기 (스마트 모드일 때만 보임) */}
        {mode === 'SMART' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f8f9fa', padding: '5px', borderRadius: '4px', border: '1px solid #eee' }}>
            <span style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>기간:</span>
            <input type="date" style={dateStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span>~</span>
            <input type="date" style={dateStyle} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        )}

        {/* 🟢 2. 행사명 입력창 */}
        <input 
          type="text" 
          placeholder="행사명 (예: 축제)"
          style={inputStyle}
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />

        {/* 🟢 3. 기관/장소명 입력창 */}
        <input 
          type="text" 
          placeholder="기관/장소 (예: 예술의전당)"
          style={inputStyle}
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        
        <button style={btnStyle} onClick={onSearch} disabled={disabled}>검색</button>
        
        {mode === 'API' && (
          <button style={{ ...btnStyle, backgroundColor: '#28a745' }} onClick={onSwitchMode}>
            ⚡ 스마트전환
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;