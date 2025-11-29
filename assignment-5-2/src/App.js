import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductCreate from './components/ProductCreate';
import ProductDetail from './components/ProductDetail';
import ProductUpdate from './components/ProductUpdate';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/list" />} />
          <Route path="/list" element={<ProductList />} />
          <Route path="/create" element={<ProductCreate />} />
          <Route path="/detail/:id" element={<ProductDetail />} />
          <Route path="/update/:id" element={<ProductUpdate />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;