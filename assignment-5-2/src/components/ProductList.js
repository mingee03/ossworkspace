import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://6915408484e8bd126af93c35.mockapi.io/products"; 

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchProducts();
        }
    };

    return (
        <div>
            <h1>제품 목록</h1>
            <button className="btn btn-primary" onClick={() => navigate('/create')}>
                Add new Product
            </button>
            
            <table className="product-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>
                                <button className="btn btn-info" onClick={() => navigate(`/detail/${p.id}`)}>
                                    Detail
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate(`/update/${p.id}`)}>
                                    Edit
                                </button>
                                <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}