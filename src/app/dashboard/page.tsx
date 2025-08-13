'use client';
import React, { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Users, Clock, TrendingUp, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [sidebarActive, setSidebarActive] = useState('Home');
  const [loading, setLoading] = useState(true);

  const stats = [
    { title: 'Total Employees', value: '156', icon: Users, color: 'blue' },
    { title: 'Present Today', value: '142', icon: Clock, color: 'green' },
    { title: 'On Leave', value: '8', icon: TrendingUp, color: 'yellow' },
    { title: 'Monthly Payroll', value: '$85,420', icon: DollarSign, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} />
      
      <div className="ml-16 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add more dashboard components */}
      </div>
    </div>
  );
}