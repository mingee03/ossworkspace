import React, { useState, useEffect } from 'react';
import ProductModal from './ProductModal';

const API_URL = "https://6915408484e8bd126af93c35.mockapi.io/products"; 

const initialFormData = {
    id: null,
    name: '',
    category: '',
    price: 0,
    inStock: false
};

export default function ShowList() {
    const [products, setProducts] = useState([]); 
    const [showModal, setShowModal] = useState(false); 
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError('데이터를 불러오는 데 실패했습니다.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEditClick = (product) => {
        setFormData(product);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleAddClick = () => {
        setFormData(initialFormData);
        setModalMode('add');
        setShowModal(true);
    };
    
    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) 
        }));
    };

    const handleSave = async (data) => {
        const isUpdate = data.id && modalMode === 'edit';
        const url = isUpdate ? `${API_URL}/${data.id}` : API_URL;
        const method = isUpdate ? 'PUT' : 'POST'; 
        
        const payload = isUpdate ? data : { ...data, id: undefined };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.status === 200 || response.status === 201) {
                handleModalClose();
                fetchProducts();
            } else {
                throw new Error(`Save failed with status: ${response.status}`);
            }
        } catch (err) {
            setError('데이터 저장/수정에 실패했습니다.');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`[ID: ${id}] 제품을 정말 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                handleModalClose();
                fetchProducts();
            } else {
                throw new Error(`Delete failed with status: ${response.status}`);
            }
        } catch (err) {
            setError('데이터 삭제에 실패했습니다.');
            console.error(err);
        }
    };


    return (
        <div className="container">
            <h1>제품 목록</h1>
            
            {error && <div className="alert-error">{error}</div>}

            <button className="btn btn-primary" onClick={handleAddClick}>
                새 제품 추가하기
            </button>
            <button className="btn btn-secondary" onClick={fetchProducts} style={{ marginLeft: '10px' }}>
                목록 새로고침
            </button>

            <table className="product-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price (원)</th>
                        <th>In Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td style={{ textAlign: 'left' }}>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{product.price.toLocaleString()}</td>
                            <td>{product.inStock ? '재고 있음' : '재고 없음'}</td>
                            <td>
                                <button 
                                    className="btn btn-info" 
                                    style={{ padding: '4px 8px' }} 
                                    onClick={() => handleEditClick(product)}
                                >
                                    수정/삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <ProductModal
                show={showModal}
                handleClose={handleModalClose}
                mode={modalMode}
                data={formData}
                onInputChange={handleInputChange}
                onSave={() => handleSave(formData)} 
                onDelete={() => handleDelete(formData.id)}
            />
        </div>
    );
}