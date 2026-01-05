'use client';
import React, { useState } from 'react';
import SalaryCodeForm from '@/components/salary-code/salary-code-form';
import SalaryCodeList from '@/components/salary-code/salary-code-list';
import SalaryCodeBulkImport from '@/components/salary-code/salary-code-bulk-import';
import { Logo } from '@/components/layout/Logo';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/auth-slice';

export default function SalaryCodesPage() {
  const user = useSelector(selectUser);
  const role = user?.role;
  const [mode, setMode] = useState<'create' | 'list' | 'bulk'>((['admin', 'admin1', 'admin2', 'superadmin'].includes(role || '')) ? 'list' : 'create');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo width={32} height={32} />
            <h1 className="text-xl font-semibold text-gray-800">Salary Code Management</h1>
          </div>

          <div className="flex space-x-4">

            {
              ['admin1', 'superadmin'].includes(role || '') && (

                <button
                  onClick={() => setMode('create')}
                  className={`px-4 py-2 rounded-lg font-medium ${mode === 'create'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Create Salary Code
                </button>
              )
            }
            <button
              onClick={() => setMode('list')}
              className={`px-4 py-2 rounded-lg font-medium ${mode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              View Salary Codes
            </button>

            {['admin1', 'superadmin'].includes(role || '') && (

              <button
                onClick={() => setMode('bulk')}
                className={`px-4 py-2 rounded-lg font-medium ${mode === 'bulk'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Bulk Import
              </button>

            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {mode === 'create' && ['admin1', 'superadmin'].includes(role || '') && <SalaryCodeForm />}
        {mode === 'list' && <SalaryCodeList />}
        {mode === 'bulk' && ['admin1', 'superadmin'].includes(role || '') && <SalaryCodeBulkImport />}
      </div>
    </div>
  );
}
