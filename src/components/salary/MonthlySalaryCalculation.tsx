'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Loader2, Calculator, Download, Calendar } from 'lucide-react';
import { salaryService, type SalaryCalculationData } from '@/lib/salary-service';

export default function MonthlySalaryCalculation() {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [isCalculating, setIsCalculating] = useState(false);
  const [salaryData, setSalaryData] = useState<SalaryCalculationData[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleCalculateMonthlySalary = async () => {
    if (!selectedYear || !selectedMonth) {
      toast({
        title: 'Missing Selection',
        description: 'Please select both year and month',
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await salaryService.calculateMonthlySalary({
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth)
      });
      
      setSalaryData(result);
      toast({
        title: 'Success',
        description: `Salary calculated for ${result.length} employees for ${salaryService.getMonthName(parseInt(selectedMonth))} ${selectedYear}`,
      });
    } catch (error: any) {
      console.error('Error calculating monthly salary:', error);
      toast({
        title: 'Calculation Failed',
        description: error.response?.data?.message || 'Failed to calculate monthly salary',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
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
      const filename = `monthly_salary_${salaryService.getMonthName(parseInt(selectedMonth))}_${selectedYear}.xlsx`;
      salaryService.downloadBlob(blob, filename);
      
      toast({
        title: 'Export Successful',
        description: 'Monthly salary data has been exported to Excel',
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

  // Calculate summary statistics
  const summaryStats = salaryData.length > 0 ? {
    totalEmployees: salaryData.length,
    totalPayroll: salaryData.reduce((sum, emp) => sum + emp['Net Salary'], 0),
    avgSalary: salaryData.reduce((sum, emp) => sum + emp['Net Salary'], 0) / salaryData.length,
    totalBasic: salaryData.reduce((sum, emp) => sum + emp['Basic'], 0),
    totalDeductions: salaryData.reduce((sum, emp) => sum + emp['Total Deductions'], 0)
  } : null;

  return (
    <div className="space-y-6">
      {/* Month/Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Month and Year
          </CardTitle>
          <CardDescription>
            Choose the month and year for salary calculation using database attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {salaryService.getMonthName(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCalculateMonthlySalary} 
              disabled={isCalculating}
              className="min-w-[150px]"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{summaryStats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {salaryService.formatCurrency(summaryStats.totalPayroll)}
                </p>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {salaryService.formatCurrency(summaryStats.avgSalary)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Salary</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {salaryService.formatCurrency(summaryStats.totalBasic)}
                </p>
                <p className="text-sm text-muted-foreground">Total Basic</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {salaryService.formatCurrency(summaryStats.totalDeductions)}
                </p>
                <p className="text-sm text-muted-foreground">Total Deductions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Section */}
      {salaryData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Monthly Salary - {salaryService.getMonthName(parseInt(selectedMonth))} {selectedYear}
                </CardTitle>
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
                    <TableHead>Daily Wage</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>PF</TableHead>
                    <TableHead>ESIC</TableHead>
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
                      <TableCell>{salaryService.formatCurrency(employee['Daily Wage'])}</TableCell>
                      <TableCell>{salaryService.formatCurrency(employee['Basic'])}</TableCell>
                      <TableCell>{salaryService.formatCurrency(employee['Total Earnings'])}</TableCell>
                      <TableCell>{salaryService.formatCurrency(employee['PF'])}</TableCell>
                      <TableCell>{salaryService.formatCurrency(employee['ESIC'])}</TableCell>
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
