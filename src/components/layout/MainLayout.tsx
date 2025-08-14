'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarActive, setSidebarActive] = useState('Home');
  const pathname = usePathname();

  // Update active sidebar item based on current path
  useEffect(() => {
    const pathToItemMap: { [key: string]: string } = {
      '/dashboard': 'Home',
      '/attendance': 'Attendance',
      '/employees': 'Employees',
      '/salary-codes': 'Salary Codes',
      '/leave': 'Leave',
      '/timesheet': 'Timesheet',
      '/performance': 'Performance',
      '/reports': 'Reports',
      '/more': 'More'
    };

    // Find the matching item or default to Home
    const activeItem = pathToItemMap[pathname] || 'Home';
    setSidebarActive(activeItem);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} />
      
      {/* Main content area with left margin to account for sidebar */}
      <div className="ml-16">
        {children}
      </div>
    </div>
  );
};
