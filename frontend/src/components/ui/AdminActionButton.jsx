// src/components/ui/AdminActionButton.jsx

import React from 'react';

const AdminActionButton = ({ onClick, icon: text, disabled = false }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (!disabled) {
      onClick();
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="flex items-center text-sm text-dark-gray hover:text-blue font-medium transition-colors"
      aria-disabled={disabled}
    >
      <Icon className="w-[1rem] h-[1rem] mr-[0.5rem]" />
      {text}
    </a>
  );
};

export default AdminActionButton;