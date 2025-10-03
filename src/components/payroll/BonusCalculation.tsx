'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calculator,
  Users,
  Building2,
  Calendar,
  Loader2,
  Download,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PayrollService, { Site, BonusRecord } from '@/lib/payroll-service';

interface BonusCalculationProps {
  sites: Site[];
}

export default function BonusCalculation({ sites }: BonusCalculationProps) {
  const [loading, setLoading] = useState(false);
  const [bonusData, setBonusData] = useState<BonusRecord[]>([]);
  const [summary, setSummary] = useState<{
    total_employees: number;
    total_bonus: number;
    period: any;
  } | null>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    siteId: '',
    year: new Date().getFullYear().toString(),
    startMonth: '1',
    endMonth: '12',
  });

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

  const handleCalculate = async () => {
    if (!filters.year || !filters.startMonth || !filters.endMonth) {
      toast({
        title: 'Missing Information',
        description: 'Please select year, start month, and end month',
        variant: 'destructive',
      });
      return;
    }

    const startMonth = parseInt(filters.startMonth);
    const endMonth = parseInt(filters.endMonth);

    if (startMonth > endMonth) {
      toast({
        title: 'Invalid Range',
        description: 'Start month cannot be greater than end month',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await PayrollService.calculateBonus({
        site_id: filters.siteId === 'all' ? undefined : filters.siteId || undefined,
        year: parseInt(filters.year),
        start_month: startMonth,
        end_month: endMonth,
      });

      if (response.success && response.data) {
        setBonusData(response.data.bonus_records);
        setSummary({
          total_employees: response.data.total_employees,
          total_bonus: response.data.total_bonus,
          period: response.data.period,
        });

        toast({
          title: 'Bonus Calculated',
          description: `Calculated bonus for ${response.data.total_employees} employees`,
        });
      } else {
        toast({
          title: 'Calculation Failed',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to calculate bonus',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const exportToCSV = () => {
    if (!bonusData.length) return;

    const headers = ['Employee ID', 'Employee Name', 'Basic Salary', 'Bonus Amount', 'Period Months'];
    const csvContent = [
      headers.join(','),
      ...bonusData.map(record => [
        record.employee_id,
        `"${record.employee_name}"`,
        record.basic_salary,
        record.bonus_amount,
        record.period_months
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bonus_calculation_${filters.year}_${filters.startMonth}-${filters.endMonth}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bonus Calculation Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Site Filter */}
            <div className="space-y-2">
              <Label>Site (Optional)</Label>
              <Select value={filters.siteId} onValueChange={(value) => setFilters(prev => ({ ...prev, siteId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site.site_id} value={site.site_id}>
                      {site.site_name || 'Unnamed Site'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={filters.year} onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Month */}
            <div className="space-y-2">
              <Label>Start Month</Label>
              <Select value={filters.startMonth} onValueChange={(value) => setFilters(prev => ({ ...prev, startMonth: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* End Month */}
            <div className="space-y-2">
              <Label>End Month</Label>
              <Select value={filters.endMonth} onValueChange={(value) => setFilters(prev => ({ ...prev, endMonth: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calculate Button */}
            <div className="flex items-end">
              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Bonus
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Note:</strong> Bonus is calculated as 8.33% of the average basic salary over the selected period.</p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{summary.total_employees}</p>
                  <p className="text-xs text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">₹{summary.total_bonus.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Bonus Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{summary.period.month_count}</p>
                  <p className="text-xs text-muted-foreground">Months in Period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {bonusData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bonus Calculation Results</CardTitle>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead className="text-right">Basic Salary</TableHead>
                    <TableHead className="text-right">Bonus Amount</TableHead>
                    <TableHead className="text-center">Period Months</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonusData.map((record) => (
                    <TableRow key={record.employee_id}>
                      <TableCell className="font-medium">{record.employee_id}</TableCell>
                      <TableCell>{record.employee_name}</TableCell>
                      <TableCell className="text-right">₹{record.basic_salary.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ₹{record.bonus_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{record.period_months}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && bonusData.length === 0 && summary === null && (
        <Card>
          <CardContent className="text-center py-8">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Select filters and click "Calculate Bonus" to view results</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}