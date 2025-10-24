import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Componente Modale Generico e Riutilizzabile
 */
const Modal = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    // Overlay
    <div
      className="fixed inset-0 bg-antracite/70 backdrop-blur-lg flex items-center justify-center p-[1rem] z-[999999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Contenitore della card */}
      <div
        className={`bg-white rounded-lg shadow-2xl w-full ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;