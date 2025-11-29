import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = "https://6915408484e8bd126af93c35.mockapi.io/products"; 

export default function ProductUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '', category: '', price: 0, inStock: false
    });
    
    const [editCount, setEditCount] = useState(0);

    const nameRef = useRef();

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await fetch(`${API_URL}/${id}`);
            const data = await res.json();
            setFormData(data);
        };
        fetchProduct();
    }, [id]);

    const handleRealTimeUpdate = async (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : (name === 'price' ? Number(value) : value);

        const updatedData = { ...formData, [name]: newValue };
        setFormData(updatedData);

        if (name === 'name' && !newValue.trim()) {
           nameRef.current.style.borderColor = 'red';
        } else if (name === 'name') {
           nameRef.current.style.borderColor = '#ccc';
        }

        setEditCount(prev => prev + 1);

        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            console.log("Auto-saved:", name, newValue);
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    return (
        <div className="container">
            <h2>제품 수정 (ID: {id})</h2>
            
            <div className="alert-error" style={{background: '#e2e3e5', color: '#333'}}>
                페이지 로딩 후 수정 횟수: <strong>{editCount}</strong> 회
                <br/>
                <small>(값을 변경하면 즉시 서버에 저장됩니다)</small>
            </div>

            <div className="form-group">
                <label>Name:</label>
                <input 
                    name="name" 
                    ref={nameRef}
                    value={formData.name} 
                    onChange={handleRealTimeUpdate} 
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Category:</label>
                <input 
                    name="category" 
                    value={formData.category} 
                    onChange={handleRealTimeUpdate} 
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Price:</label>
                <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleRealTimeUpdate} 
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>In Stock:</label>
                <input 
                    type="checkbox" 
                    name="inStock" 
                    checked={formData.inStock} 
                    onChange={handleRealTimeUpdate} 
                /> (체크 시 즉시 저장)
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/list')}>
                Return to List
            </button>
        </div>
    );
}