'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import  EmployeeRegistrationForm  from '@/components/employee/employee-form';
import { ExcelImport } from '@/components/employee/excel-import';

export default function EmployeeRegisterPage() {
  const [sidebarActive, setSidebarActive] = useState('Employees');
  const [mode, setMode] = useState<'manual' | 'excel'>('manual');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} />
      
      
      <div className="ml-16">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Employee Registration</h1>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setMode('manual')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  mode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setMode('excel')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  mode === 'excel'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Excel Import
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {mode === 'manual' ? <EmployeeRegistrationForm /> : <ExcelImport />}
        </div>
      </div>
    </div>
  );
}