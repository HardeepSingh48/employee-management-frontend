'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, MapPin, Users, FileSpreadsheet, Shield, AlertCircle } from 'lucide-react';
import FormB from '@/components/salary/compliance/FormB';

// Form A Component
function FormAComponent() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handleDownload = () => {
    if (!selectedMonth || !selectedSite || !selectedYear) {
      alert('Please select month, site, and year before downloading');
      return;
    }
    // Implement Form A download logic
    console.log('Downloading Form A for:', { selectedMonth, selectedSite, selectedYear });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
        <FilterControls 
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSite={selectedSite}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedSite={setSelectedSite}
          onDownload={handleDownload}
          formName="Form A"
        />
      </div>
      <div className="text-center py-8">
        <FileText className="w-16 h-16 mx-auto text-blue-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">Employee Registration Form</h3>
        <p className="text-gray-500">Employee basic information and registration details</p>
      </div>
    </div>
  );
}




// Form C Component
function FormCComponent() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handleDownload = () => {
    if (!selectedMonth || !selectedSite || !selectedYear) {
      alert('Please select month, site, and year before downloading');
      return;
    }
    // Implement Form C download logic
    console.log('Downloading Form C for:', { selectedMonth, selectedSite, selectedYear });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-purple-50 rounded-lg">
        <FilterControls 
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSite={selectedSite}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedSite={setSelectedSite}
          onDownload={handleDownload}
          formName="Form C"
        />
      </div>
      <div className="text-center py-8">
        <Calendar className="w-16 h-16 mx-auto text-purple-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">Attendance & Overtime Records</h3>
        <p className="text-gray-500">Daily attendance and overtime calculation records</p>
      </div>
    </div>
  );
}

// Form D Component
function FormDComponent() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handleDownload = () => {
    if (!selectedMonth || !selectedSite || !selectedYear) {
      alert('Please select month, site, and year before downloading');
      return;
    }
    // Implement Form D download logic
    console.log('Downloading Form D for:', { selectedMonth, selectedSite, selectedYear });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-orange-50 rounded-lg">
        <FilterControls 
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSite={selectedSite}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedSite={setSelectedSite}
          onDownload={handleDownload}
          formName="Form D"
        />
      </div>
      <div className="text-center py-8">
        <Shield className="w-16 h-16 mx-auto text-orange-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">Leave & Holiday Records</h3>
        <p className="text-gray-500">Employee leave applications and holiday calendar</p>
      </div>
    </div>
  );
}

interface FilterControlsProps {
  selectedYear: string;
  selectedMonth: string;
  selectedSite: string;
  setSelectedYear: (year: string) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedSite: (site: string) => void;
  onDownload: () => void;
  formName: string;
}
// Reusable Filter Controls Component
function FilterControls({ 
  selectedYear, 
  selectedMonth, 
  selectedSite, 
  setSelectedYear, 
  setSelectedMonth, 
  setSelectedSite, 
  onDownload, 
  formName 
}:FilterControlsProps) {
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const sites = [
    { value: 'VADHWAN-GDC-DELUX-BEARING-PVT-LTD', label: 'Vadhwan GDC Delux Bearing Pvt Ltd' },
    { value: 'RAJKOT-INDUSTRIAL-ESTATE', label: 'Rajkot Industrial Estate' },
    { value: 'AHMEDABAD-BRANCH', label: 'Ahmedabad Branch' }
  ];

  const years = ['2023', '2024', '2025'].map(year => ({ value: year, label: year }));

  return (
    <>
      <div>
        <Label htmlFor="year">Year</Label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
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
      <div>
        <Label htmlFor="month">Month</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
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
      <div>
        <Label htmlFor="site">Site</Label>
        <Select value={selectedSite} onValueChange={setSelectedSite}>
          <SelectTrigger>
            <SelectValue placeholder="Select site" />
          </SelectTrigger>
          <SelectContent>
            {sites.map(site => (
              <SelectItem key={site.value} value={site.value}>
                {site.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button onClick={onDownload} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download {formName}
        </Button>
      </div>
    </>
  );
}

// Main Compliance Reports Component
export default function ComplianceReports() {
  const [activeForm, setActiveForm] = useState('formB');

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveForm('formA')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Form A
              </span>
              <Users className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Employee Registration</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-green-200" onClick={() => setActiveForm('formB')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                Form B
              </span>
              <AlertCircle className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Wages Register</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveForm('formC')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Form C
              </span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Attendance Records</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveForm('formD')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600" />
                Form D
              </span>
              <Shield className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Leave & Holidays</div>
          </CardContent>
        </Card>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeForm} onValueChange={setActiveForm} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="formA" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Form A
          </TabsTrigger>
          <TabsTrigger value="formB" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Form B
          </TabsTrigger>
          <TabsTrigger value="formC" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Form C
          </TabsTrigger>
          <TabsTrigger value="formD" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Form D
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formA">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Form A - Employee Registration
              </CardTitle>
              <CardDescription>
                Employee basic information and registration details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormAComponent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formB">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Form B - Central Register of Wages
              </CardTitle>
              <CardDescription>
                Monthly wages register with earnings and deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormB />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formC">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Form C - Attendance & Overtime Records
              </CardTitle>
              <CardDescription>
                Daily attendance and overtime calculation records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormCComponent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formD">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                Form D - Leave & Holiday Records
              </CardTitle>
              <CardDescription>
                Employee leave applications and holiday calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormDComponent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}