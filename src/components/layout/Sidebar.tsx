import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth, selectUser } from '@/store/auth-slice';
import {
  Home, Users, Calendar, Clock, TrendingUp,
  MoreHorizontal, Briefcase, User, DollarSign, Calculator, LogOut, Receipt, Shield, Settings, X, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppDispatch } from '@/store';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  userRole?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, userRole, className = '', isOpen = true, onClose }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  // Role-based sidebar items
const getSidebarItems = () => {
    const role = userRole || user?.role;

    // Define the base items for an admin
const adminItems = [
      { name: 'Home', icon: Home, path: '/dashboard' },
      { name: 'Attendance', icon: Users, path: '/attendance' },
      { name: 'Employees', icon: User, path: '/employees' },
      { name: 'ID Cards', icon: CreditCard, path: '/employees/id-cards' },
      // { name: 'Salary Codes', icon: DollarSign, path: '/salary-codes' },
      { name: 'Salary Calc', icon: Calculator, path: '/salary' },
      { name: 'Compliance', icon: Shield, path: '/compliance' },
      { name: 'Payroll', icon: Receipt, path: '/dashboard/payroll' },
      // { name: 'Sites', icon: Calendar, path: '/sites' },
      { name: 'Deductions', icon: DollarSign, path: '/dashboard/deductions' },
      // { name: 'Reports', icon: Briefcase, path: '/reports' },
    ];
    
    switch (role) {
      case 'supervisor':
        return [
          { name: 'Dashboard', icon: Home, path: '/supervisor/dashboard' },
          { name: 'Mark Attendance', icon: Clock, path: '/supervisor/dashboard?tab=individual' },
          // { name: 'Bulk Attendance', icon: Users, path: '/supervisor/dashboard?tab=bulk' },
          { name: 'Attendance Records', icon: Calendar, path: '/supervisor/dashboard?tab=records' },
          { name: 'Salary Report', icon: Calculator, path: '/supervisor/dashboard?tab=salary' },
          { name: 'Deductions', icon: DollarSign, path: '/dashboard/deductions' },
          // { name: 'Salary', icon: Calculator, path: '/salary' },
          { name: 'Compliance', icon: Shield, path: '/compliance' },
          { name: 'Payroll', icon: Receipt, path: '/dashboard/payroll' }
        ];
      case 'employee':
        return [
          { name: 'Dashboard', icon: Home, path: '/employee/dashboard' },
          { name: 'Attendance', icon: Clock, path: '/employee/attendance' },
          { name: 'Profile', icon: User, path: '/employee/profile' },
          { name: 'Salary', icon: DollarSign, path: '/employee/salary' }
        ];
      case 'superadmin':
        // Return all admin items PLUS the new User Management item
        return [
            ...adminItems,
            { name: 'Sites', icon: Calendar, path: '/sites' },
            { name: 'Salary Codes', icon: DollarSign, path: '/salary-codes' },
            { name: 'User Management', icon: Settings, path: '/superadmin/users' },
        ];
      case 'admin':
      default:
        // Default case just returns the admin items
        return adminItems;
    }
  };

  const sidebarItems = getSidebarItems();

  const handleItemClick = (item: { name: string; path: string }) => {
    onItemClick(item.name);
    
    // For supervisor, handle tab navigation within the dashboard
    if (userRole === 'supervisor' && item.path.includes('?tab=')) {
      const tab = item.path.split('?tab=')[1];
      // Update the active tab in the parent component
      onItemClick(tab);
      // Navigate to supervisor dashboard with the tab
      router.push(`/supervisor/dashboard?tab=${tab}`);
    } else {
      router.push(item.path);
    }
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className={`group fixed left-0 top-0 h-full bg-gradient-to-b from-red-900 to-red-800 shadow-lg z-50 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'translate-x-0 w-64' : 'translate-x-[-100%] w-64'} md:translate-x-0 md:w-16 md:hover:w-48 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Close Button for Mobile */}
        {isOpen && (
          <div className="md:hidden p-2 border-b border-red-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-full justify-center text-white hover:bg-red-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* User Info */}
        <div className="p-4 border-b border-red-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className={`opacity-0 translate-x-[-10px] transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : ''} md:opacity-0 md:translate-x-[-10px] md:group-hover:opacity-100 md:group-hover:translate-x-0`}>
              <div className="text-white font-medium text-sm truncate">
                {user?.name || 'Admin'}
              </div>
              <div className="text-red-200 text-xs truncate">
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`mx-2 flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                  activeItem === item.name
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`text-sm font-medium opacity-0 translate-x-[-10px] transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 translate-x-0' : ''} md:opacity-0 md:translate-x-[-10px] md:group-hover:opacity-100 md:group-hover:translate-x-0`}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-red-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-100 hover:text-white hover:bg-white hover:bg-opacity-10 px-3"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={`ml-3 text-sm opacity-0 translate-x-[-10px] transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 translate-x-0' : ''} md:opacity-0 md:translate-x-[-10px] md:group-hover:opacity-100 md:group-hover:translate-x-0`}>
              Logout
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
