import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px', fontFamily: 'sans-serif' },
  header: { marginBottom: '20px', color: '#333', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  th: { backgroundColor: '#4a90e2', color: 'white', padding: '12px', border: '1px solid #ddd', textAlign: 'center', whiteSpace: 'nowrap' },
  td: { border: '1px solid #ddd', padding: '10px', verticalAlign: 'middle', color: '#555' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px', color: '#007bff' },
  error: { padding: '20px', backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', borderRadius: '4px', margin: '20px 0' },
  empty: { textAlign: 'center', padding: '40px', color: '#777', backgroundColor: '#f9f9f9', marginTop: '20px' }
};

function EventTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. 디코딩된 인증키
  const API_KEY = "53d6Q4GS02bmf/GCrtn5Bkv11rSr61ocwflBQZqpmOI0liyBTFZOXjTqdWQ6B6yddVJuto/WxXQpJ/vPGntsUg=="; 
  
  // 2. 요청 주소 (로컬 및 Vercel 프록시 규칙에 따라 /api로 시작)
  const BASE_URL = "/api/openapi/tn_pubr_public_pblprfr_event_info_api"; 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 쿼리 스트링 수동 조립 (가장 안전한 방법)
        const fullUrl = `${BASE_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=10&type=json`;
        
        console.log("요청 URL:", fullUrl);

        const response = await axios.get(fullUrl);

        console.log("📡 API 응답:", response.data);

        // 공공데이터포털 에러 체크 (XML 응답 시)
        if (typeof response.data === 'string' && response.data.includes('<errMsg>')) {
          const errorMsg = response.data.split('<errMsg>')[1].split('</errMsg>')[0];
          throw new Error(`공공데이터 API 에러: ${errorMsg}`);
        }

        const items = response.data?.response?.body?.items || [];
        const eventList = Array.isArray(items) ? items : [items];

        setEvents(eventList);

      } catch (err) {
        console.error("❌ 에러 발생:", err);
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>데이터를 불러오는 중입니다... ⏳</div>;
  if (error) return <div style={styles.error}><strong>오류 발생:</strong> {error}</div>;
  if (!events.length) return <div style={styles.empty}>데이터가 없습니다.</div>;

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>🎭 전국 공연/행사 정보 (총 {events.length}개)</h3>
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>행사명</th>
            <th style={styles.th}>장소</th>
            <th style={styles.th}>기간</th>
            <th style={styles.th}>주소</th>
            <th style={styles.th}>문의처</th>
          </tr>
        </thead>
        <tbody>
          {events.map((item, index) => (
            <tr key={index}>
              <td style={styles.td}><strong>{item.eventNm}</strong></td>
              <td style={styles.td}>{item.opar}</td>
              <td style={{ ...styles.td, textAlign: 'center', minWidth: '150px' }}>
                {item.eventStartDate}<br/>~<br/>{item.eventEndDate}
              </td>
              <td style={styles.td}>{item.rdnmadr || item.lnmadr || '-'}</td>
              <td style={styles.td}>{item.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventTable;