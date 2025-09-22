'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deductionsService } from '@/lib/deductions-service';

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}

export default function BulkUploadModal({ open, onClose, onSubmit }: BulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an Excel (.xlsx) or CSV file',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      await onSubmit(selectedFile);
      setSelectedFile(null);
    } finally {
      setUploading(false);
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

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Deductions</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to create multiple deductions at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Download Template</h4>
                <p className="text-sm text-muted-foreground">
                  Use our template to ensure correct format
                </p>
              </div>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload File *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  id="file"
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedFile ? selectedFile.name : 'Click to select file'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Excel (.xlsx) or CSV files only
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* File Requirements */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Required Columns:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Employee ID
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Deduction Type
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Total Amount
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Months
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Start Month (YYYY-MM-DD)
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Deductions'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}






