import React from 'react';

function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md", icon }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in p-4">
      <div className={`bg-white p-8 rounded-xl shadow-lg ${maxWidth} w-full relative border border-gray-100`}>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        {title && (
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            {icon && (
              <span className="p-2 bg-blue-50 rounded-lg">
                {icon}
              </span>
            )}
            {title}
          </h3>
        )}
        
        {children}
      </div>
    </div>
  );
}

export default Modal;
