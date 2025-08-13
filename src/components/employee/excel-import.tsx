import React, { useState, useCallback } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';

interface ImportResult {
  success: boolean;
  summary?: {
    inserted: number;
    errors: Array<{
      sheet: string;
      row_index: number;
      error: string;
    }>;
  };
  message?: string;
}

export const ExcelImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

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
        'Full Name': 'John Doe',
        'Date of Birth': '1990-01-15',
        'Gender': 'Male',
        'Marital Status': 'Single',
        'Nationality': 'Indian',
        'Blood Group': 'O+',
        'Permanent Address': '123 Main Street, Delhi',
        'Mobile Number': '9876543210',
        'Alternate Contact Number': '9876543211',
        'Aadhaar Number': '123456789012',
        'PAN Card Number': 'ABCDE1234F',
        'Voter ID / Driving License': 'DL123456789',
        'UAN': '123456789012',
        'ESIC Number': '1234567890',
        'Bank Account Number': '1234567890123456',
        'Bank Name': 'State Bank of India',
        'IFSC Code': 'SBIN0001234',
        'Salary Code': 'DELENGINEERDELHI',
        'Date of Joining': '2023-01-01',
        'Employment Type': 'Full-time',
        'Department': 'IT',
        'Designation': 'Software Engineer',
        'Work Location': 'Delhi Office',
        'Reporting Manager': 'Manager Name',
        'Skill Category': 'Skilled',
        'Salary Advance/Loan': '0',
        'PF Applicability': 'No',
        'ESIC Applicability': 'No',
        'Professional Tax Applicability': 'No',
        'Experience Duration': '5',
        'Highest Qualification': "Bachelor's",
        'Year of Passing': '2012',
        'Additional Certifications': 'AWS Certified',
        'Emergency Contact Name': 'Emergency Contact',
        'Emergency Relationship': 'Father',
        'Emergency Phone Number': '9876543212'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');
    XLSX.writeFile(wb, 'employee_bulk_import_template.xlsx');
  };

  const handleImport = async () => {
    if (!file || data.length === 0) {
      alert('Please upload a file first');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/employees/bulk-upload`, {
        method: 'POST',
        body: formData,
      });

      const result: ImportResult = await response.json();
      setImportResult(result);

      if (result.success && result.summary) {
        if (result.summary.inserted > 0) {
          alert(`Successfully imported ${result.summary.inserted} employees!`);
        }
        if (result.summary.errors.length > 0) {
          console.warn('Import errors:', result.summary.errors);
        }
      } else {
        alert(`Import failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error importing employees:', error);
      setImportResult({
        success: false,
        message: 'Network error occurred during import'
      });
      alert('Error importing employees. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Employee Import</h2>

        {/* Instructions Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              How to Use Bulk Import
            </h3>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              {showInstructions ? (
                <>Hide <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>Show <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </div>

          {showInstructions && (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">1. Download Template</h4>
                  <p className="text-xs text-blue-700">Get the Excel template with sample data</p>
                </div>

                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">2. Fill Data</h4>
                  <p className="text-xs text-blue-700">Replace sample data with employee info</p>
                </div>

                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">3. Upload & Import</h4>
                  <p className="text-xs text-blue-700">Upload file and review before importing</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <h4 className="font-medium text-yellow-800 mb-2 text-sm">Important Notes:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• <strong>Full Name</strong> required (splits into first/last name)</li>
                  <li>• <strong>Department:</strong> HR, IT, Finance, Marketing, Operations, Sales, Engineering, Customer Support, Legal, Administration</li>
                  <li>• <strong>Marital Status:</strong> Single, Married, Divorced, Widowed</li>
                  <li>• <strong>Employment Type:</strong> Full-time, Part-time, Contract, Intern</li>
                  <li>• <strong>Boolean fields:</strong> TRUE or FALSE (PF, ESIC, Professional Tax)</li>
                  <li>• <strong>Dates:</strong> YYYY-MM-DD format</li>
                </ul>
              </div>
            </>
          )}
        </div>

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
            
            <div className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setData([]);
                  setFile(null);
                  setImportResult(null);
                }}
              >
                Clear
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${data.length} Employees`}
              </Button>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="mt-6">
            <div className={`p-4 rounded-lg ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <h4 className={`font-semibold ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  Import {importResult.success ? 'Completed' : 'Failed'}
                </h4>
              </div>

              {importResult.summary && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>Successfully imported:</strong> {importResult.summary.inserted} employees
                  </p>

                  {importResult.summary.errors.length > 0 && (
                    <div>
                      <p className="text-sm text-red-700 font-medium mb-2">
                        Errors ({importResult.summary.errors.length}):
                      </p>
                      <div className="max-h-40 overflow-y-auto">
                        {importResult.summary.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-100 p-2 rounded mb-1">
                            <strong>Row {error.row_index + 1}:</strong> {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {importResult.message && !importResult.summary && (
                <p className="text-sm text-gray-700">{importResult.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Field Reference */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Reference</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Required Fields</h4>
              <div className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                <div>• Full Name</div>
                <div>• Date of Birth</div>
                <div>• Gender</div>
                <div>• Marital Status</div>
                <div>• Permanent Address</div>
                <div>• Mobile Number</div>
                <div>• Aadhaar Number</div>
                <div>• PAN Card Number</div>
                <div>• Date of Joining</div>
                <div>• Employment Type</div>
                <div>• Department</div>
                <div>• Designation</div>
                <div>• Work Location</div>
                <div>• Salary Code</div>
                <div>• Bank Account Number</div>
                <div>• Bank Name</div>
                <div>• IFSC Code</div>
                <div>• Highest Qualification</div>
                <div>• Year of Passing</div>
                <div>• Experience Duration</div>
                <div>• Emergency Contact Name</div>
                <div>• Emergency Relationship</div>
                <div>• Emergency Phone Number</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">Optional Fields</h4>
              <div className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                <div>• Nationality (defaults to Indian)</div>
                <div>• Blood Group</div>
                <div>• Alternate Contact Number</div>
                <div>• Voter ID / Driving License</div>
                <div>• UAN</div>
                <div>• ESIC Number</div>
                <div>• Reporting Manager</div>
                <div>• Skill Category</div>
                <div>• PF Applicability (defaults to FALSE)</div>
                <div>• ESIC Applicability (defaults to FALSE)</div>
                <div>• Professional Tax Applicability (defaults to FALSE)</div>
                <div>• Salary Advance/Loan (defaults to 0)</div>
                <div>• Additional Certifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};