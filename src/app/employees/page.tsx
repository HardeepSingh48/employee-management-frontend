'use client';
import React, { useState } from 'react';
import EmployeeRegistrationForm from '@/components/employee/employee-form';
import { ExcelImport } from '@/components/employee/excel-import';
import EmployeeSkillFix from '@/components/employee/EmployeeSkillFix';

export default function EmployeesPage() {
  const [mode, setMode] = useState<'manual' | 'excel' | 'fix'>('manual');

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Employee Management</h1>

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
              <button
                onClick={() => setMode('fix')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  mode === 'fix'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Fix Skill Categories
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {mode === 'manual' && <EmployeeRegistrationForm />}
          {mode === 'excel' && <ExcelImport />}
          {mode === 'fix' && <EmployeeSkillFix />}
        </div>
    </div>
  );
}