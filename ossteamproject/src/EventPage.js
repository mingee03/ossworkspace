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

  // 모드
  const [mode, setMode] = useState(globalCache.isLoaded ? "SMART" : "ASK");

  const [allData, setAllData] = useState(globalCache.allData);
  const [displayData, setDisplayData] = useState([]);

  const [apiTotalCount, setApiTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 필터 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [eventName, setEventName] = useState("");
  const [orgName, setOrgName] = useState("");

  const [exactEventName, setExactEventName] = useState("");

  // 🟢 [추가] 찜하기 관련 State
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false); // 찜 목록만 보기 모드

  // =========================================================
  // 1) 초기 실행
  // =========================================================
  useEffect(() => {
    // 1-1. 로컬 스토리지에서 찜 목록 불러오기
    const savedBookmarks = JSON.parse(localStorage.getItem('cultureZip_bookmarks')) || [];
    setBookmarks(savedBookmarks);

    // 1-2. 데이터 로드
    if (globalCache.isLoaded) {
      setDisplayData(globalCache.allData);
    } else {
      fetchApiData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // 🟢 [핵심] 찜하기 토글 함수
  // =========================================================
  const toggleBookmark = (item) => {
    // 고유 키 생성 (중복 방지용)
    const getEventKey = (i) => `${i.eventNm}-${i.eventStartDate}-${i.opar}`;
    const key = getEventKey(item);
    
    const isBookmarked = bookmarks.some(b => getEventKey(b) === key);
    let newBookmarks;

    if (isBookmarked) {
      // 이미 있으면 삭제
      newBookmarks = bookmarks.filter(b => getEventKey(b) !== key);
    } else {
      // 없으면 추가
      newBookmarks = [...bookmarks, item];
    }

    setBookmarks(newBookmarks);
    localStorage.setItem('cultureZip_bookmarks', JSON.stringify(newBookmarks));
  };

  // =========================================================
  // 2) API 데이터 조회
  // =========================================================
  const fetchApiData = async (page) => {
    setLoading(true);
    try {
      let url = `${BASE_URL}?serviceKey=${API_KEY}&pageNo=${page}&numOfRows=${itemsPerPage}&type=json`;
      if (eventName?.trim()) url += `&eventNm=${encodeURIComponent(eventName.trim())}`;
      if (orgName?.trim()) url += `&opar=${encodeURIComponent(orgName.trim())}`;

      const res = await axios.get(url);
      const items = res.data?.response?.body?.items || [];
      const total = res.data?.response?.body?.totalCount || 0;
      const list = Array.isArray(items) ? items : [items];
      const sorted = list.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

      setDisplayData(sorted);
      setApiTotalCount(total);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // =========================================================
  // 3) 전체 다운로드
  // =========================================================
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
      setEventName(""); setOrgName("");
    } catch (e) {
      alert("다운로드 실패"); setMode("API");
    }
  };

  // =========================================================
  // 4) 검색 로직 (스마트 검색 포함)
  // =========================================================
  const handleSearch = () => {
    setCurrentPage(1);
    setShowBookmarksOnly(false); // 검색 시 찜 모드 해제

    if (mode === "SMART") {
      // 🟢 스마트 검색: 공백제거 + 소문자
      const eKey = eventName.toLowerCase().replace(/\s+/g, "");
      const oKey = orgName.toLowerCase().replace(/\s+/g, "");
      const rKey = region.toLowerCase().replace(/\s+/g, "");
      const cKey = category.toLowerCase().replace(/\s+/g, "");
      
      const fStart = startDate ? startDate.replaceAll("-", "") : null;
      const fEnd = endDate ? endDate.replaceAll("-", "") : null;

      const result = allData.filter(item => {
        const n = (item.eventNm || "").toLowerCase().replace(/\s+/g, "");
        const p = (item.opar || "").toLowerCase().replace(/\s+/g, "");
        // 지역/주소는 장소명+도로명주소 합쳐서 검사
        const addr = (item.opar || "" + item.rdnmadr || "").toLowerCase().replace(/\s+/g, ""); 
        const desc = (item.eventCo || "").toLowerCase().replace(/\s+/g, "");
        const d = (item.eventStartDate || "").replaceAll("-", "");

        const matchesEvent = !eKey || n.includes(eKey);
        const matchesOrg = !oKey || p.includes(oKey);
        const matchesRegion = !rKey || addr.includes(rKey);
        const matchesCategory = !cKey || desc.includes(cKey);

        let matchesDate = true;
        if (fStart && d < fStart) matchesDate = false;
        if (fEnd && d > fEnd) matchesDate = false;

        return matchesEvent && matchesOrg && matchesRegion && matchesCategory && matchesDate;
      });
      setDisplayData(result);
    } else {
      fetchApiData(1);
    }
  };

  // =========================================================
  // 5) 정확 검색 (상단바)
  // =========================================================
  const handleExactSearch = () => {
    const name = exactEventName.trim();
    setCurrentPage(1);
    setShowBookmarksOnly(false);

    if (!name) {
      if (mode === "SMART") setDisplayData(allData);
      else fetchApiData(1);
      return;
    }

    if (mode === "SMART") {
      // 스마트 모드에선 부분 일치 허용
      const lower = name.toLowerCase().replace(/\s+/g, "");
      const result = allData.filter(item =>
        (item.eventNm || "").toLowerCase().replace(/\s+/g, "").includes(lower)
      );
      setDisplayData(result);
    } else {
      fetchExactApiSearch(name);
    }
  };

  const fetchExactApiSearch = async (name) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=200&type=json&eventNm=${encodeURIComponent(name)}`);
      const items = res.data?.response?.body?.items || [];
      const list = Array.isArray(items) ? items : [items];
      const filtered = list.filter(item => (item.eventNm || "").toLowerCase().includes(name.toLowerCase()));
      setDisplayData(filtered);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // =========================================================
  // 6) 페이지 변경 & 클릭
  // =========================================================
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (mode !== "SMART" && !showBookmarksOnly) fetchApiData(newPage);
  };

  const handleRowClick = (item) => {
    navigate('/detail', { state: { event: item } });
  };

  // =========================================================
  // 7) 화면 데이터 계산
  // =========================================================
  // 🟢 찜 목록 모드면 bookmarks를, 아니면 검색결과를 사용
  const finalData = showBookmarksOnly ? bookmarks : displayData;
  const isClientPaging = mode === "SMART" || showBookmarksOnly;

  const currentItems = isClientPaging
    ? finalData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : displayData;

  const totalCount = isClientPaging ? finalData.length : apiTotalCount;
  const totalPages = Math.ceil(totalCount / itemsPerPage);


  return (
    <div style={{ paddingTop: '30px' }}>
      {mode === "ASK" && <PermissionBox onConfirm={startDownload} onDeny={() => setMode("API")} />}
      {mode === "DOWNLOADING" && <DownloadProgress progress={progress} message={progressMsg} />}

      {/* 상단 정확 검색바 */}
      {mode !== "DOWNLOADING" && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', width: '60%', maxWidth: '600px' }}>
            <input
              type="text"
              placeholder="행사명으로 검색"
              value={exactEventName}
              onChange={(e) => setExactEventName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleExactSearch()}
              style={{ flex: 1, padding: '12px 16px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <button onClick={handleExactSearch} style={{ padding: '12px 20px', backgroundColor: '#ff7c02', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>검색</button>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      {mode !== "DOWNLOADING" && (
        <div style={{ display: 'flex', gap: '30px', padding: '20px 30px', maxWidth: '1500px', margin: '0 auto' }}>
          
          <div style={{ flex: 1 }}>
            {/* 🟢 찜 목록 토글 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <h3 style={{ margin: 0, color: '#333' }}>
                 {showBookmarksOnly ? "⭐ 찜한 행사" : "🎭 행사 목록"} 
                 <span style={{fontSize:'14px', color:'#666', marginLeft:'10px'}}>(총 {totalCount}건)</span>
               </h3>
               <button 
                 onClick={() => { setShowBookmarksOnly(!showBookmarksOnly); setCurrentPage(1); }}
                 style={{
                   padding: '8px 16px', 
                   backgroundColor: showBookmarksOnly ? '#ffc107' : '#eee', 
                   color: showBookmarksOnly ? 'black' : '#555',
                   border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
                 }}
               >
                 {showBookmarksOnly ? "🏠 전체 목록 보기" : `⭐ 찜 목록 보기 (${bookmarks.length})`}
               </button>
            </div>

            {/* 🟢 EventCardList에 찜 관련 Props 전달 */}
            <EventCardList 
              items={currentItems} 
              loading={loading} 
              onRowClick={handleRowClick}
              bookmarks={bookmarks}            // 찜 목록 전달
              onToggleBookmark={toggleBookmark} // 토글 함수 전달
            />
            
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>

          <FilterPanel
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            region={region} setRegion={setRegion}
            category={category} setCategory={setCategory}
            eventName={eventName} setEventName={setEventName}
            orgName={orgName} setOrgName={setOrgName}
            onSearch={handleSearch}
          />
        </div>
      )}
    </div>
  );
}

export default EventPage;