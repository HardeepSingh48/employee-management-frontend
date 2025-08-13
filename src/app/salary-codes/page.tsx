'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import SalaryCodeForm from '@/components/salary-code/salary-code-form';
import SalaryCodeList from '@/components/salary-code/salary-code-list';

export default function SalaryCodesPage() {
  const [sidebarActive, setSidebarActive] = useState('Salary Codes');
  const [mode, setMode] = useState<'create' | 'list'>('create');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} />
      
      <div className="ml-16">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Salary Code Management</h1>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setMode('create')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  mode === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Create Salary Code
              </button>
              <button
                onClick={() => setMode('list')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  mode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                View Salary Codes
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {mode === 'create' ? (
            <SalaryCodeForm />
          ) : (
            <SalaryCodeList />
          )}
        </div>
      </div>
    </div>
  );
}
