'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Deduction } from '@/lib/deductions-service';

interface EditDeductionModalProps {
  open: boolean;
  onClose: () => void;
  deduction: Deduction | null;
  onSubmit: (deductionId: string, data: any) => void;
}

export default function EditDeductionModal({ open, onClose, deduction, onSubmit }: EditDeductionModalProps) {
  const [formData, setFormData] = useState({
    deduction_type: '',
    total_amount: '',
    months: '',
    start_month: '',
  });

  useEffect(() => {
    if (deduction) {
      setFormData({
        deduction_type: deduction.deduction_type,
        total_amount: deduction.total_amount.toString(),
        months: deduction.months.toString(),
        start_month: deduction.start_month,
      });
    }
  }, [deduction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.deduction_type || !formData.total_amount || !formData.months || !formData.start_month) {
      return;
    }

    if (!deduction) return;

    const submissionData = {
      deduction_type: formData.deduction_type,
      total_amount: parseFloat(formData.total_amount),
      months: parseInt(formData.months),
      start_month: formData.start_month,
    };

    onSubmit(deduction.deduction_id, submissionData);
  };

  const handleClose = () => {
    setFormData({
      deduction_type: '',
      total_amount: '',
      months: '',
      start_month: '',
    });
    onClose();
  };

  if (!deduction) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Deduction</DialogTitle>
          <DialogDescription>
            Update deduction details for {deduction.employee_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <div className="p-2 border rounded bg-muted">
              {deduction.employee_name} ({deduction.employee_id})
            </div>
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
            <Button type="submit">
              Update Deduction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}






