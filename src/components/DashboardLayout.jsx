import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Content column — offsets fixed sidebar on desktop */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen lg:pl-[220px]">

        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onMenuClick={() => setSidebarOpen(o => !o)}
        />

        <main className="flex-1 min-w-0 overflow-x-hidden w-full">
          <div className="flex-1 min-w-0 w-full">
            <Outlet context={{ searchTerm, setSearchTerm }} />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
