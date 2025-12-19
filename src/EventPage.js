import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 컴포넌트
import EventCardList from './components/EventCardList';
import FilterPanel from './components/FilterPanel';
import Pagination from './components/Pagination';
import PermissionBox from './components/PermissionBox';
import DownloadProgress from './components/DownloadProgress';

// 🔹 전역 캐시
let globalCache = {
  allData: [],
  isLoaded: false
};

function EventPage() {
  const navigate = useNavigate();
  
  const API_KEY = "53d6Q4GS02bmf%2FGCrtn5Bkv11rSr61ocwflBQZqpmOI0liyBTFZOXjTqdWQ6B6yddVJuto%2FWxXQpJ%2FvPGntsUg%3D%3D";
  const BASE_URL = "/api/openapi/tn_pubr_public_pblprfr_event_info_api";
  const itemsPerPage = 12;

  // === State ===
  const [mode, setMode] = useState(globalCache.isLoaded ? "SMART" : "ASK");
  const [allData, setAllData] = useState(globalCache.allData);
  const [displayData, setDisplayData] = useState([]);
  const [apiTotalCount, setApiTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 우측 필터 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [eventName, setEventName] = useState(""); // 상세 행사명
  const [orgName, setOrgName] = useState("");     // 상세 기관명

  // 상단 검색어
  const [exactEventName, setExactEventName] = useState("");

  // 찜하기
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // 1. 초기 실행
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('cultureZip_bookmarks')) || [];
    setBookmarks(savedBookmarks);

    if (globalCache.isLoaded) {
      setDisplayData(globalCache.allData);
    } else {
      // 초기 로드 (모든 조건 비운 상태로 검색)
      searchData(1, "", "", "", "", "", "", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. 찜 토글
  const toggleBookmark = (item) => {
    const getEventKey = (i) => `${i.eventNm}-${i.eventStartDate}-${i.opar}`;
    const key = getEventKey(item);
    const isBookmarked = bookmarks.some(b => getEventKey(b) === key);
    
    let newBookmarks;
    if (isBookmarked) newBookmarks = bookmarks.filter(b => getEventKey(b) !== key);
    else newBookmarks = [...bookmarks, item];

    setBookmarks(newBookmarks);
    localStorage.setItem('cultureZip_bookmarks', JSON.stringify(newBookmarks));
  };

  // 3. 다운로드 로직
  const startDownload = async () => {
    setMode("DOWNLOADING");
    try {
      const checkRes = await axios.get(`${BASE_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=1&type=json`);
      const total = checkRes.data?.response?.body?.totalCount || 0;
      const CHUNK = 1000;
      const loops = Math.ceil(total / CHUNK);
      let collected = [];

      for (let i = 1; i <= loops; i++) {
        setProgressMsg(`${collected.length} / ${total}`);
        setProgress(Math.round(((i - 1) / loops) * 100));
        const res = await axios.get(`${BASE_URL}?serviceKey=${API_KEY}&pageNo=${i}&numOfRows=${CHUNK}&type=json`);
        const items = res.data?.response?.body?.items || [];
        collected = [...collected, ...(Array.isArray(items) ? items : [items])];
      }
      collected.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

      setAllData(collected);
      setDisplayData(collected);
      globalCache.allData = collected;
      globalCache.isLoaded = true;

      setMode("SMART");
      setCurrentPage(1);
      // 다운로드 완료 후 검색어 초기화
      setExactEventName(""); setEventName(""); setOrgName(""); setRegion("");
      
    } catch (e) {
      alert("다운로드 실패"); setMode("API");
    }
  };

  // =========================================================
  // 🟢 [핵심] 통합 검색 함수 (인자를 직접 받아 즉시 처리)
  // =========================================================
  const searchData = async (
    page, 
    p_mainKey,  // 상단 검색어
    p_region, p_category, p_event, p_org, // 필터들
    p_sDate, p_eDate // 날짜
  ) => {
    setLoading(true);
    setCurrentPage(page);
    setShowBookmarksOnly(false); // 검색 시 찜 모드 해제

    // --- A. 스마트 모드 (클라이언트 필터링 - 유사검색) ---
    if (mode === "SMART") {
      // 공백 제거 및 소문자 변환
      const mk = (p_mainKey || "").toLowerCase().replace(/\s+/g, "");
      const rk = (p_region || "").toLowerCase().replace(/\s+/g, "");
      const ck = (p_category || "").toLowerCase().replace(/\s+/g, "");
      const ek = (p_event || "").toLowerCase().replace(/\s+/g, "");
      const ok = (p_org || "").toLowerCase().replace(/\s+/g, "");
      
      const fs = p_sDate ? p_sDate.replaceAll("-", "") : null;
      const fe = p_eDate ? p_eDate.replaceAll("-", "") : null;

      const result = allData.filter(item => {
        // 데이터 전처리
        const n = (item.eventNm || "").toLowerCase().replace(/\s+/g, "");
        const p = (item.opar || "").toLowerCase().replace(/\s+/g, "");
        // 주소 + 장소 통합 (유사 검색용)
        const fullAddr = (item.rdnmadr || "" + item.lnmadr || "" + item.opar || "").toLowerCase().replace(/\s+/g, "");
        const desc = (item.eventCo || "").toLowerCase().replace(/\s+/g, "");
        const d = (item.eventStartDate || "").replaceAll("-", "");

        // 조건 비교
        const matchMain = !mk || n.includes(mk);
        const matchRegion = !rk || fullAddr.includes(rk);
        const matchCategory = !ck || desc.includes(ck);
        const matchDetailEvt = !ek || n.includes(ek);
        const matchDetailOrg = !ok || p.includes(ok);

        let matchDate = true;
        if (fs && d < fs) matchDate = false;
        if (fe && d > fe) matchDate = false;

        return matchMain && matchRegion && matchCategory && matchDetailEvt && matchDetailOrg && matchDate;
      });

      setDisplayData(result);
      setLoading(false);
    } 
    // --- B. API 모드 (서버 요청) ---
    else {
      try {
        let url = `${BASE_URL}?serviceKey=${API_KEY}&pageNo=${page}&numOfRows=${itemsPerPage}&type=json`;
        
        // 파라미터가 있는 것만 붙임 (API가 지원하는 필드만)
        if (p_mainKey) url += `&eventNm=${encodeURIComponent(p_mainKey)}`;
        if (p_region) url += `&rdnmadr=${encodeURIComponent(p_region)}`;
        if (p_event) url += `&eventNm=${encodeURIComponent(p_event)}`;
        if (p_org) url += `&opar=${encodeURIComponent(p_org)}`;
        // 날짜 필터는 API 스펙에 따라 startDate, endDate 파라미터가 있다면 추가 가능

        const res = await axios.get(url);
        const items = res.data?.response?.body?.items || [];
        const total = res.data?.response?.body?.totalCount || 0;
        const list = Array.isArray(items) ? items : [items];
        
        // 결과 정렬
        list.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

        setDisplayData(list);
        setApiTotalCount(total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  // =========================================================
  // 🟢 이벤트 핸들러 (검색 & 초기화)
  // =========================================================

  // 1. 일반 검색 실행 (현재 화면에 입력된 값들로 검색)
  const triggerSearch = () => {
    searchData(1, exactEventName, region, category, eventName, orgName, startDate, endDate);
  };

  // 2. 상단 검색창만 초기화
  const handleTopReset = () => {
    setExactEventName(""); // 화면 지우기
    // 검색 로직에는 빈 값("")을 직접 전달해서 즉시 반영
    searchData(1, "", region, category, eventName, orgName, startDate, endDate);
  };

  // 3. 우측 필터만 초기화
  const handleFilterReset = () => {
    // 화면 필터 지우기
    setStartDate(""); setEndDate(""); 
    setRegion(""); setCategory(""); 
    setEventName(""); setOrgName("");
    
    // 검색 로직에는 필터 부분에 빈 값("") 전달
    searchData(1, exactEventName, "", "", "", "", "", "");
  };

  // 4. 페이지 변경
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // 스마트모드가 아니거나 찜 모드가 아닐 때만 API 재호출
    if (mode !== "SMART" && !showBookmarksOnly) {
      searchData(newPage, exactEventName, region, category, eventName, orgName, startDate, endDate);
    }
  };
  
  const handleRowClick = (item) => navigate('/detail', { state: { event: item } });

  // 렌더링용 변수 계산
  const finalData = showBookmarksOnly ? bookmarks : displayData;
  const isClientPaging = mode === "SMART" || showBookmarksOnly || (mode === "API" && exactEventName);
  
  const currentItems = isClientPaging
    ? finalData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : displayData;

  const totalCount = isClientPaging ? finalData.length : apiTotalCount;
  const totalPages = Math.ceil(totalCount / itemsPerPage);


  return (
    <div style={{ paddingTop: '30px' }}>
      {mode === "ASK" && <PermissionBox onConfirm={startDownload} onDeny={() => setMode("API")} />}
      {mode === "DOWNLOADING" && <DownloadProgress progress={progress} message={progressMsg} />}

      {/* 🟢 상단 검색바 (초기화 버튼 추가) */}
      {mode !== "DOWNLOADING" && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', width: '60%', maxWidth: '650px' }}>
            <input
              type="text"
              placeholder="행사명으로 검색 (예: 축제, 불꽃)"
              value={exactEventName}
              onChange={(e) => setExactEventName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && triggerSearch()}
              style={{ flex: 1, padding: '12px 16px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <button 
              onClick={triggerSearch} 
              style={{ padding: '12px 20px', backgroundColor: '#ff7c02', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
              검색
            </button>
            <button 
              onClick={handleTopReset} 
              style={{ padding: '12px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              초기화
            </button>
          </div>
        </div>
      )}

      {/* 메인 레이아웃 */}
      {mode !== "DOWNLOADING" && (
        <div style={{ display: 'flex', gap: '30px', padding: '20px 30px', maxWidth: '1500px', margin: '0 auto' }}>
          
          {/* 왼쪽: 리스트 */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <h3 style={{ margin: 0, color: '#333' }}>
                 {showBookmarksOnly ? "⭐ 찜한 행사" : "🎭 행사 목록"} 
                 <span style={{fontSize:'14px', color:'#666', marginLeft:'10px'}}>(총 {totalCount}건)</span>
               </h3>
               <button 
                 onClick={() => { setShowBookmarksOnly(!showBookmarksOnly); setCurrentPage(1); }}
                 style={{ padding: '8px 16px', backgroundColor: showBookmarksOnly ? '#ffc107' : '#eee', color: showBookmarksOnly ? 'black' : '#555', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                 {showBookmarksOnly ? "🏠 전체 목록 보기" : `⭐ 찜 목록 보기 (${bookmarks.length})`}
               </button>
            </div>

            <EventCardList 
              items={currentItems} 
              loading={loading} 
              onRowClick={handleRowClick}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>

          {/* 🟢 우측 필터 패널 (초기화 함수 전달) */}
          <FilterPanel
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            region={region} setRegion={setRegion}
            category={category} setCategory={setCategory}
            eventName={eventName} setEventName={setEventName}
            orgName={orgName} setOrgName={setOrgName}
            onSearch={triggerSearch}
            onReset={handleFilterReset} // 전달
          />
        </div>
      )}
    </div>
  );
}

export default EventPage;