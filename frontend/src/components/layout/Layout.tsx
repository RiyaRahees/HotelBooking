import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col">
      {/* Fixed Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          collapsed={collapsed}
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
        />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all duration-300 ${
            collapsed ? 'lg:pl-24' : 'lg:pl-68'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
