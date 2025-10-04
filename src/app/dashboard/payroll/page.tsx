'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Eye, 
  Users, 
  Calendar, 
  Building2, 
  FileText,
  Loader2,
  Search,
  CheckSquare,
  Square
} from 'lucide-react';
import PayrollService, { Employee, Site } from '@/lib/payroll-service';
import BonusCalculation from '@/components/payroll/BonusCalculation';

type SelectionMode = 'single' | 'range' | 'multi';

interface PayrollFilters {
  siteId: string;
  year: string;
  month: string;
  selectionMode: SelectionMode;
  selectedEmployeeId: number | null;
  rangeFrom: number | null;
  rangeTo: number | null;
  selectedEmployeeIds: number[];
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  // OPTIMIZATION: Debounce search input to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [filters, setFilters] = useState<PayrollFilters>({
    siteId: '',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    selectionMode: 'single',
    selectedEmployeeId: null,
    rangeFrom: null,
    rangeTo: null,
    selectedEmployeeIds: [],
  });

  // Load initial data
  useEffect(() => {
    loadSites();
    loadEmployees();
  }, []);

  // Load employees when site filter changes
  useEffect(() => {
    loadEmployees();
  }, [filters.siteId]);

  const loadSites = async () => {
    const response = await PayrollService.getSites();
    if (response.success && response.data) {
      setSites(response.data);
      
      // If supervisor has only one site, automatically select it
      if (response.data.length === 1 && response.data[0]) {
        setFilters(prev => ({
          ...prev,
          siteId: response.data![0].site_id
        }));
      }
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    const response = await PayrollService.getEmployees(filters.siteId || undefined);
    if (response.success && response.data) {
      setEmployees(response.data);
    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: keyof PayrollFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset selection when mode changes
      ...(key === 'selectionMode' ? {
        selectedEmployeeId: null,
        rangeFrom: null,
        rangeTo: null,
        selectedEmployeeIds: [],
      } : {}),
    }));
  };

  // OPTIMIZATION: Memoize filtered employees to prevent unnecessary recalculations
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      emp.employee_id.toString().includes(debouncedSearchTerm)
    );
  }, [employees, debouncedSearchTerm]);

  // OPTIMIZATION: Memoize callbacks to prevent unnecessary re-renders
  const handleEmployeeToggle = useCallback((employeeId: number) => {
    setFilters(prev => ({
      ...prev,
      selectedEmployeeIds: prev.selectedEmployeeIds.includes(employeeId)
        ? prev.selectedEmployeeIds.filter(id => id !== employeeId)
        : [...prev.selectedEmployeeIds, employeeId],
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSelected = filteredEmployees.every((emp: Employee) => filters.selectedEmployeeIds.includes(emp.employee_id));

    if (allSelected) {
      // Deselect all visible employees
      setFilters(prev => ({
        ...prev,
        selectedEmployeeIds: prev.selectedEmployeeIds.filter(id =>
          !filteredEmployees.some((emp: Employee) => emp.employee_id === id)
        ),
      }));
    } else {
      // Select all visible employees
      setFilters(prev => ({
        ...prev,
        selectedEmployeeIds: [
          ...prev.selectedEmployeeIds,
          ...filteredEmployees
            .filter((emp: Employee) => !prev.selectedEmployeeIds.includes(emp.employee_id))
            .map((emp: Employee) => emp.employee_id)
        ],
      }));
    }
  }, [filteredEmployees, filters.selectedEmployeeIds]);

  const getSelectedEmployeeIds = (): number[] => {
    switch (filters.selectionMode) {
      case 'single':
        return filters.selectedEmployeeId ? [filters.selectedEmployeeId] : [];
      case 'range':
        if (filters.rangeFrom && filters.rangeTo) {
          return employees
            .filter(emp => emp.employee_id >= filters.rangeFrom! && emp.employee_id <= filters.rangeTo!)
            .map(emp => emp.employee_id);
        }
        return [];
      case 'multi':
        return filters.selectedEmployeeIds;
      default:
        return [];
    }
  };

  const validateSelection = (): string | null => {
    if (!filters.year || !filters.month) {
      return 'Please select year and month';
    }

    const selectedIds = getSelectedEmployeeIds();
    if (selectedIds.length === 0) {
      return 'Please select at least one employee';
    }

    return null;
  };

  const handlePreview = async () => {
    const validationError = validateSelection();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPreviewLoading(true);
    setError(null);

    try {
      const selectedIds = getSelectedEmployeeIds();
      const response = await PayrollService.previewPayroll({
        employee_ids: selectedIds,
        year: parseInt(filters.year),
        month: parseInt(filters.month),
      });

      if (response.success && response.data) {
        setPreviewHtml(response.data.preview_html);
        setSuccess(`Preview generated for ${response.data.preview_count} of ${response.data.total_employees} employees`);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError('Failed to generate preview');
    }

    setPreviewLoading(false);
  };

  const handleGenerate = async () => {
    const validationError = validateSelection();
    if (validationError) {
      setError(validationError);
      return;
    }

    setGenerateLoading(true);
    setError(null);

    try {
      const selectedIds = getSelectedEmployeeIds();
      const filename = `payslip_${filters.year}_${filters.month}_${new Date().getTime()}.pdf`;

      let request: any = {
        year: parseInt(filters.year),
        month: parseInt(filters.month),
        filename,
      };

      if (filters.selectionMode === 'range' && filters.rangeFrom && filters.rangeTo) {
        request.employee_range = {
          from: filters.rangeFrom,
          to: filters.rangeTo,
        };
      } else {
        request.employee_ids = selectedIds;
      }

      const response = await PayrollService.generatePayroll(request);

      if (response instanceof Blob) {
        // Download the PDF
        PayrollService.downloadBlob(response, filename);
        setSuccess(`Payroll PDF generated and downloaded successfully for ${selectedIds.length} employees`);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError('Failed to generate payroll PDF');
    }

    setGenerateLoading(false);
  };

  const selectedIds = getSelectedEmployeeIds();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Generate payslips and calculate bonuses for employees</p>
        </div>
      </div>

      <Tabs defaultValue="payroll" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="bonus">Bonus</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Payroll Generation</h2>
              <p className="text-muted-foreground">Generate and download payslips for employees</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {selectedIds.length} Selected
            </Badge>
          </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Filters & Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Site Filter */}
              {sites.length > 0 && (
                <div className="space-y-2">
                  <Label>Site Filter</Label>
                  {sites.length === 1 ? (
                    <div className="p-2 bg-muted rounded-md text-sm">
                      <strong>Site:</strong> {sites[0].site_name || 'Unnamed Site'}
                    </div>
                  ) : (
                    <Select value={filters.siteId || "all"} onValueChange={(value) => handleFilterChange('siteId', value === "all" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a site" />
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
                  )}
                </div>
              )}

              {/* Month and Year Selection */}
              <div className="space-y-2">
                <Label>Pay Period</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Year</Label>
                    <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                      <SelectTrigger>
                        <SelectValue />
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
                  <div>
                    <Label className="text-xs text-muted-foreground">Month</Label>
                    <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
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
                  </div>
                </div>
              </div>

              <Separator />

              {/* Selection Mode */}
              <div className="space-y-2">
                <Label>Selection Mode</Label>
                <Tabs value={filters.selectionMode} onValueChange={(value) => handleFilterChange('selectionMode', value as SelectionMode)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single">Single</TabsTrigger>
                    <TabsTrigger value="range">Range</TabsTrigger>
                    <TabsTrigger value="multi">Multi</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="space-y-2">
                    <Label>Select Employee</Label>
                    <Select value={filters.selectedEmployeeId?.toString() || 'none'} onValueChange={(value) => handleFilterChange('selectedEmployeeId', value !== 'none' ? parseInt(value) : null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select an employee</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                            {emp.employee_id} - {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>

                  <TabsContent value="range" className="space-y-2">
                    <Label>Employee ID Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">From ID</Label>
                        <Input
                          type="number"
                          placeholder="From"
                          value={filters.rangeFrom || ''}
                          onChange={(e) => handleFilterChange('rangeFrom', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">To ID</Label>
                        <Input
                          type="number"
                          placeholder="To"
                          value={filters.rangeTo || ''}
                          onChange={(e) => handleFilterChange('rangeTo', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="multi" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Multiple Employees</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-xs"
                      >
                        {filteredEmployees.every(emp => filters.selectedEmployeeIds.includes(emp.employee_id)) ? (
                          <>
                            <Square className="h-3 w-3 mr-1" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Select All
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                      {loading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        filteredEmployees.map(emp => (
                          <div key={emp.employee_id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={filters.selectedEmployeeIds.includes(emp.employee_id)}
                              onCheckedChange={() => handleEmployeeToggle(emp.employee_id)}
                            />
                            <div className="flex-1 text-sm">
                              <div className="font-medium">{emp.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {emp.employee_id} | {emp.department} | {emp.skill_level}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handlePreview}
                  disabled={previewLoading}
                  variant="outline"
                  className="w-full"
                >
                  {previewLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Preview (First 3)
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={generateLoading}
                  className="w-full"
                >
                  {generateLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Generate PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payslip Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewHtml ? (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-96 border-0"
                    title="Payslip Preview"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Preview" to see payslip layout</p>
                    <p className="text-sm">Preview shows first 3 selected employees</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

        </TabsContent>

        <TabsContent value="bonus" className="space-y-6">
          <BonusCalculation sites={sites} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
