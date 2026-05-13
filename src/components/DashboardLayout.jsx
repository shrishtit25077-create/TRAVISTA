import React, { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    // Root: full viewport, flex row — body never scrolls
    <div className="flex h-screen overflow-hidden bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-300">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — fixed to left, always visible, never scrolls with content */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Right column: takes all remaining width, flex column */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-[220px] h-screen">

        {/* Navbar — always visible at top, never scrolls away */}
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onMenuClick={() => setSidebarOpen(o => !o)}
        />

        {/*
          Main scroll area — THIS is the ONLY thing that scrolls.
          flex-1 + min-h-0 forces it to fill remaining height inside
          the flex column without growing beyond the viewport.
          overflow-y-auto gives it its own scroll track.
        */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
