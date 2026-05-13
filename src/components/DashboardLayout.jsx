import React, { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Lock scroll ONLY when mobile sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.removeProperty('overflow');
    }
    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, [sidebarOpen]);

  return (
    /*
      Layout root: h-screen + overflow-hidden ONLY here.
      This creates the viewport boundary.
      body/html/root have NO overflow:hidden (that kills scroll events).
    */
    <div className="flex h-screen overflow-hidden bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-300">

      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — rendered fixed inside, always on screen */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/*
        Right column:
        - flex-col to stack navbar + main vertically
        - lg:pl-[220px] offsets fixed sidebar width
        - h-screen so column matches viewport height exactly
        - overflow-hidden clips the column (not the scroll)
      */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-[220px] h-screen overflow-hidden">

        {/* Navbar: shrink-0 so it never shrinks or scrolls away */}
        <div className="shrink-0">
          <Navbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onMenuClick={() => setSidebarOpen(o => !o)}
          />
        </div>

        {/*
          THE KEY FIX:
          flex-1     → takes all remaining height after navbar
          min-h-0    → REQUIRED for flex children to be scrollable;
                       without this, flex-1 grows past parent height
                       and overflow-y-auto never triggers
          overflow-y-auto → this element scrolls, nothing else does
        */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
