// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Home,
  Waves,
  BarChart3,
  Brain,
  Info,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/risk-map', label: 'Risk Map', icon: MapPin },
  { path: '/relocation', label: 'Relocation Planning', icon: Home },
  { path: '/flood-history', label: 'Flood History', icon: Waves },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/ml-model', label: 'ML Model', icon: Brain },
  { path: '/about', label: 'About', icon: Info },
];

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">⚠</div>
          <div className="sidebar-brand-text">
            Disaster Risk
            <small>Relocation Planning System</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <item.icon className="icon" size={20} strokeWidth={2} />
              <span className="label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div>v1.0 · Maharashtra, India</div>
          <div style={{ marginTop: '2px', opacity: 0.6 }}>
            AI-Powered Decision Support
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;