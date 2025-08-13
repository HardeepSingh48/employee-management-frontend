import React, { useState, useCallback } from 'react';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';

export const ExcelImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setData(jsonData);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    }
  }, []);

  const downloadTemplate = () => {
    const template = [
      {
        'Employee ID': 'EMP001',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@company.com',
        'Phone': '+1-234-567-8900',
        'Designation': 'Software Engineer',
        'Department': 'IT',
        'Basic Salary': 75000
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');
    XLSX.writeFile(wb, 'employee_template.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Employee Import</h2>
        
        <div className="mb-6">
          <Button onClick={downloadTemplate} variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Upload Excel File
            </p>
            <p className="text-gray-500">
              Click to browse or drag and drop your Excel file here
            </p>
          </label>
        </div>

        {isProcessing && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Processing file...</p>
          </div>
        )}

        {data.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Preview ({data.length} employees)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-4 py-2 border-b text-sm text-gray-900">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <p className="text-gray-500 text-sm mt-2">
                  ... and {data.length - 5} more employees
                </p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => console.log('Import data:', data)}>
                Import {data.length} Employees
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};