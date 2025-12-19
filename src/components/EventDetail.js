import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EventDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 목록에서 넘겨준 데이터
  const event = location.state?.event;

  // 찜 상태 관리 State
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 🟢 [중요] 목록 페이지와 똑같은 규칙으로 고유 키를 만들어야 연동됨
  const getEventKey = (item) => `${item.eventNm}-${item.eventStartDate}-${item.opar}`;

  // 1. 초기 진입 시 찜 여부 확인
  useEffect(() => {
    if (event) {
      const savedBookmarks = JSON.parse(localStorage.getItem('cultureZip_bookmarks')) || [];
      const myKey = getEventKey(event);
      // 내 키가 저장소에 있는지 확인
      const isExist = savedBookmarks.some(b => getEventKey(b) === myKey);
      setIsBookmarked(isExist);
    }
  }, [event]);

  // 2. 찜 버튼 클릭 핸들러
  const handleToggleBookmark = () => {
    const savedBookmarks = JSON.parse(localStorage.getItem('cultureZip_bookmarks')) || [];
    const myKey = getEventKey(event);
    
    let newBookmarks;
    if (isBookmarked) {
      // 이미 찜 상태면 -> 삭제 (찜 취소)
      newBookmarks = savedBookmarks.filter(b => getEventKey(b) !== myKey);
      alert("찜 목록에서 삭제되었습니다.");
    } else {
      // 찜 안된 상태면 -> 추가
      newBookmarks = [...savedBookmarks, event];
      alert("나만의 찜 목록에 저장되었습니다! ⭐");
    }

    // 저장 및 상태 업데이트
    localStorage.setItem('cultureZip_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  // 예외 처리 (데이터 없이 접근 시)
  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>잘못된 접근입니다.</h3>
        <button onClick={() => navigate('/')}>목록으로</button>
      </div>
    );
  }

  // --- 스타일 정의 ---
  const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', backgroundColor: 'white' },
    header: { borderBottom: '2px solid #007bff', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    titleGroup: { flex: 1 },
    title: { fontSize: '24px', color: '#333', margin: '0 0 10px 0' },
    period: { color: '#666', fontSize: '16px', fontWeight: 'bold' },
    
    // 🟢 찜 버튼 스타일
    favBtn: {
      padding: '10px 20px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontWeight: 'bold',
      backgroundColor: isBookmarked ? '#ffc107' : '#f0f0f0', // 찜하면 노란색
      color: isBookmarked ? 'black' : '#555',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      marginLeft: '15px',
      whiteSpace: 'nowrap'
    },

    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '15px' },
    th: { width: '120px', backgroundColor: '#f8f9fa', padding: '12px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 'bold', color: '#555' },
    td: { padding: '12px', borderBottom: '1px solid #eee', color: '#333' },
    
    descriptionBox: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px', marginTop: '20px', lineHeight: '1.6', color: '#444' },
    
    btnContainer: { textAlign: 'center', marginTop: '40px' },
    backBtn: { padding: '12px 30px', fontSize: '16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    mapLink: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px' }
  };

  const address = event.rdnmadr || event.lnmadr || '주소 정보 없음';

  return (
    <div style={styles.container}>
      {/* 헤더 섹션 */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <h2 style={styles.title}>{event.eventNm}</h2>
          <div style={styles.period}>
            📅 {event.eventStartDate} ~ {event.eventEndDate}
          </div>
        </div>
        
        {/* 🟢 찜하기 버튼 */}
        <button style={styles.favBtn} onClick={handleToggleBookmark}>
          {isBookmarked ? '⭐ 찜 완료' : '🤍 찜하기'}
        </button>
      </div>

      {/* 상세 정보 테이블 */}
      <table style={styles.table}>
        <tbody>
          <tr>
            <th style={styles.th}>개최 장소</th>
            <td style={styles.td}>{event.opar}</td>
          </tr>
          <tr>
            <th style={styles.th}>주소 (지도)</th>
            <td style={styles.td}>
              {address}
              {address !== '주소 정보 없음' && (
                <a 
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.mapLink}
                >
                  [지도 보기 ▶]
                </a>
              )}
            </td>
          </tr>
          <tr>
            <th style={styles.th}>요금 정보</th>
            <td style={styles.td}>{event.admissionFee || '무료 (또는 정보 없음)'}</td>
          </tr>
          <tr>
            <th style={styles.th}>입장 연령</th>
            <td style={styles.td}>{event.entncAge || '전체 관람가'}</td>
          </tr>
          <tr>
            <th style={styles.th}>문의 전화</th>
            <td style={styles.td}>{event.phoneNumber || '-'}</td>
          </tr>
          <tr>
            <th style={styles.th}>홈페이지</th>
            <td style={styles.td}>
              {event.homepageUrl ? (
                <a href={event.homepageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                  바로가기 🔗
                </a>
              ) : '-'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 행사 내용 설명 */}
      <div style={styles.descriptionBox}>
        <strong>📝 행사 소개</strong>
        <p style={{ marginTop: '10px', whiteSpace: 'pre-line' }}>
          {event.eventCo || "상세 설명이 없습니다."}
        </p>
      </div>

      {/* 뒤로가기 버튼 */}
      <div style={styles.btnContainer}>
        <button 
          style={styles.backBtn} 
          onClick={() => navigate('/')} // 메인으로 이동 (뒤로가기는 navigate(-1) 사용 가능)
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default EventDetail;