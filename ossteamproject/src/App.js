import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import EventPage from './EventPage';
import EventDetail from './components/EventDetail';
import BookmarkList from './components/BookmarkList'; // 🟢 추가

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* 상단 네비게이션 바 (선택 사항) */}
        <nav style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'center', gap: '20px' }}>
           <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>🏠 행사 찾기</Link>
           <Link to="/bookmarks" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>⭐ 찜 목록</Link>
        </nav>

        <h1 style={{ textAlign: 'center', marginTop: '30px', color: '#2c3e50' }}>
          🏛️ 전국 행사 검색 포털
        </h1>
        <hr style={{ width: '80%', margin: '20px auto', border: '0', borderTop: '1px solid #eee' }} />
        
        <Routes>
          <Route path="/" element={<EventPage />} />
          <Route path="/detail" element={<EventDetail />} />
          <Route path="/bookmarks" element={<BookmarkList />} /> {/* 🟢 경로 추가 */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;