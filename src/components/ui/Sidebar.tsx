import React from 'react';
import { 
  Home, Users, Calendar, Clock, TrendingUp, 
  MoreHorizontal, Briefcase, User 
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const sidebarItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Attendance', icon: Users, path: '/attendance' },
    { name: 'Employees', icon: User, path: '/employees' },
    { name: 'Leave', icon: Calendar, path: '/leave' },
    { name: 'Timesheet', icon: Clock, path: '/timesheet' },
    { name: 'Performance', icon: TrendingUp, path: '/performance' },
    { name: 'Reports', icon: Briefcase, path: '/reports' },
    { name: 'More', icon: MoreHorizontal, path: '/more' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-gradient-to-b from-blue-900 to-blue-800 shadow-lg z-50">
      <div className="flex flex-col items-center py-4 space-y-6">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                activeItem === item.name
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => onItemClick(item.name)}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          );
        })}
      </div>
    </div>
  );
};