import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import IdCardService, { IDCardEmployee } from '@/lib/services/idCardService';
import IDCardPreview from './IDCardPreview';
import api from '@/lib/api';

export default function IndividualTab() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [preview, setPreview] = useState<IDCardEmployee | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Load employees list (reuse existing endpoint /api/employees/all)
    const load = async () => {
      try {
        setLoading(true);
        const resp = await api.get('/employees/all');
        const data = resp.data;
        if (data?.success && data?.data) {
          setEmployees(data.data);
        } else if (Array.isArray(data)) {
          setEmployees(data);
        }
      } catch (e: any) {
        toast({ title: 'Failed to load employees', description: e?.message || 'Please try again', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handlePreview = async () => {
    if (!selectedId) {
      toast({ title: 'Select an employee', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const res = await IdCardService.previewSingle(selectedId);
      if (res.success && res.data) setPreview(res.data);
      else toast({ title: 'Preview failed', description: res.message || 'Unable to fetch data', variant: 'destructive' });
    } catch (e: any) {
      toast({ title: 'Preview error', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedId) {
      toast({ title: 'Select an employee', variant: 'destructive' });
      return;
    }
    try {
      setDownloading(true);
      const blob = await IdCardService.generateIndividual(selectedId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.href = url;
      a.download = `id_card_${selectedId}_${dateStr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({ title: 'PDF generation failed', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const employeeOptions = useMemo(() => {
    return employees.map((emp: any) => {
      const id = String(emp.employee_id ?? emp.id);
      const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
      const site = emp.site?.site_name || emp.site_name || '';
      return { id, label: `${name} (ID: ${id})${site ? ` - ${site}` : ''}` };
    });
  }, [employees]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Employee</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Search/select an employee" />
            </SelectTrigger>
            <SelectContent>
              {employeeOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handlePreview} disabled={loading || !selectedId} variant="outline">Preview</Button>
          <Button onClick={handleGenerate} disabled={downloading || !selectedId}>{downloading ? 'Generating…' : 'Generate PDF'}</Button>
        </div>
      </div>

      {preview && (
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border mt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Preview</h3>
          <div className="max-w-sm sm:max-w-md mx-auto">
            <IDCardPreview data={preview} />
          </div>
        </div>
      )}
    </div>
  );
}


