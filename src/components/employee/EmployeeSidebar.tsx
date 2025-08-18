import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth, selectUser } from '@/store/auth-slice';
import {
  Home, 
  Clock, 
  User, 
  DollarSign, 
  LogOut,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppDispatch } from '@/store';

interface EmployeeSidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export default function EmployeeSidebar({ activeItem, onItemClick }: EmployeeSidebarProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  const sidebarItems = [
    { name: 'dashboard', label: 'Dashboard', icon: Home },
    { name: 'attendance', label: 'Attendance', icon: Clock },
    { name: 'profile', label: 'Profile', icon: User },
    { name: 'salary', label: 'Salary', icon: DollarSign },
  ];

  const handleLogout = () => {
    dispatch(clearAuth());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="group fixed left-0 top-0 h-full w-16 hover:w-64 bg-gradient-to-b from-green-900 to-green-800 shadow-lg z-50 transition-all duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-green-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <div className="text-white font-medium text-sm truncate">
                {user?.name || 'Employee'}
              </div>
              <div className="text-green-200 text-xs truncate">
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className={`mx-2 flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                  activeItem === item.name
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-green-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
                onClick={() => onItemClick(item.name)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-green-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-green-100 hover:text-white hover:bg-white hover:bg-opacity-10 px-3"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="ml-3 text-sm opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
              Logout
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
