'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export default function SalaryReports() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const reportTypes = [
    {
      id: 'monthly-summary',
      title: 'Monthly Salary Summary',
      description: 'Comprehensive monthly salary report with totals and breakdowns',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'employee-wise',
      title: 'Employee-wise Salary Report',
      description: 'Detailed salary breakdown for each employee',
      icon: Users,
      color: 'green'
    },
    {
      id: 'department-wise',
      title: 'Department-wise Analysis',
      description: 'Salary analysis grouped by departments',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 'payroll-register',
      title: 'Payroll Register',
      description: 'Complete payroll register for statutory compliance',
      icon: FileText,
      color: 'orange'
    },
    {
      id: 'deduction-summary',
      title: 'Deduction Summary',
      description: 'Summary of all deductions (PF, ESIC, Tax, etc.)',
      icon: DollarSign,
      color: 'red'
    },
    {
      id: 'comparative-analysis',
      title: 'Comparative Analysis',
      description: 'Month-over-month salary comparison',
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Salary Reports</h3>
        <p className="text-muted-foreground">
          Generate comprehensive salary reports for analysis and compliance
        </p>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-full bg-${report.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${report.color}-600`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isGenerating}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common salary report actions and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Download Templates</p>
                  <p className="text-sm text-muted-foreground">Get Excel templates for salary data</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Salary Analytics</p>
                  <p className="text-sm text-muted-foreground">View salary trends and insights</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Employee Statements</p>
                  <p className="text-sm text-muted-foreground">Generate individual pay slips</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Tax Reports</p>
                  <p className="text-sm text-muted-foreground">Generate tax deduction reports</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Recently generated salary reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reports generated yet</p>
            <p className="text-sm">Generate your first salary report using the options above</p>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">About Salary Calculation</h4>
              <p className="text-sm text-blue-700 mb-3">
                The salary calculation system uses your exact logic with wage rates from employee salary codes:
              </p>
              <div className="text-sm text-blue-700 mb-3">
                <div>• <strong>Primary:</strong> Employee's Salary Code → WageMaster base wage</div>
                <div>• <strong>Secondary:</strong> Employee's direct wage rate field</div>
                <div>• <strong>Fallback:</strong> Skill level mapping (₹868, ₹739, ₹614, ₹526)</div>
              </div>
              <p className="text-sm text-blue-700">
                PF is calculated at 12% (capped at ₹15,000) and ESIC at 0.75% (capped at ₹21,000).
                Each employee's wage is determined by their assigned salary code for accurate calculations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
