import React, { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const DashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
