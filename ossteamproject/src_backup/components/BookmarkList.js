import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventTable from './EventTable';

const BookmarkList = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);

  // 1. 저장된 목록 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cultureZip_bookmarks')) || [];
    setBookmarks(saved);
  }, []);

  // 2. 삭제 기능 (여기서는 클릭하면 찜 취소 = 삭제)
  const handleToggle = (item) => {
    // 고유 키 생성
    const getEventKey = (i) => `${i.eventNm}-${i.eventStartDate}-${i.opar}`;
    const targetKey = getEventKey(item);

    // 삭제 로직
    const newBookmarks = bookmarks.filter(b => getEventKey(b) !== targetKey);
    setBookmarks(newBookmarks);
    localStorage.setItem('cultureZip_bookmarks', JSON.stringify(newBookmarks));
    
    // alert("삭제되었습니다."); // 너무 자주 뜨면 귀찮으니 주석 처리 가능
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#333' }}>⭐ 나만의 찜 목록</h2>
        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🏠 메인으로 돌아가기
        </button>
      </div>

      <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
        총 <strong>{bookmarks.length}</strong>개의 관심 행사가 있습니다.
      </div>

      <EventTable 
        items={bookmarks}        // 보여줄 데이터: 찜 목록
        bookmarks={bookmarks}    // 별표 상태 확인용: 찜 목록 (전부 노란 별로 뜸)
        onRowClick={(item) => navigate('/detail', { state: { event: item } })}
        onToggleBookmark={handleToggle} // 별 클릭 시 삭제됨
      />

      {bookmarks.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
          <p>아직 찜한 행사가 없습니다.</p>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
          >
            행사 찾아보기
          </button>
        </div>
      )}
    </div>
  );
};

export default BookmarkList;