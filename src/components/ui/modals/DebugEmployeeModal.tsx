// Debug version to help identify the issue
// Add this temporary component to see what data is being received

import React from 'react';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export const DebugEmployeeModal: React.FC<DebugModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Debug: Employee Data Structure
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Employee ID: {employee.employee_id}</h3>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">All Available Fields:</h4>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(employee, null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Field Names:</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {Object.keys(employee).map(key => (
                  <div key={key} className="bg-blue-100 px-2 py-1 rounded">
                    {key}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Common Field Mappings:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {employee.first_name} {employee.last_name}
                </div>
                <div>
                  <strong>Phone:</strong> {employee.phone_number || employee.mobileNumber || 'Not found'}
                </div>
                <div>
                  <strong>Email:</strong> {employee.email || 'Not found'}
                </div>
                <div>
                  <strong>Department:</strong> {employee.department_id || employee.department || 'Not found'}
                </div>
                <div>
                  <strong>DOB:</strong> {employee.date_of_birth || employee.dateOfBirth || 'Not found'}
                </div>
                <div>
                  <strong>Address:</strong> {employee.address || employee.permanentAddress || 'Not found'}
                </div>
                <div>
                  <strong>Aadhaar:</strong> {employee.adhar_number || employee.aadhaarNumber || 'Not found'}
                </div>
                <div>
                  <strong>PAN:</strong> {employee.pan_card_number || employee.panCardNumber || 'Not found'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};