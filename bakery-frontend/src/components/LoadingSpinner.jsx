import React from 'react';

// Spinner cơ bản cho nút nhấn
export const Spinner = ({ size = 20, color = 'white' }) => {
    return (
        <div 
            className="spinner" 
            style={{ 
                width: size, 
                height: size, 
                borderColor: `rgba(255,255,255, 0.3)`, 
                borderTopColor: color 
            }}
        ></div>
    );
};

// Component tiện ích cho nút nhấn có loading
export const ButtonLoading = ({ isLoading, disabled, children, ...props }) => {
    return (
        <button disabled={isLoading || disabled} {...props} className={`btn-loading ${props.className || ''}`}>
            {isLoading ? <Spinner /> : children}
        </button>
    );
};

// Skeleton Placeholder cho lưới sản phẩm
export const ProductSkeleton = () => {
    return (
        <div className="product-card skeleton-card">
            <div className="skeleton skeleton-img"></div>
            <div className="card-info">
                <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: '10px' }}></div>
                <div className="skeleton skeleton-btn" style={{ marginTop: '15px' }}></div>
            </div>
        </div>
    );
};
