'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, Calendar, Users, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadResult {
  success: boolean;
  message: string;
  total_records?: number;
  total_sheets?: number;
  errors?: string[];
}

export default function BulkAttendance() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setUploadResult(null); // Clear previous results
        toast({
          title: "File selected",
          description: `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB) has been selected for upload.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !month || !year) {
      toast({
        title: "Missing information",
        description: "Please select a file, month, and year.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', month);
      formData.append('year', year);

      const token = localStorage?.getItem('token');

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/attendance/bulk-mark-excel`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result: UploadResult = await response.json();
      setUploadResult(result);

      if (result.success) {
        toast({
          title: "Upload successful",
          description: result.message || "Attendance data has been uploaded successfully.",
        });

        // Reset form
        setFile(null);
        setMonth('');
        setYear(new Date().getFullYear().toString());

        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: "Upload failed",
          description: result.message || "Failed to upload attendance data.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);

      let errorMessage = "An error occurred while uploading the file.";
      if (error.name === 'AbortError') {
        errorMessage = "Upload timed out. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setUploadResult({
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      });

      toast({
        title: "Upload error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // This would typically trigger a download of a template file
    toast({
      title: "Template Download",
      description: "Contact your administrator to get the attendance template file.",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Bulk Attendance Upload</h2>
        <p className="text-gray-600">
          Upload an Excel file to mark attendance for multiple employees at once.
        </p>
      </div>

      {/* Upload Result Display */}
      {uploadResult && (
        <div className="mb-6">
          <Alert variant={uploadResult.success ? "default" : "destructive"}>
            {uploadResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{uploadResult.message}</p>
                {uploadResult.success && uploadResult.total_records && (
                  <p className="text-sm">
                    Processed {uploadResult.total_records} records from {uploadResult.total_sheets} sheet(s).
                  </p>
                )}
                {!uploadResult.success && uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Errors:</p>
                    <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                      {uploadResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {uploadResult.errors.length > 5 && (
                        <li>... and {uploadResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Excel File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Excel File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {file ? (
                        <span className="text-green-600 font-medium">{file.name}</span>
                      ) : (
                        "Click to select Excel file"
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports .xlsx and .xls files (Max 10MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((monthOption) => (
                      <SelectItem key={monthOption.value} value={monthOption.value}>
                        {monthOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Selection */}
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((yearOption) => (
                      <SelectItem key={yearOption.value} value={yearOption.value}>
                        {yearOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !file || !month || !year}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Attendance Data
                    </>
                  )}
                </Button>
                {/* Add this button temporarily in your form for debugging
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    const token = localStorage?.getItem('token');
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/attendance/debug-columns`, {
                      method: 'POST',
                      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                      body: formData,
                    });
                    const result = await response.json();
                    console.log('Debug result:', result);
                    alert(JSON.stringify(result.debug_info, null, 2));
                  }}
                  disabled={!file}
                >
                  Debug Columns
                </Button> */}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={downloadTemplate}
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              File Format Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Required Columns:</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Employee ID (or Emp ID)</li>
                    <li>• Employee Name (or Name)</li>
                    <li>• Date columns (01/08/2025, 02/08/2025, etc.)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Attendance Values:</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• P = Present</li>
                    <li>• A = Absent</li>
                    <li>• L = Late</li>
                    <li>• H = Half Day</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Important Notes:</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Only employees from your assigned site will be processed</li>
                    <li>• Invalid employee IDs will be skipped</li>
                    <li>• Existing attendance records will be updated</li>
                    <li>• File size limit: 10MB</li>
                    <li>• Multiple sheets in one file are supported</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Need Help?</span>
              </div>
              <p className="text-xs text-blue-700">
                Download the template file or contact your administrator for assistance with the correct format.
                Make sure your Excel file has proper headers and follows the required format.
              </p>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Troubleshooting</span>
              </div>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Ensure Employee IDs match exactly with system records</li>
                <li>• Date columns should be in DD/MM/YYYY format</li>
                <li>• Remove any merged cells or formatting</li>
                <li>• Save as .xlsx for best compatibility</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}