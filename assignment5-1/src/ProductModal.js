import React from 'react';

export default function ProductModal({ 
    show, 
    handleClose, 
    mode, 
    data, 
    onInputChange, 
    onSave, 
    onDelete 
}) {
    if (!show) return null;

    const title = mode === 'add' ? '✨ 새 제품 추가' : `📝 제품 수정 / 삭제 (ID: ${data.id})`;
    const isEditMode = mode === 'edit';
    
    const validate = () => {
        if (!data.name.trim() || !data.price || data.price < 0) {
            alert("제품명과 가격을 정확히 입력하세요.");
            return false;
        }
        return true;
    };
    
    const handleSaveClick = () => {
        if (validate()) {
            onSave();
        }
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={handleClose} style={{ border: 'none', background: 'none', fontSize: '1.2em' }}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="name">Name :</label>
                        <input 
                            type="text"
                            id="name"
                            className="form-control"
                            value={data.name}
                            onChange={onInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category :</label>
                        <input 
                            type="text"
                            id="category"
                            className="form-control"
                            value={data.category}
                            onChange={onInputChange}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="price">Price :</label>
                        <input 
                            type="number"
                            id="price"
                            className="form-control"
                            value={data.price}
                            onChange={onInputChange}
                            min="0"
                        />
                    </div>

                    <div className="form-group" style={{ alignItems: 'flex-start' }}>
                        <label htmlFor="inStock">In Stock :</label>
                        <div style={{ flexGrow: 1 }}>
                            <input 
                                type="checkbox"
                                id="inStock"
                                checked={data.inStock}
                                onChange={onInputChange}
                                style={{ margin: '5px' }}
                            /> 
                            <span>(재고 있음)</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {isEditMode && (
                        <button className="btn btn-danger" onClick={onDelete}>
                            삭제하기
                        </button>
                    )}
                    
                    <button className="btn btn-secondary" onClick={handleClose}>
                        닫기
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveClick}>
                        {isEditMode ? '수정하기' : '저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}