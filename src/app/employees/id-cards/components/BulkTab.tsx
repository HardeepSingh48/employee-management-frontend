import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import IdCardService, { IDCardEmployee } from '@/lib/services/idCardService';
import IDCardPreview from './IDCardPreview';
import api from '@/lib/api';
import { sitesService, type Site } from '@/lib/sites-service';
import { salaryCodesService, type SalaryCode } from '@/lib/salary-codes-service';
import { employeeService } from '@/lib/employee-service';

type Mode = 'site' | 'custom';

export default function BulkTab() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('site');
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<string>('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewEmployees, setPreviewEmployees] = useState<IDCardEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [salaryCodes, setSalaryCodes] = useState<SalaryCode[]>([]);

  // Helper function to get salary codes for selected site (similar to MonthlyView.tsx)
  const getSalaryCodesForSite = (siteId: string) => {
    const selectedSite = sites.find(s => s.site_id === siteId);
    if (!selectedSite) return [];

    return salaryCodes
      .filter(sc => sc.site_name === selectedSite.site_name)
      .map(sc => sc.salary_code);
  };

  // Load sites, salary codes and employees on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sitesRes, salaryCodesRes, employeeData] = await Promise.all([
          sitesService.getSites(1, 1000),
          salaryCodesService.getSalaryCodes(),
          employeeService.getEmployees()
        ]);

        setSites(sitesRes.data || []);
        setSalaryCodes(salaryCodesRes);
        setEmployees(employeeData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      }
    };

    loadData();
  }, []);

  const filteredEmployees = useMemo(() => {
    if (mode === 'site' && siteId) {
      // Filter employees by salary codes for the selected site (like MarkAttendance.tsx)
      const siteSalaryCodes = getSalaryCodesForSite(siteId);
      return employees.filter((e: any) =>
        siteSalaryCodes.includes(e.salary_code || e.salaryCode)
      );
    }
    return employees;
  }, [employees, mode, siteId, sites, salaryCodes]);

  // Update preview when site changes (for site mode)
  useEffect(() => {
    if (mode === 'site') {
      // Auto-preview when site mode is active (both with and without site selection)
      handlePreview();
    }
  }, [siteId, mode]);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      let params: any = {};
      if (mode === 'site' && siteId) {
        params.site_id = siteId;
        console.log('Previewing for site:', siteId);
      } else if (mode === 'site' && !siteId) {
        // For "All Sites", don't pass site_id parameter
        console.log('Previewing for all sites');
      }
      if (mode === 'custom') params.employee_ids = selectedIds;
      const res = await IdCardService.previewBulk(params);
      console.log('Preview response:', res);
      if (res.success && res.data) {
        setPreviewEmployees(res.data.employees.slice(0, 5));
        console.log('Preview employees:', res.data.employees.slice(0, 5));
      }
      else toast({ title: 'Preview failed', description: res.message || 'No data found', variant: 'destructive' });
    } catch (e: any) {
      console.error('Preview error:', e);
      toast({ title: 'Preview error', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      if (mode === 'custom' && selectedIds.length === 0) {
        toast({ title: 'Select at least one employee', variant: 'destructive' });
        return;
      }
      setDownloading(true);
      const payload = mode === 'site' ? { mode, site_id: siteId } : { mode, employee_ids: selectedIds };
      const blob = await IdCardService.generateBulk(payload as any);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = mode === 'custom' ? selectedIds.length : (previewEmployees?.length || 0);
      a.href = url;
      a.download = `id_cards_bulk_${count || 'x'}_employees_${dateStr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({ title: 'PDF generation failed', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Filter</label>
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="site">By Site</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {mode === 'site' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Site</label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Sites</option>
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_id}>
                  {s.site_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'custom' && (
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium">Select Employees</label>
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {filteredEmployees.map((e: any) => {
                  const id = String(e.employee_id ?? e.id);
                  const name = e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim();
                  const designation = e.designation || e.job_title || '';
                  return (
                    <label key={id} className="flex items-start gap-3 p-3 bg-white rounded border hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => handleToggle(id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{name}</div>
                        <div className="text-xs text-gray-600">ID: {id}</div>
                        {designation && <div className="text-xs text-gray-500 truncate">{designation}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview} disabled={loading}>Preview</Button>
          <Button onClick={handleGenerate} disabled={downloading}>{downloading ? 'Generating…' : 'Generate PDF'}</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">{mode === 'custom' ? selectedIds.length : '—'} employees selected</Badge>
      </div>

      {previewEmployees.length > 0 && (
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Preview (Showing {previewEmployees.length} of {employees.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {previewEmployees.map((emp) => (
              <IDCardPreview key={emp.employee_id} data={emp} showSite />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


