import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    // Flex root so sidebar + content sit side-by-side on desktop
    <div className="flex min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/*
        Content area:
        - flex-1 fills ALL remaining width beside the fixed sidebar
        - min-w-0 prevents flex children from overflowing
        - lg:pl-[260px] compensates for the fixed sidebar (not in flow)
      */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen lg:pl-[220px]">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onMenuClick={() => setSidebarOpen(o => !o)}
        />
        <main className="flex-1 min-w-0 overflow-x-hidden w-full">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
