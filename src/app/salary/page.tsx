'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Upload, FileSpreadsheet, Users, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';

// Import salary components
import ExcelSalaryCalculation from '@/components/salary/ExcelSalaryCalculation';
import MonthlySalaryCalculation from '@/components/salary/MonthlySalaryCalculation';
import IndividualSalaryCalculation from '@/components/salary/IndividualSalaryCalculation';
import SalaryReports from '@/components/salary/SalaryReports';
import ComplianceReports from '@/components/salary/ComplianceReports'; // ✅ new component

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState('excel');
  const [currentDate, setCurrentDate] = useState('');

  // Set current date on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Calculation</h1>
          <p className="text-muted-foreground">
            Calculate employee salaries using attendance data and adjustments
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calculator className="w-4 h-4 mr-1" />
          {currentDate || 'Loading...'}
        </Badge>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <p className="text-xs text-muted-foreground">registered employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">--</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">--</div>
            <p className="text-xs text-muted-foreground">per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">--</div>
            <p className="text-xs text-muted-foreground">calculations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {/* <TabsTrigger value="excel" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Excel Upload
          </TabsTrigger> */}
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Reports
          </TabsTrigger>
          {/* <TabsTrigger value="compliance" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Compliance
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="excel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Excel-based Salary Calculation</CardTitle>
              <CardDescription>
                Upload attendance and adjustments Excel files to calculate salaries using your exact logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelSalaryCalculation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Salary Calculation</CardTitle>
              <CardDescription>
                Calculate salaries for all employees for a specific month using database records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlySalaryCalculation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Salary Calculation</CardTitle>
              <CardDescription>
                Calculate salary for a specific employee with custom adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IndividualSalaryCalculation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Reports</CardTitle>
              <CardDescription>
                View and export salary calculation reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalaryReports />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>
                Generate and review statutory compliance reports (PF, ESI, TDS, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceReports /> {/* ✅ new component instead of SalaryReports */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
