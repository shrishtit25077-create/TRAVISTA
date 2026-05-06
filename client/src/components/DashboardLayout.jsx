import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="layout-root">
      <Sidebar />
      <div className="main-content">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </div>
    </div>
  );
};

export default DashboardLayout;
