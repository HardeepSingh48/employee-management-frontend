'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, FileSpreadsheet, Users, Download } from 'lucide-react';
import { attendanceService } from '@/lib/attendance-service';

export default function BulkAttendance() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an Excel file (.xlsx or .xls)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // For now, we'll show a placeholder message
      // In a real implementation, you'd parse the Excel file and call the bulk API
      toast({
        title: 'Feature Coming Soon',
        description: 'Excel import functionality will be available soon',
      });
      
      // Placeholder for actual implementation:
      // const attendanceData = await parseExcelFile(file);
      // const result = await attendanceService.bulkMarkAttendance({
      //   attendance_records: attendanceData,
      //   marked_by: 'admin'
      // });
      // setUploadResults(result);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to process the Excel file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = `Employee ID,Date,Status,Check In Time,Check Out Time,Overtime Hours,Remarks
EMP001,2024-08-14,Present,09:00,17:00,0,
EMP002,2024-08-14,Late,09:30,17:00,0,Traffic delay
EMP003,2024-08-14,Absent,,,0,Sick leave`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: 'Attendance template has been downloaded',
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Excel Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Bulk Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Excel File Upload
              </CardTitle>
              <CardDescription>
                Upload an Excel file with attendance data for multiple employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Download */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Download Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Get the Excel template with the correct format
                  </p>
                </div>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="attendance-file">Upload Attendance File</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="attendance-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="flex-1"
                  />
                  {isUploading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: .xlsx, .xls (Max size: 10MB)
                </p>
              </div>

              {/* Upload Instructions */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">File Format Instructions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Column A: Employee ID (required)</li>
                  <li>• Column B: Date (YYYY-MM-DD format, required)</li>
                  <li>• Column C: Status (Present/Absent/Late/Half Day, required)</li>
                  <li>• Column D: Check In Time (HH:MM format, optional)</li>
                  <li>• Column E: Check Out Time (HH:MM format, optional)</li>
                  <li>• Column F: Overtime Hours (number, optional)</li>
                  <li>• Column G: Remarks (text, optional)</li>
                </ul>
              </div>

              {/* Upload Results */}
              {uploadResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upload Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {uploadResults.successful_count}
                        </p>
                        <p className="text-sm text-muted-foreground">Successful</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {uploadResults.total_count - uploadResults.successful_count}
                        </p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manual Bulk Entry
              </CardTitle>
              <CardDescription>
                Manually enter attendance for multiple employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Manual bulk entry form will be available soon</p>
                <p className="text-sm">This will allow you to add multiple attendance records in a single form</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
