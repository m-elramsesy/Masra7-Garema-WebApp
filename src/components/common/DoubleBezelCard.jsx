import React from 'react';

export function DoubleBezelCard({ children, className = '', innerClassName = '', onClick }) {
  return (
    <div className={`double-bezel ${className}`} onClick={onClick}>
      <div className={`double-bezel-inner ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
