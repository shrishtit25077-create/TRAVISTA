import React from 'react';
import { Search, Bell } from 'lucide-react';

const Navbar = ({ searchTerm, setSearchTerm }) => (
  <div className="top-navbar">
    <div className="navbar-search">
      <Search className="search-icon" />
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search destinations, stays, experiences..."
      />
    </div>
    <button style={{
      width: 38, height: 38,
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <Bell size={16} color="#94a3b8" />
    </button>
  </div>
);

export default Navbar;
