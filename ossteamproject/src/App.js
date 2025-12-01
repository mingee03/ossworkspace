import React from 'react';
import EventTable from './components/EventTable';

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', marginTop: '30px', color: '#2c3e50' }}>
        🏛️ 공공데이터 조회 시스템 (Vercel 배포용)
      </h1>
      <hr style={{ width: '80%', margin: '20px auto', border: '0', borderTop: '1px solid #eee' }} />
      
      <EventTable />
    </div>
  );
}

export default App;