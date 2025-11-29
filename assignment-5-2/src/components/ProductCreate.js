import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://6915408484e8bd126af93c35.mockapi.io/products"; 

export default function ProductCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', category: '', price: 0, inStock: false
    });
    const nameRef = useRef();
    const priceRef = useRef();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : (name === 'price' ? Number(value) : value)
        });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert("제품명을 입력해주세요.");
            nameRef.current.focus(); 
            return;
        }
        if (formData.price < 0) {
            alert("가격은 0 이상이어야 합니다.");
            priceRef.current.focus();
            return;
        }

        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        navigate('/list');
    };

    return (
        <div className="container">
            <h2>Add new Product</h2>
            <div className="form-group">
                <label>Name:</label>
                <input 
                    name="name" 
                    ref={nameRef}
                    value={formData.name} 
                    onChange={handleChange} 
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Category:</label>
                <input 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Price:</label>
                <input 
                    type="number" 
                    name="price" 
                    ref={priceRef}
                    value={formData.price} 
                    onChange={handleChange} 
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>In Stock:</label>
                <input 
                    type="checkbox" 
                    name="inStock" 
                    checked={formData.inStock} 
                    onChange={handleChange} 
                />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
            <button className="btn btn-secondary" onClick={() => navigate('/list')}>Cancel</button>
        </div>
    );
}