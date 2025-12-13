// EventPage.js
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

  // 모드 ASK / API / DOWNLOADING / SMART
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

  // ⭐ 정확 행사명 검색창 입력 상태
  const [exactEventName, setExactEventName] = useState("");


  // =========================================================
  // 1) 첫 진입 시
  // =========================================================
  useEffect(() => {
    if (globalCache.isLoaded) {
      setDisplayData(globalCache.allData);
    } else {
      fetchApiData(1);
    }
  }, []);


  // =========================================================
  // 2) API 모드 데이터 조회
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

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // 3) SMART 모드 전체 다운로드
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
      setEventName("");
      setOrgName("");

    } catch (e) {
      alert("전체 데이터 다운로드에 실패하여 API 모드로 전환합니다.");
      setMode("API");
    }
  };


  // =========================================================
  // 4) 필터 검색
  // =========================================================
  const handleSearch = () => {
    setCurrentPage(1);

    if (mode === "SMART") {
      const result = allData.filter(item => {
        const eventNm = (item.eventNm || "").toLowerCase();
        const oparNm = (item.opar || "").toLowerCase();
        const insttNm = (item.insttNm || "").toLowerCase();
        const eventCo = (item.eventCo || "").toLowerCase();
        const orgNm = (item.mnnstNm || "").toLowerCase();
        const itemDate = (item.eventStartDate || "").replaceAll("-", "");

        const matchesEvent = !eventName || eventNm.includes(eventName.toLowerCase());
        const matchesOrg = !orgName || orgNm.includes(orgName.toLowerCase());
        const matchesRegion = !region || oparNm.includes(region.toLowerCase()) || insttNm.includes(region.toLowerCase());
        const matchesCategory = !category || eventCo.includes(category.toLowerCase());

        let matchesDate = true;
        if (startDate) matchesDate = matchesDate && itemDate >= startDate.replaceAll("-", "");
        if (endDate) matchesDate = matchesDate && itemDate <= endDate.replaceAll("-", "");

        return matchesEvent && matchesOrg && matchesRegion && matchesCategory && matchesDate;
      });

      setDisplayData(result);
    } else {
      fetchApiData(1);
    }
  };


  // =========================================================
  // 5) 정확 행사명 검색 (상단 검색바)
  // =========================================================
  const handleExactSearch = () => {
    const name = exactEventName.trim();
    setCurrentPage(1);

    if (!name) {
      // 비었으면 전체 복원
      if (mode === "SMART") setDisplayData(allData);
      else fetchApiData(1);
      return;
    }

    if (mode === "SMART") {
      const lower = name.toLowerCase();
      const result = allData.filter(item =>
        (item.eventNm || "").toLowerCase() === lower
      );
      setDisplayData(result);
    } else {
      fetchExactApiSearch(name);
    }
  };


  // API 모드용 정확검색
  const fetchExactApiSearch = async (name) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=200&type=json&eventNm=${encodeURIComponent(name)}`
      );

      const items = res.data?.response?.body?.items || [];
      const list = Array.isArray(items) ? items : [items];

      const filtered = list.filter(item =>
        (item.eventNm || "").toLowerCase() === name.toLowerCase()
      );

      setDisplayData(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // 6) 페이지 변경
  // =========================================================
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (mode !== "SMART") fetchApiData(newPage);
  };

  const handleRowClick = (item) => {
    navigate('/detail', { state: { event: item } });
  };


  // SMART 모드에서는 slice로 페이지네이션
  const currentItems =
    mode === "SMART"
      ? displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      : displayData;

  const totalCount = mode === "SMART" ? displayData.length : apiTotalCount;
  const totalPages = Math.ceil(totalCount / itemsPerPage);


  // =========================================================
  // 7) JSX 화면 출력
  // =========================================================
  return (
    <div style={{ paddingTop: '30px' }}>

      {/* 시작 모드 ASK */}
      {mode === "ASK" && (
        <PermissionBox
          onConfirm={startDownload}
          onDeny={() => setMode("API")}
        />
      )}

      {/* 다운로드 중 */}
      {mode === "DOWNLOADING" && (
        <DownloadProgress progress={progress} message={progressMsg} />
      )}


      {/* 🔍 정확 행사명 검색바 (제목 아래 삽입) */}
      {mode !== "DOWNLOADING" && (
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            width: '60%',
            maxWidth: '600px'
          }}>
            <input
              type="text"
              placeholder="정확한 행사명으로 검색"
              value={exactEventName}
              onChange={(e) => setExactEventName(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
            <button
              onClick={handleExactSearch}
              style={{
                padding: '12px 20px',
                backgroundColor: '#ff7c02',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              검색
            </button>
          </div>
        </div>
      )}


      {/* 메인 레이아웃 */}
      {mode !== "DOWNLOADING" && (
        <div style={{
          display: 'flex',
          gap: '30px',
          padding: '20px 30px',
          maxWidth: '1500px',
          margin: '0 auto'
        }}>
          <div style={{ flex: 1 }}>
            <EventCardList items={currentItems} loading={loading} onRowClick={handleRowClick} />
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

