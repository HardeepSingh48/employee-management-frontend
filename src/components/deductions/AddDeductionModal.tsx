'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { employeeService } from '@/lib/employee-service';
import { Employee } from '@/types/employee';
import { sitesService, type Site } from '@/lib/sites-service';
import { salaryCodesService, type SalaryCode } from '@/lib/salary-codes-service';

interface AddDeductionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddDeductionModal({ open, onClose, onSubmit }: AddDeductionModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [salaryCodes, setSalaryCodes] = useState<SalaryCode[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    deduction_type: '',
    total_amount: '',
    months: '',
    start_month: '',
  });

  // Calculate minimum date (first day of current month)
  const getMinDate = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  };
  const { toast } = useToast();

  // Helper function to get salary codes for selected site
  const getSalaryCodesForSite = (siteId: string) => {
    const selectedSite = sites.find(s => s.site_id === siteId);
    if (!selectedSite) return [];

    return salaryCodes
      .filter(sc => sc.site_name === selectedSite.site_name)
      .map(sc => sc.salary_code);
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Update employees when site changes
  useEffect(() => {
    if (selectedSiteId && selectedSiteId !== 'all') {
      // Clear selected employee when site changes
      setFormData(prev => ({ ...prev, employee_id: '' }));
    }
  }, [selectedSiteId]);

  const loadData = async () => {
    try {
      const [employeeData, sitesRes, salaryCodesRes] = await Promise.all([
        employeeService.getEmployees(),
        sitesService.getSites(1, 1000),
        salaryCodesService.getSalaryCodes()
      ]);

      setEmployees(employeeData);
      setSites(sitesRes.data || []);
      setSalaryCodes(salaryCodesRes);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.deduction_type || !formData.total_amount || !formData.months || !formData.start_month) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate start month is not in the past
    const selectedDate = new Date(formData.start_month);
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    if (selectedDate < currentMonthStart) {
      toast({
        title: 'Invalid Start Month',
        description: 'Start month cannot be in the past. Please select current month or a future month.',
        variant: 'destructive',
      });
      return;
    }

    const submissionData = {
      ...formData,
      total_amount: parseFloat(formData.total_amount),
      months: parseInt(formData.months),
    };

    onSubmit(submissionData);
  };

  const handleClose = () => {
    setFormData({
      employee_id: '',
      deduction_type: '',
      total_amount: '',
      months: '',
      start_month: '',
    });
    setSelectedSiteId('all');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Deduction</DialogTitle>
          <DialogDescription>
            Create a new deduction for an employee. The deduction will be automatically calculated in salary.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Select
              value={selectedSiteId}
              onValueChange={setSelectedSiteId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.site_id} value={site.site_id}>
                    {site.site_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee *</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  let filteredEmployees = employees;

                  // Filter employees by site if a specific site is selected
                  if (selectedSiteId !== 'all') {
                    const siteSalaryCodes = getSalaryCodesForSite(selectedSiteId);
                    filteredEmployees = employees.filter((employee: any) =>
                      siteSalaryCodes.includes(employee.salary_code || employee.salaryCode)
                    );
                  }

                  return filteredEmployees.map((employee) => {
                    const empId = employee.employee_id || employee.id;
                    const firstName = employee.first_name || '';
                    const lastName = employee.last_name || '';
                    return (
                      <SelectItem key={empId} value={String(empId)}>
                        {empId} - {firstName} {lastName}
                      </SelectItem>
                    );
                  });
                })()}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deduction_type">Deduction Type *</Label>
            <Select
              value={formData.deduction_type}
              onValueChange={(value) => setFormData({ ...formData, deduction_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deduction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Uniform">Uniform</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
                <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                <SelectItem value="Recovery">Recovery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_amount">Total Amount (₹) *</Label>
            <Input
              id="total_amount"
              type="number"
              placeholder="20000"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="months">Number of Months *</Label>
            <Input
              id="months"
              type="number"
              placeholder="9"
              value={formData.months}
              onChange={(e) => setFormData({ ...formData, months: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_month">Start Month *</Label>
            <Input
              id="start_month"
              type="date"
              min={getMinDate()}
              value={formData.start_month}
              onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Start date must be current month or later
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Deduction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
