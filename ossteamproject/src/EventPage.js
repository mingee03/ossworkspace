import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 🟢 컴포넌트 import (파일 경로 확인 필수!)
import PermissionBox from './components/PermissionBox';
import DownloadProgress from './components/DownloadProgress';
import SearchBar from './components/SearchBar';
import EventTable from './components/EventTable';
import Pagination from './components/Pagination';

// 🟢 [전역 캐시] 페이지를 갔다 와도 다운로드된 데이터 유지
let globalCache = {
  allData: [],
  isLoaded: false
};

function EventPage() {
  const navigate = useNavigate();
  
  // API 설정
  const API_KEY = "53d6Q4GS02bmf%2FGCrtn5Bkv11rSr61ocwflBQZqpmOI0liyBTFZOXjTqdWQ6B6yddVJuto%2FWxXQpJ%2FvPGntsUg%3D%3D"; 
  const BASE_URL = "/api/openapi/tn_pubr_public_pblprfr_event_info_api"; 
  const itemsPerPage = 10;

  // === State 관리 ===
  
  // 모드: 'ASK'(질문), 'DOWNLOADING'(다운중), 'SMART'(전체보유), 'API'(서버요청)
  // 캐시에 데이터가 있으면 바로 SMART 모드로 시작
  const [mode, setMode] = useState(globalCache.isLoaded ? 'SMART' : 'ASK'); 
  
  // 데이터 저장소
  const [allData, setAllData] = useState(globalCache.allData); // 전체 데이터 (스마트모드용)
  const [displayData, setDisplayData] = useState([]);          // 화면에 보여질 데이터 (필터링 결과)
  const [apiTotalCount, setApiTotalCount] = useState(0);       // API 모드일 때 전체 개수
  
  // 로딩 및 진행률
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  
  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  
  // 검색어 (3가지 조건 + 날짜)
  const [eventName, setEventName] = useState(""); // 행사명
  const [orgName, setOrgName] = useState("");     // 기관명
  const [addrName, setAddrName] = useState("");   // 주소/지역
  const [startDate, setStartDate] = useState(""); // 시작일
  const [endDate, setEndDate] = useState("");     // 종료일

  // 찜 목록 (별표 표시용)
  const [bookmarks, setBookmarks] = useState([]); 

  // =========================================================
  // 1. 초기 실행
  // =========================================================
  useEffect(() => {
    // 1-1. 찜 목록 불러오기 (LocalStorage)
    const savedBookmarks = JSON.parse(localStorage.getItem('cultureZip_bookmarks')) || [];
    setBookmarks(savedBookmarks);

    // 1-2. 데이터 로드
    if (globalCache.isLoaded) {
      // 이미 다운로드된 데이터가 있으면 바로 보여줌
      setDisplayData(globalCache.allData);
    } else {
      // 없으면 API 모드로 1페이지 요청
      fetchApiData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // 2. API 모드 데이터 요청 (서버 검색)
  // =========================================================
  const fetchApiData = async (page) => {
    setLoading(true);
    try {
      let url = `${BASE_URL}?serviceKey=${API_KEY}&pageNo=${page}&numOfRows=${itemsPerPage}&type=json`;
      
      // 검색 파라미터 추가
      if (eventName?.trim()) url += `&eventNm=${encodeURIComponent(eventName.trim())}`;
      if (orgName?.trim()) url += `&opar=${encodeURIComponent(orgName.trim())}`;
      if (addrName?.trim()) url += `&rdnmadr=${encodeURIComponent(addrName.trim())}`; // API 지원 시 작동

      const res = await axios.get(url);
      const items = res.data?.response?.body?.items || [];
      const total = res.data?.response?.body?.totalCount || 0;
      const list = Array.isArray(items) ? items : [items];
      
      // 날짜순 정렬
      const sorted = list.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

      setDisplayData(sorted);
      setApiTotalCount(total);
    } catch (e) {
      console.error(e);
      // alert("데이터 로딩 실패"); 
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 3. 다운로드 로직 (스마트 모드 전환)
  // =========================================================
  const startDownload = async () => {
    setMode('DOWNLOADING');
    try {
      // 1. 전체 개수 파악
      const checkRes = await axios.get(`${BASE_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=1&type=json`);
      const total = checkRes.data?.response?.body?.totalCount || 0;
      
      const CHUNK = 1000;
      const loops = Math.ceil(total / CHUNK);
      let collected = [];

      // 2. 반복 요청
      for (let i = 1; i <= loops; i++) {
        setProgressMsg(`${collected.length} / ${total}`);
        setProgress(Math.round(((i - 1) / loops) * 100));
        
        const res = await axios.get(`${BASE_URL}?serviceKey=${API_KEY}&pageNo=${i}&numOfRows=${CHUNK}&type=json`);
        const items = res.data?.response?.body?.items || [];
        collected = [...collected, ...(Array.isArray(items) ? items : [items])];
      }

      // 3. 정렬 및 저장
      collected.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));
      
      setAllData(collected);
      setDisplayData(collected);
      setMode('SMART');
      setCurrentPage(1);
      
      // 검색어 초기화
      setEventName(""); setOrgName(""); setAddrName("");

      // 🟢 전역 캐시 저장
      globalCache.allData = collected;
      globalCache.isLoaded = true;

    } catch (e) {
      alert("다운로드 실패. API 모드로 전환합니다.");
      setMode('API');
    }
  };

  // =========================================================
  // 4. 검색 로직 (스마트 검색 vs API 검색)
  // =========================================================
  const handleSearch = () => {
    setCurrentPage(1);

    if (mode === 'SMART') {
      // --- 스마트 검색 (내 컴퓨터 메모리 필터링) ---
      const eKey = eventName.toLowerCase().replace(/\s+/g, "");
      const oKey = orgName.toLowerCase().replace(/\s+/g, "");
      const aKey = addrName.toLowerCase().replace(/\s+/g, ""); // 주소 키워드
      
      const fStart = startDate ? startDate.replaceAll('-', '') : null;
      const fEnd = endDate ? endDate.replaceAll('-', '') : null;

      const result = allData.filter(item => {
        // 데이터 전처리
        const n = (item.eventNm || "").toLowerCase().replace(/\s+/g, "");
        const p = (item.opar || "").toLowerCase().replace(/\s+/g, "");
        // 주소 (도로명 + 지번)
        const addr = (item.rdnmadr || "" + item.lnmadr || "").toLowerCase().replace(/\s+/g, "");
        const d = (item.eventStartDate || "").replaceAll('-', '');

        // 조건 체크
        const isE = !eKey || n.includes(eKey);
        const isO = !oKey || p.includes(oKey);
        const isA = !aKey || addr.includes(aKey); // 주소 유사 검색
        
        let isDate = true;
        if (fStart && d < fStart) isDate = false;
        if (fEnd && d > fEnd) isDate = false;

        return isE && isO && isA && isDate;
      });
      
      setDisplayData(result);

    } else {
      // --- API 검색 (서버 요청) ---
      fetchApiData(1);
    }
  };

  // =========================================================
  // 5. 찜하기 토글 핸들러
  // =========================================================
  const handleToggleBookmark = (item) => {
    const getEventKey = (i) => `${i.eventNm}-${i.eventStartDate}-${i.opar}`;
    const key = getEventKey(item);
    
    // 이미 있는지 확인
    const isFav = bookmarks.some(b => getEventKey(b) === key);
    
    let newBookmarks;
    if (isFav) {
      newBookmarks = bookmarks.filter(b => getEventKey(b) !== key); // 삭제
    } else {
      newBookmarks = [...bookmarks, item]; // 추가
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem('cultureZip_bookmarks', JSON.stringify(newBookmarks));
  };

  // =========================================================
  // 6. 화면 렌더링 준비
  // =========================================================
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (mode === 'API' || mode === 'ASK') fetchApiData(newPage);
  };

  const handleRowClick = (item) => {
    navigate('/detail', { state: { event: item } });
  };

  // 현재 페이지 데이터 자르기
  const currentItems = mode === 'SMART' 
    ? displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : displayData; 

  const totalCountForPage = mode === 'SMART' ? displayData.length : apiTotalCount;
  const totalPages = Math.ceil(totalCountForPage / itemsPerPage);

  // =========================================================
  // 7. JSX 반환
  // =========================================================
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* 헤더 및 찜 목록 이동 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <h3 style={{ margin: 0, color: '#333' }}>🎭 전국 공연/행사 정보</h3>
         <button 
           onClick={() => navigate('/bookmarks')}
           style={{ padding: '10px 15px', backgroundColor: '#ffc107', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}
         >
           ⭐ 찜 목록 보기 ({bookmarks.length})
         </button>
      </div>

      {/* 1. 권한 요청 박스 */}
      {mode === 'ASK' && (
        <PermissionBox onConfirm={startDownload} onDeny={() => setMode('API')} />
      )}
      
      {/* 2. 다운로드 진행 바 */}
      {mode === 'DOWNLOADING' && (
        <DownloadProgress progress={progress} message={progressMsg} />
      )}

      {/* 3. 검색창 */}
      {mode !== 'ASK' && mode !== 'DOWNLOADING' && (
        <SearchBar 
          eventName={eventName} setEventName={setEventName}
          orgName={orgName} setOrgName={setOrgName}
          addrName={addrName} setAddrName={setAddrName} // 🟢 주소 검색 추가됨
          
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          
          onSearch={handleSearch} 
          mode={mode} 
          onSwitchMode={startDownload}
          disabled={loading}
        />
      )}

      {/* 4. 테이블 및 페이징 */}
      {mode !== 'DOWNLOADING' && (
        <>
          <EventTable 
            items={currentItems} 
            loading={loading} 
            bookmarks={bookmarks} // 🟢 찜 상태 표시용
            onRowClick={handleRowClick} 
            onToggleBookmark={handleToggleBookmark} // 🟢 찜 클릭 핸들러
          />
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </>
      )}
    </div>
  );
}

export default EventPage;