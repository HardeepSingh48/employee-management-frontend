// Temporary test component to debug the data structure
'use client';

import React, { useEffect, useState } from 'react';
import { employeeService } from '@/lib/employee-service';
import { DebugEmployeeModal } from '@/components/ui/modals/DebugEmployeeModal';

export default function TestEmployeeList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugEmployee, setDebugEmployee] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await employeeService.getEmployees();
        console.log('Raw employee data from API:', data);
        setEmployees(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const openDebug = (employee: any) => {
    console.log('Selected employee for debug:', employee);
    setDebugEmployee(employee);
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading employees...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Debug: Employee Data Structure</h2>
        <p className="text-gray-600 mt-1">Click "Debug Data" to see the actual data structure</p>
      </div>
      <div className="p-6">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No employees found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fields Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map(emp => (
                  <tr key={emp.employee_id || emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emp.employee_id || emp.id || 'No ID'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emp.first_name || emp.firstName || 'N/A'} {emp.last_name || emp.lastName || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.keys(emp).length} fields
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => openDebug(emp)} 
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                      >
                        Debug Data
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Modal */}
      <DebugEmployeeModal
        isOpen={!!debugEmployee}
        onClose={() => setDebugEmployee(null)}
        employee={debugEmployee}
      />
    </div>
  );
}