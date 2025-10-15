'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarActive, setSidebarActive] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

      {/* Mobile Header */}
      {!isLoginPage && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40 px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="mr-3"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Employee Management</h1>
        </div>
      )}

      {/* Only show sidebar if not on login page */}
      {!isLoginPage && (
        <Sidebar
          activeItem={sidebarActive}
          onItemClick={setSidebarActive}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area with conditional left margin */}
      <div className={`${isLoginPage ? '' : 'md:ml-16'} ${!isLoginPage ? 'pt-16 md:pt-0' : ''} relative z-10`}>
        {children}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
