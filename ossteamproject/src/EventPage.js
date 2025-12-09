import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 컴포넌트 import (경로가 맞는지 꼭 확인하세요!)
import PermissionBox from './components/PermissionBox';
import DownloadProgress from './components/DownloadProgress';
import SearchBar from './components/SearchBar';
import EventTable from './components/EventTable';
import Pagination from './components/Pagination';

// 🟢 [핵심] 컴포넌트 바깥에 데이터를 보관할 '금고(캐시)'
// 페이지를 갔다 와도 데이터가 날아가지 않게 해줍니다.
let globalCache = {
  allData: [],
  isLoaded: false
};

function EventPage() {
  const navigate = useNavigate();
  const API_KEY = "53d6Q4GS02bmf%2FGCrtn5Bkv11rSr61ocwflBQZqpmOI0liyBTFZOXjTqdWQ6B6yddVJuto%2FWxXQpJ%2FvPGntsUg%3D%3D"; 
  const BASE_URL = "/api/openapi/tn_pubr_public_pblprfr_event_info_api"; 
  const itemsPerPage = 10;

  // === State 초기값 설정 ===
  // 이미 다운받은 적이 있으면 'SMART' 모드로, 아니면 'ASK' 모드로 시작
  const [mode, setMode] = useState(globalCache.isLoaded ? 'SMART' : 'ASK'); 
  
  // 전체 데이터 (스마트 모드용)
  const [allData, setAllData] = useState(globalCache.allData); 
  
  // API 모드에서 현재 페이지에 보여줄 데이터
  const [apiItems, setApiItems] = useState([]); 
  
  // 화면에 실제로 뿌려줄 데이터 (필터링 결과 등)
  const [displayData, setDisplayData] = useState([]);
  
  // API 모드일 때 전체 개수 (페이징 계산용)
  const [apiTotalCount, setApiTotalCount] = useState(0);

  // 로딩 및 진행 상태
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // 🟢 검색어 State (행사명, 기관명 분리)
  const [eventName, setEventName] = useState(""); 
  const [orgName, setOrgName] = useState("");     
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState("");     

  // =========================================================
  // 1. [초기 진입] 
  // =========================================================
  useEffect(() => {
    // 이미 데이터가 있으면(스마트모드) 캐시 데이터를 화면에 보여줌
    if (globalCache.isLoaded) {
      setDisplayData(globalCache.allData);
    } else {
      // 데이터가 없으면 API로 1페이지 요청
      fetchApiData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // 2. [API 모드] 서버에 직접 요청하는 함수
  // =========================================================
  const fetchApiData = async (page) => {
    setLoading(true);
    try {
      let url = `${BASE_URL}?serviceKey=${API_KEY}&pageNo=${page}&numOfRows=${itemsPerPage}&type=json`;
      
      // 검색어 파라미터 추가
      if (eventName?.trim()) url += `&eventNm=${encodeURIComponent(eventName.trim())}`;
      if (orgName?.trim()) url += `&opar=${encodeURIComponent(orgName.trim())}`;

      const res = await axios.get(url);
      const items = res.data?.response?.body?.items || [];
      const total = res.data?.response?.body?.totalCount || 0;
      const list = Array.isArray(items) ? items : [items];
      
      const sorted = list.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

      setDisplayData(sorted); // 화면 갱신
      setApiItems(sorted);    // API 데이터 보관
      setApiTotalCount(total);
    } catch (e) {
      console.error(e);
      // alert("데이터 로딩 실패");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 3. [다운로드] 전체 데이터 가져오기 (스마트모드 전환)
  // =========================================================
  const startDownload = async () => {
    setMode('DOWNLOADING');
    try {
      // 전체 개수 확인
      const checkRes = await axios.get(`${BASE_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=1&type=json`);
      const total = checkRes.data?.response?.body?.totalCount || 0;
      
      const CHUNK = 1000;
      const loops = Math.ceil(total / CHUNK);
      let collected = [];

      // 반복 요청
      for (let i = 1; i <= loops; i++) {
        setProgressMsg(`${collected.length} / ${total}`);
        setProgress(Math.round(((i - 1) / loops) * 100));
        
        const res = await axios.get(`${BASE_URL}?serviceKey=${API_KEY}&pageNo=${i}&numOfRows=${CHUNK}&type=json`);
        const items = res.data?.response?.body?.items || [];
        collected = [...collected, ...(Array.isArray(items) ? items : [items])];
      }

      // 정렬
      collected.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));
      
      // 상태 업데이트
      setAllData(collected);
      setDisplayData(collected);
      setMode('SMART');
      setCurrentPage(1);
      
      // 검색어 초기화
      setEventName("");
      setOrgName("");

      // 🟢 [핵심] 전역 캐시에 저장 (갔다 와도 유지되도록)
      globalCache.allData = collected;
      globalCache.isLoaded = true;

    } catch (e) {
      alert("다운로드 실패. API 모드로 전환합니다.");
      setMode('API');
    }
  };

  // =========================================================
  // 4. [검색 로직] 모드에 따라 다르게 작동
  // =========================================================
  const handleSearch = () => {
    setCurrentPage(1);

    if (mode === 'SMART') {
      // --- 스마트 검색 (내 컴퓨터 필터링) ---
      const eventKey = eventName.toLowerCase().replace(/\s+/g, "");
      const orgKey = orgName.toLowerCase().replace(/\s+/g, "");
      
      const filterStart = startDate ? startDate.replaceAll('-', '') : null;
      const filterEnd = endDate ? endDate.replaceAll('-', '') : null;

      const result = allData.filter(item => {
        // 데이터 준비
        const itemEventName = (item.eventNm || "").toLowerCase().replace(/\s+/g, "");
        const itemOrgName = (item.opar || "").toLowerCase().replace(/\s+/g, "");
        const itemDate = (item.eventStartDate || "").replaceAll('-', '');

        // 조건 체크
        const isEventMatch = !eventKey || itemEventName.includes(eventKey);
        const isOrgMatch = !orgKey || itemOrgName.includes(orgKey);
        
        let isDateMatch = true;
        if (filterStart && itemDate < filterStart) isDateMatch = false;
        if (filterEnd && itemDate > filterEnd) isDateMatch = false;

        return isEventMatch && isOrgMatch && isDateMatch;
      });
      
      setDisplayData(result);

    } else {
      // --- API 검색 (서버 요청) ---
      // API 모드는 파라미터로 보내야 하므로 fetchApiData 호출
      fetchApiData(1);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (mode === 'API' || mode === 'ASK') {
      fetchApiData(newPage);
    }
  };

  // 상세 페이지 이동
  const handleRowClick = (item) => {
    navigate('/detail', { state: { event: item } });
  };

  // =========================================================
  // 5. 화면 렌더링 데이터 준비
  // =========================================================
  
  // 현재 페이지에 보여줄 데이터 자르기 (Pagination)
  const currentItems = mode === 'SMART' 
    ? displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : displayData; // API 모드는 애초에 10개만 받아옴

  // 전체 페이지 수 계산
  const totalCountForPage = mode === 'SMART' ? displayData.length : apiTotalCount;
  const totalPages = Math.ceil(totalCountForPage / itemsPerPage);

  // =========================================================
  // 6. JSX 반환
  // =========================================================
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>🎭 전국 공연/행사 정보</h3>

      {/* 1. 권한 요청 박스 */}
      {mode === 'ASK' && (
        <PermissionBox onConfirm={startDownload} onDeny={() => setMode('API')} />
      )}
      
      {/* 2. 다운로드 진행 바 */}
      {mode === 'DOWNLOADING' && (
        <DownloadProgress progress={progress} message={progressMsg} />
      )}

      {/* 3. 검색창 (다운로드 중이거나 ASK 모드일 땐 숨기거나 비활성화 가능하지만 여기선 유지) */}
      {mode !== 'DOWNLOADING' && mode !== 'ASK' && (
        <SearchBar 
          // 행사명 & 기관명
          eventName={eventName} setEventName={setEventName}
          orgName={orgName} setOrgName={setOrgName}
          
          // 날짜
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          
          // 기능
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
            onRowClick={handleRowClick} 
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