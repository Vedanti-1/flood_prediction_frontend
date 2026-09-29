// src/components/layout/Header.jsx
import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ onMenuToggle }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button
          className="header-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <span className="header-title">AI-Powered Disaster Risk System</span>
      </div>
      <div className="header-right">
        <div className="header-badge">
          <span className="dot" />
          <span>Maharashtra · Live</span>
        </div>
      </div>
    </header>
  );
};

export default Header;