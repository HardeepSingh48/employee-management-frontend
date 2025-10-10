'use client';
import React, { useState } from 'react';
import EmployeeRegistrationForm from '@/components/employee/employee-form';
import { ExcelImport } from '@/components/employee/excel-import';
import EmployeeSkillFix from '@/components/employee/EmployeeSkillFix';
import EmployeeList from '@/components/employee/EmployeeList';
import { Logo } from '@/components/layout/Logo';

export default function EmployeesPage() {
  const [mode, setMode] = useState<'manual' | 'excel' | 'fix' | 'list'>('manual');

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Logo width={32} height={32} />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Employee Management</h1>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => setMode('manual')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base flex-1 sm:flex-none ${
                  mode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setMode('excel')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base flex-1 sm:flex-none ${
                  mode === 'excel'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Excel Import
              </button>
              <button
                onClick={() => setMode('list')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base flex-1 sm:flex-none ${
                  mode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List Employees
              </button>
              {/* <button
                onClick={() => setMode('fix')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base flex-1 sm:flex-none ${
                  mode === 'fix'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Fix Skill Categories
              </button> */}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {mode === 'manual' && <EmployeeRegistrationForm />}
          {mode === 'excel' && <ExcelImport />}
          {mode === 'fix' && <EmployeeSkillFix />}
          {mode === 'list' && <EmployeeList />}
        </div>
    </div>
  );
}