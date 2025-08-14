'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Download, FileText, BarChart3, Calendar, Filter } from 'lucide-react';

export default function AttendanceReports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    try {
      // Placeholder for report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Report Generated',
        description: `${type} report has been generated successfully`,
      });
      
      // In a real implementation, this would download the actual report
      const csvContent = `Employee ID,Name,Present Days,Absent Days,Late Days,Attendance %
EMP001,John Doe,22,3,1,88%
EMP002,Jane Smith,25,0,0,100%
EMP003,Bob Johnson,20,5,2,80%`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${type}_report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard">Standard Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Report
                </CardTitle>
                <CardDescription>
                  Generate monthly attendance summary for all employees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Month</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select defaultValue={(new Date().getMonth() + 1).toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select defaultValue={new Date().getFullYear().toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 3 }, (_, i) => {
                          const year = new Date().getFullYear() - 1 + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => generateReport('monthly')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Monthly Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Daily Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Daily Report
                </CardTitle>
                <CardDescription>
                  Generate daily attendance report for a specific date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <Button 
                  onClick={() => generateReport('daily')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Daily Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Employee Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Employee Report
                </CardTitle>
                <CardDescription>
                  Generate attendance report for a specific employee
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input placeholder="Enter employee ID (e.g., EMP001)" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <Button 
                  onClick={() => generateReport('employee')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Employee Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Department Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Department Report
                </CardTitle>
                <CardDescription>
                  Generate attendance summary by department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <Button 
                  onClick={() => generateReport('department')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Department Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Custom Report Builder
              </CardTitle>
              <CardDescription>
                Create custom attendance reports with specific filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Custom report builder will be available soon</p>
                <p className="text-sm">This will allow you to create reports with custom filters and columns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Attendance Analytics
              </CardTitle>
              <CardDescription>
                View attendance trends and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Attendance analytics dashboard will be available soon</p>
                <p className="text-sm">This will include charts, trends, and insights about attendance patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
