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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-[220px] hidden lg:block">
        <Sidebar isOpen={true} onClose={closeSidebar} />
      </aside>

      {/* Mobile sidebar (Drawer) */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      </div>

      {/* Main Scroll Container */}
      <main className="ml-0 lg:ml-[220px] flex-1 h-screen overflow-y-auto min-h-0 flex flex-col relative w-full bg-[#fcfdfe] dark:bg-slate-950">
        <div className="shrink-0 sticky top-0 z-[100] w-full">
          <Navbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onMenuClick={() => setSidebarOpen(o => !o)}
          />
        </div>
        <div className="flex-1 min-h-0 relative">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
