import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = "https://6915408484e8bd126af93c35.mockapi.io/products"; 

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/${id}`)
            .then(res => res.json())
            .then(data => setProduct(data));
    }, [id]);

    if (!product) return <div>Loading...</div>;

    return (
        <div className="container">
            <h2>Product Detail</h2>
            <table className="product-table" style={{maxWidth: '500px'}}>
                <tbody>
                    <tr><th>ID</th><td>{product.id}</td></tr>
                    <tr><th>Name</th><td>{product.name}</td></tr>
                    <tr><th>Category</th><td>{product.category}</td></tr>
                    <tr><th>Price</th><td>{product.price.toLocaleString()} 원</td></tr>
                    <tr><th>Stock</th><td>{product.inStock ? '재고 있음' : '품절'}</td></tr>
                </tbody>
            </table>
            <br />
            <button className="btn btn-secondary" onClick={() => navigate('/list')}>Return</button>
            <button className="btn btn-primary" onClick={() => navigate(`/update/${product.id}`)}>Edit</button>
        </div>
    );
}