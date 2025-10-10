'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Logo } from './Logo';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarActive, setSidebarActive] = useState('Home');
  const pathname = usePathname();

  // Check if current page is login page
  const isLoginPage = pathname === '/login';

  // Update active sidebar item based on current path
  useEffect(() => {
    const pathToItemMap: { [key: string]: string } = {
      '/dashboard': 'Home',
      '/attendance': 'Attendance',
      '/employees': 'Employees',
      '/salary-codes': 'Salary Codes',
      '/salary': 'Salary Calc',
      '/compliance': 'Compliance',
      '/dashboard/payroll': 'Payroll',
      '/superadmin/users': 'User Management',
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Watermark Logo */}
      {!isLoginPage && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <Logo
            width={300}
            height={300}
            opacity={0.1}
            className="object-contain"
          />
        </div>
      )}

      {/* Only show sidebar if not on login page */}
      {!isLoginPage && (
        <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} />
      )}

      {/* Main content area with conditional left margin */}
      <div className={isLoginPage ? '' : 'ml-16 relative z-10'}>
        {children}
      </div>
    </div>
  );
};
