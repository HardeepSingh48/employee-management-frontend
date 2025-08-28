'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Download, Upload, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deductionsService, Deduction } from '@/lib/deductions-service';
import AddDeductionModal from '@/components/deductions/AddDeductionModal';
import BulkUploadModal from '@/components/deductions/BulkUploadModal';
import EditDeductionModal from '@/components/deductions/EditDeductionModal';

export default function DeductionsPage() {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [filteredDeductions, setFilteredDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDeductions();
  }, []);

  useEffect(() => {
    // Filter deductions based on search term
    const filtered = deductions.filter(deduction =>
      deduction.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deduction.deduction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deduction.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeductions(filtered);
  }, [deductions, searchTerm]);

  const loadDeductions = async () => {
    try {
      setLoading(true);
      const data = await deductionsService.getAllDeductions();
      setDeductions(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load deductions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeduction = async (deductionData: any) => {
    try {
      await deductionsService.createDeduction(deductionData);
      toast({
        title: 'Success',
        description: 'Deduction created successfully',
      });
      setShowAddModal(false);
      loadDeductions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create deduction',
        variant: 'destructive',
      });
    }
  };

  const handleEditDeduction = async (deductionId: string, deductionData: any) => {
    try {
      await deductionsService.updateDeduction(deductionId, deductionData);
      toast({
        title: 'Success',
        description: 'Deduction updated successfully',
      });
      setShowEditModal(false);
      setSelectedDeduction(null);
      loadDeductions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update deduction',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeduction = async (deductionId: string) => {
    if (!confirm('Are you sure you want to delete this deduction?')) {
      return;
    }

    try {
      await deductionsService.deleteDeduction(deductionId);
      toast({
        title: 'Success',
        description: 'Deduction deleted successfully',
      });
      loadDeductions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete deduction',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      const result = await deductionsService.bulkUploadDeductions(file);
      toast({
        title: 'Bulk Upload Complete',
        description: `${result.success_count} deductions created, ${result.error_count} errors`,
      });
      setShowBulkModal(false);
      loadDeductions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload deductions',
        variant: 'destructive',
      });
    }
  };

  const downloadTemplate = async () => {
    try {
      const blob = await deductionsService.downloadTemplate();
      deductionsService.downloadBlob(blob, 'deductions_template.xlsx');
      toast({
        title: 'Success',
        description: 'Template downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download template',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (deduction: Deduction) => {
    setSelectedDeduction(deduction);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deductions Management</h1>
          <p className="text-muted-foreground">
            Manage employee deductions and installments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button onClick={() => setShowBulkModal(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Deduction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deductions</CardTitle>
          <CardDescription>
            View and manage all employee deductions
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name, ID, or deduction type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading deductions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Deduction Type</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Months</TableHead>
                  <TableHead>Monthly Installment</TableHead>
                  <TableHead>Start Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeductions.map((deduction) => (
                  <TableRow key={deduction.deduction_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deduction.employee_name}</div>
                        <div className="text-sm text-muted-foreground">{deduction.employee_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{deduction.deduction_type}</TableCell>
                    <TableCell>₹{deduction.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{deduction.months}</TableCell>
                    <TableCell>₹{deduction.monthly_installment.toLocaleString()}</TableCell>
                    <TableCell>{new Date(deduction.start_month).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={deduction.status === 'Active' ? 'default' : 'secondary'}>
                        {deduction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(deduction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDeduction(deduction.deduction_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredDeductions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No deductions found matching your search.' : 'No deductions found.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddDeductionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDeduction}
      />

      <BulkUploadModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkUpload}
      />

      <EditDeductionModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDeduction(null);
        }}
        deduction={selectedDeduction}
        onSubmit={handleEditDeduction}
      />
    </div>
  );
}




