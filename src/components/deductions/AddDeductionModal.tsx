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

interface AddDeductionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddDeductionModal({ open, onClose, onSubmit }: AddDeductionModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    deduction_type: '',
    total_amount: '',
    months: '',
    start_month: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadEmployees();
    }
  }, [open]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load employees',
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
            <Label htmlFor="employee_id">Employee *</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => {
                  const empId = employee.employee_id || employee.id;
                  const firstName = employee.first_name || '';
                  const lastName = employee.last_name || '';
                  return (
                    <SelectItem key={empId} value={String(empId)}>
                      {empId} - {firstName} {lastName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deduction_type">Deduction Type *</Label>
            <Input
              id="deduction_type"
              placeholder="e.g., Clothes, Loan, Recovery"
              value={formData.deduction_type}
              onChange={(e) => setFormData({ ...formData, deduction_type: e.target.value })}
            />
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
              value={formData.start_month}
              onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
            />
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
