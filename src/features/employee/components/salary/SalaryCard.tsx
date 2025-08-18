'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Calendar, TrendingUp, Loader2, Download } from 'lucide-react';

interface SalaryData {
  'Employee ID': string;
  'Employee Name': string;
  'Skill Level': string;
  'Present Days': number;
  'Daily Wage': number;
  'Basic': number;
  'Special Basic': number;
  'DA': number;
  'HRA': number;
  'Overtime': number;
  'Others': number;
  'Total Earnings': number;
  'PF': number;
  'ESIC': number;
  'Society': number;
  'Income Tax': number;
  'Insurance': number;
  'Others Recoveries': number;
  'Total Deductions': number;
  'Net Salary': number;
}

export default function SalaryCard() {
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMonth, selectedYear]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString()
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employee/salary/current?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setSalaryData(result.data);
      }
    } catch (error) {
      console.error('Error fetching salary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Salary Information
          </CardTitle>
          <CardDescription>
            View your salary calculation and breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Month:</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Year:</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchSalaryData} disabled={loading} size="sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading salary information...</span>
          </CardContent>
        </Card>
      ) : salaryData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Net Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(salaryData['Net Salary'])}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  For {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(salaryData['Total Earnings'])}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Before deductions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(salaryData['Total Deductions'])}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PF, ESIC & others
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Earnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(salaryData['Basic'])}</span>
                </div>
                {salaryData['Special Basic'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Special Basic</span>
                    <span className="font-medium">{formatCurrency(salaryData['Special Basic'])}</span>
                  </div>
                )}
                {salaryData['DA'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">DA</span>
                    <span className="font-medium">{formatCurrency(salaryData['DA'])}</span>
                  </div>
                )}
                {salaryData['HRA'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">HRA</span>
                    <span className="font-medium">{formatCurrency(salaryData['HRA'])}</span>
                  </div>
                )}
                {salaryData['Overtime'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Overtime</span>
                    <span className="font-medium">{formatCurrency(salaryData['Overtime'])}</span>
                  </div>
                )}
                {salaryData['Others'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Others</span>
                    <span className="font-medium">{formatCurrency(salaryData['Others'])}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Earnings</span>
                  <span className="text-blue-600">{formatCurrency(salaryData['Total Earnings'])}</span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deductions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">PF (12%)</span>
                  <span className="font-medium">{formatCurrency(salaryData['PF'])}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ESIC (0.75%)</span>
                  <span className="font-medium">{formatCurrency(salaryData['ESIC'])}</span>
                </div>
                {salaryData['Society'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Society</span>
                    <span className="font-medium">{formatCurrency(salaryData['Society'])}</span>
                  </div>
                )}
                {salaryData['Income Tax'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Income Tax</span>
                    <span className="font-medium">{formatCurrency(salaryData['Income Tax'])}</span>
                  </div>
                )}
                {salaryData['Insurance'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Insurance</span>
                    <span className="font-medium">{formatCurrency(salaryData['Insurance'])}</span>
                  </div>
                )}
                {salaryData['Others Recoveries'] > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Other Recoveries</span>
                    <span className="font-medium">{formatCurrency(salaryData['Others Recoveries'])}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">{formatCurrency(salaryData['Total Deductions'])}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Present Days</label>
                  <p className="text-lg font-semibold">{salaryData['Present Days']}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Daily Wage</label>
                  <p className="text-lg font-semibold">{formatCurrency(salaryData['Daily Wage'])}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Skill Level</label>
                  <p className="text-lg font-semibold">{salaryData['Skill Level']}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee ID</label>
                  <p className="text-lg font-semibold font-mono">{salaryData['Employee ID']}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No salary data available for the selected period</p>
            <p className="text-sm text-gray-400 mt-2">
              Please ensure attendance has been marked for the selected month
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
