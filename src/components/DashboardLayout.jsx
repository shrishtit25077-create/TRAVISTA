import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#f4f4f2] flex selection:bg-[#2a7a5a] selection:text-white">
      {/* Travista Fixed Sidebar */}
      <Sidebar />

      {/* Main Perspective Area */}
      <main className="flex-1 ml-[240px] flex flex-col relative z-0 min-h-screen">

        {/* Transparent Top Bar Layer */}
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Full-Bleed Content Layer */}
        <div className="flex-1 px-8 pb-20">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
