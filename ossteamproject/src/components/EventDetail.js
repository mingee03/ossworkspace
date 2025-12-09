import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EventDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 목록 페이지에서 넘겨준 데이터 받기
  const event = location.state?.event;

  // 1. 데이터 없이 직접 URL로 접속했을 때 예외 처리
  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>잘못된 접근입니다.</h3>
        <p>목록 페이지에서 행사를 선택해주세요.</p>
        <button 
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 2. 스타일 정의 (일관성을 위해 기존 스타일 유지)
  const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    header: { borderBottom: '2px solid #007bff', paddingBottom: '15px', marginBottom: '20px' },
    title: { fontSize: '24px', color: '#333', margin: '0 0 10px 0' },
    period: { color: '#666', fontSize: '16px', fontWeight: 'bold' },
    
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '15px' },
    th: { width: '120px', backgroundColor: '#f5f5f5', padding: '12px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 'bold', color: '#555' },
    td: { padding: '12px', borderBottom: '1px solid #eee', color: '#333' },
    
    descriptionBox: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px', marginTop: '20px', lineHeight: '1.6', color: '#444' },
    
    btnContainer: { textAlign: 'center', marginTop: '40px' },
    backBtn: { padding: '12px 30px', fontSize: '16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    mapLink: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer' }
  };

  // 주소 정보 (도로명 우선, 없으면 지번)
  const address = event.rdnmadr || event.lnmadr || '주소 정보 없음';

  return (
    <div style={styles.container}>
      {/* 헤더 섹션 */}
      <div style={styles.header}>
        <h2 style={styles.title}>{event.eventNm}</h2>
        <div style={styles.period}>
          📅 {event.eventStartDate} ~ {event.eventEndDate}
        </div>
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
                <span style={{ marginLeft: '10px' }}>
                  <a 
                    href={`https://map.naver.com/v5/search/${encodeURIComponent(address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.mapLink}
                  >
                    [네이버 지도 보기]
                  </a>
                </span>
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
            <th style={styles.th}>할인 정보</th>
            <td style={styles.td}>{event.dscntInfo || '-'}</td>
          </tr>
          <tr>
            <th style={styles.th}>문의 전화</th>
            <td style={styles.td}>{event.phoneNumber || '-'}</td>
          </tr>
          <tr>
            <th style={styles.th}>홈페이지</th>
            <td style={styles.td}>
              {event.homepageUrl ? (
                <a href={event.homepageUrl} target="_blank" rel="noopener noreferrer" style={styles.mapLink}>
                  바로가기 🔗
                </a>
              ) : '-'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 행사 내용 (설명) */}
      <div style={styles.descriptionBox}>
        <strong>📝 행사 소개</strong>
        <p style={{ marginTop: '10px', whiteSpace: 'pre-line' }}>
          {event.eventCo || "상세 설명이 없습니다."}
        </p>
      </div>

      {/* 하단 버튼 */}
      <div style={styles.btnContainer}>
        <button 
          style={styles.backBtn} 
          onClick={() => navigate(-1)} // 뒤로 가기 기능
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default EventDetail;