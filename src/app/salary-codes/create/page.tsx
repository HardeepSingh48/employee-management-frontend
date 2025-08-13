'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import SalaryCodeForm from '@/components/salary-code/salary-code-form';

export default function SalaryCodeCreatePage() {
  const [sidebarActive, setSidebarActive] = useState('Salary Codes');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} />
      
      <div className="ml-16">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Salary Code Management</h1>
          </div>
        </div>

        <div className="p-6">
          <SalaryCodeForm />
        </div>
      </div>
    </div>
  );
}
