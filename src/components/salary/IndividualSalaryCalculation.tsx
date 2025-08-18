'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Calculator, User } from 'lucide-react';
import { salaryService, type SalaryCalculationData, type SalaryAdjustments } from '@/lib/salary-service';

export default function IndividualSalaryCalculation() {
  const [employeeId, setEmployeeId] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [adjustments, setAdjustments] = useState<SalaryAdjustments>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [salaryData, setSalaryData] = useState<SalaryCalculationData | null>(null);

  const handleAdjustmentChange = (field: keyof SalaryAdjustments, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAdjustments(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleCalculateIndividualSalary = async () => {
    if (!employeeId || !selectedYear || !selectedMonth) {
      toast({
        title: 'Missing Information',
        description: 'Please provide employee ID, year, and month',
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await salaryService.calculateIndividualSalary({
        employee_id: employeeId,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        adjustments: adjustments
      });
      
      setSalaryData(result);
      toast({
        title: 'Success',
        description: `Salary calculated for employee ${employeeId}`,
      });
    } catch (error: any) {
      console.error('Error calculating individual salary:', error);
      toast({
        title: 'Calculation Failed',
        description: error.response?.data?.message || 'Failed to calculate individual salary',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const resetForm = () => {
    setEmployeeId('');
    setAdjustments({});
    setSalaryData(null);
  };

  return (
    <div className="space-y-6">
      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Employee Selection
          </CardTitle>
          <CardDescription>
            Select employee and month for salary calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee-id">Employee ID</Label>
              <Input
                id="employee-id"
                placeholder="Enter Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Year</Label>
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
              <Label>Month</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* Salary Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Adjustments (Optional)</CardTitle>
          <CardDescription>
            Add custom earnings and deductions for this employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="space-y-4">
              <h4 className="font-medium text-green-600">Additional Earnings</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="special-basic">Special Basic</Label>
                  <Input
                    id="special-basic"
                    type="number"
                    placeholder="0"
                    value={adjustments['Special Basic'] || ''}
                    onChange={(e) => handleAdjustmentChange('Special Basic', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="da">DA (Dearness Allowance)</Label>
                  <Input
                    id="da"
                    type="number"
                    placeholder="0"
                    value={adjustments['DA'] || ''}
                    onChange={(e) => handleAdjustmentChange('DA', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hra">HRA (House Rent Allowance)</Label>
                  <Input
                    id="hra"
                    type="number"
                    placeholder="0"
                    value={adjustments['HRA'] || ''}
                    onChange={(e) => handleAdjustmentChange('HRA', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="overtime">Overtime</Label>
                  <Input
                    id="overtime"
                    type="number"
                    placeholder="0"
                    value={adjustments['Overtime'] || ''}
                    onChange={(e) => handleAdjustmentChange('Overtime', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="others-earnings">Others</Label>
                  <Input
                    id="others-earnings"
                    type="number"
                    placeholder="0"
                    value={adjustments['Others'] || ''}
                    onChange={(e) => handleAdjustmentChange('Others', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4">
              <h4 className="font-medium text-red-600">Additional Deductions</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="society">Society</Label>
                  <Input
                    id="society"
                    type="number"
                    placeholder="0"
                    value={adjustments['Society'] || ''}
                    onChange={(e) => handleAdjustmentChange('Society', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="income-tax">Income Tax</Label>
                  <Input
                    id="income-tax"
                    type="number"
                    placeholder="0"
                    value={adjustments['Income Tax'] || ''}
                    onChange={(e) => handleAdjustmentChange('Income Tax', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="insurance">Insurance</Label>
                  <Input
                    id="insurance"
                    type="number"
                    placeholder="0"
                    value={adjustments['Insurance'] || ''}
                    onChange={(e) => handleAdjustmentChange('Insurance', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="others-recoveries">Others Recoveries</Label>
                  <Input
                    id="others-recoveries"
                    type="number"
                    placeholder="0"
                    value={adjustments['Others Recoveries'] || ''}
                    onChange={(e) => handleAdjustmentChange('Others Recoveries', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleCalculateIndividualSalary} 
          disabled={isCalculating}
          size="lg"
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
        
        <Button 
          onClick={resetForm} 
          variant="outline"
          size="lg"
        >
          Reset Form
        </Button>
      </div>

      {/* Results */}
      {salaryData && (
        <Card>
          <CardHeader>
            <CardTitle>Salary Calculation Result</CardTitle>
            <CardDescription>
              {salaryData['Employee Name']} - {salaryService.getMonthName(parseInt(selectedMonth))} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-medium">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Employee ID:</span>
                    <span className="font-medium">{salaryData['Employee ID']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skill Level:</span>
                    <span className="font-medium">{salaryData['Skill Level']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Present Days:</span>
                    <span className="font-medium">{salaryData['Present Days']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Wage:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Daily Wage'])}</span>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">Earnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Basic:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Basic'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Basic:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Special Basic'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DA:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['DA'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['HRA'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Overtime'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Others:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Others'])}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-green-600">
                    <span>Total Earnings:</span>
                    <span>{salaryService.formatCurrency(salaryData['Total Earnings'])}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">Deductions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>PF:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['PF'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ESIC:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['ESIC'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Society:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Society'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Income Tax'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Insurance'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Others Recoveries:</span>
                    <span className="font-medium">{salaryService.formatCurrency(salaryData['Others Recoveries'])}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-red-600">
                    <span>Total Deductions:</span>
                    <span>{salaryService.formatCurrency(salaryData['Total Deductions'])}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Net Salary:</span>
                <span className="text-2xl font-bold text-green-600">
                  {salaryService.formatCurrency(salaryData['Net Salary'])}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
