'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, Download, FileSpreadsheet, Calculator } from 'lucide-react';
import { salaryService, type SalaryCalculationData } from '@/lib/salary-service';

export default function ExcelSalaryCalculation() {
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [adjustmentsFile, setAdjustmentsFile] = useState<File | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [salaryData, setSalaryData] = useState<SalaryCalculationData[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleAttendanceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = salaryService.validateExcelFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid File',
          description: validation.message,
          variant: 'destructive',
        });
        return;
      }
      setAttendanceFile(file);
    }
  };

  const handleAdjustmentsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = salaryService.validateExcelFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid File',
          description: validation.message,
          variant: 'destructive',
        });
        return;
      }
      setAdjustmentsFile(file);
    }
  };

  const handleCalculateSalary = async () => {
    if (!attendanceFile) {
      toast({
        title: 'Missing File',
        description: 'Please upload an attendance file',
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await salaryService.uploadExcelForCalculation(
        attendanceFile,
        adjustmentsFile || undefined
      );
      
      setSalaryData(result);
      toast({
        title: 'Success',
        description: `Salary calculated for ${result.length} employees`,
      });
    } catch (error: any) {
      console.error('Error calculating salary:', error);
      toast({
        title: 'Calculation Failed',
        description: error.response?.data?.message || 'Failed to calculate salary',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadTemplate = async (type: 'attendance' | 'adjustments') => {
    try {
      const blob = type === 'attendance' 
        ? await salaryService.downloadAttendanceTemplate()
        : await salaryService.downloadAdjustmentsTemplate();
      
      const filename = type === 'attendance' 
        ? 'attendance_template.xlsx'
        : 'adjustments_template.xlsx';
      
      salaryService.downloadBlob(blob, filename);
      
      toast({
        title: 'Template Downloaded',
        description: `${type} template has been downloaded`,
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download template',
        variant: 'destructive',
      });
    }
  };

  const handleExportResults = async () => {
    if (salaryData.length === 0) {
      toast({
        title: 'No Data',
        description: 'No salary data to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const blob = await salaryService.exportSalaryData(salaryData);
      salaryService.downloadBlob(blob, 'salary_calculation_results.xlsx');
      
      toast({
        title: 'Export Successful',
        description: 'Salary data has been exported to Excel',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export salary data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Attendance File
            </CardTitle>
            <CardDescription>
              Upload Excel file with day-wise attendance data. Wage rates will be automatically fetched from employee salary codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-file">Select Attendance File</Label>
              <Input
                id="attendance-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleAttendanceFileChange}
              />
              {attendanceFile && (
                <p className="text-sm text-green-600">
                  ✓ {attendanceFile.name}
                </p>
              )}
            </div>
            <Button 
              onClick={() => handleDownloadTemplate('attendance')} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </CardContent>
        </Card>

        {/* Adjustments File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Adjustments File (Optional)
            </CardTitle>
            <CardDescription>
              Upload Excel file with salary adjustments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjustments-file">Select Adjustments File</Label>
              <Input
                id="adjustments-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleAdjustmentsFileChange}
              />
              {adjustmentsFile && (
                <p className="text-sm text-green-600">
                  ✓ {adjustmentsFile.name}
                </p>
              )}
            </div>
            <Button 
              onClick={() => handleDownloadTemplate('adjustments')} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calculator className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Enhanced Salary Calculation</h4>
            <p className="text-sm text-blue-700">
              The system now uses each employee's assigned <strong>salary code</strong> to get the correct wage rate from the WageMaster table.
              This ensures accurate calculations based on site, rank, and state-specific wages instead of generic skill level rates.
            </p>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCalculateSalary}
          disabled={isCalculating || !attendanceFile}
          size="lg"
          className="min-w-[200px]"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Salary
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      {salaryData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Salary Calculation Results</CardTitle>
                <CardDescription>
                  {salaryData.length} employees processed
                </CardDescription>
              </div>
              <Button 
                onClick={handleExportResults} 
                disabled={isExporting}
                variant="outline"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Skill Level</TableHead>
                    <TableHead>Present Days</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Total Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{employee['Employee ID']}</TableCell>
                      <TableCell>{employee['Employee Name']}</TableCell>
                      <TableCell>{employee['Skill Level']}</TableCell>
                      <TableCell>{employee['Present Days']}</TableCell>
                      <TableCell>{salaryService.formatCurrency(employee['Basic'])}</TableCell>
                      <TableCell>{salaryService.formatCurrency(employee['Total Earnings'])}</TableCell>
                      <TableCell>{salaryService.formatCurrency(employee['Total Deductions'])}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {salaryService.formatCurrency(employee['Net Salary'])}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
