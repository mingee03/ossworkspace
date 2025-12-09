import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 🟢 [변경] 이제 단순한 Table이 아니라, 모든 로직을 담고 있는 'Page'를 불러옵니다.
// (EventPage.js가 src 폴더 바로 아래에 있다고 가정합니다.)
import EventPage from './EventPage'; 

// 상세 페이지는 기존 위치 그대로 유지 (혹시 파일 위치를 옮기셨다면 경로 수정 필요)
import EventDetail from './components/EventDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1 style={{ textAlign: 'center', marginTop: '30px', color: '#2c3e50' }}>
          🏛️ 공공데이터 조회 시스템
        </h1>
        <hr style={{ width: '80%', margin: '20px auto', border: '0', borderTop: '1px solid #eee' }} />
        
        <Routes>
          {/* 🟢 [변경] 목록 페이지에 EventTable 대신 EventPage를 연결합니다 */}
          <Route path="/" element={<EventPage />} />
          
          {/* 상세 페이지 */}
          <Route path="/detail" element={<EventDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;