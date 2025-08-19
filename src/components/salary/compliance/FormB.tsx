'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

const mockFormBData = [
  {
    slNo: 1,
    employeeCode: 'CN008',
    employeeName: 'Parmar Santabhai Himmatbhai',
    designation: 'HK',
    rateOfWage: { bs: 8308, da: 1752 },
    daysWorked: 26,
    overtime: 2,
    totalDays: 27,
    grossEarnings: { bs: 6700, da: 1415, hra: 0, cov: 0, ota: 481, ae: 0 },
    totalEarnings: 8634,
    deductions: { esi: 374, ct: 61, ptax: 0, adv: 80, total: 515 },
    netPayable: 7473
  },
  {
    slNo: 2,
    employeeCode: 'CN054',
    employeeName: 'Chhagabai Kiranbhai Kevadiya',
    designation: 'Assembly Worker',
    rateOfWage: { bs: 8308, da: 1752 },
    daysWorked: 26,
    overtime: 0,
    totalDays: 26,
    grossEarnings: { bs: 6700, da: 1415, hra: 0, cov: 0, ota: 0, ae: 0 },
    totalEarnings: 8115,
    deductions: { esi: 374, ct: 61, ptax: 0, adv: 80, total: 515 },
    netPayable: 6398
  },
  // Add more mock data as needed
];

export default function FormB() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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

  const handleDownload = () => {
    if (!selectedMonth || !selectedSite || !selectedYear) {
      alert('Please select month, site, and year before downloading');
      return;
    }

    // Create CSV content
    const headers = [
      'Sl.No', 'Employee Code', 'Employee Name', 'Designation', 
      'Rate of Wage (BS)', 'Rate of Wage (DA)', 'Days Worked', 'Overtime', 'Total Days',
      'BS', 'DA', 'HRA', 'COV', 'OTA', 'AE', 'Total Earnings',
      'ESI', 'CT', 'PTAX', 'ADV', 'Total Deductions', 'Net Payable'
    ];

    const csvContent = [
      headers.join(','),
      ...mockFormBData.map(row => [
        row.slNo,
        row.employeeCode,
        `"${row.employeeName}"`,
        `"${row.designation}"`,
        row.rateOfWage.bs,
        row.rateOfWage.da,
        row.daysWorked,
        row.overtime,
        row.totalDays,
        row.grossEarnings.bs,
        row.grossEarnings.da,
        row.grossEarnings.hra,
        row.grossEarnings.cov,
        row.grossEarnings.ota,
        row.grossEarnings.ae,
        row.totalEarnings,
        row.deductions.esi,
        row.deductions.ct,
        row.deductions.ptax,
        row.deductions.adv,
        row.deductions.total,
        row.netPayable
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Form-B-${selectedSite}-${selectedYear}-${selectedMonth}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
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
          <Button onClick={handleDownload} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Form B
          </Button>
        </div>
      </div>

      {/* Form B Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th rowSpan={3} className="border p-2 text-center">Sl.No</th>
              <th rowSpan={3} className="border p-2 text-center">Employee Code</th>
              <th rowSpan={3} className="border p-2 text-center">Employee Name</th>
              <th rowSpan={3} className="border p-2 text-center">Designation</th>
              <th colSpan={2} className="border p-2 text-center">Rate of Wage</th>
              <th rowSpan={3} className="border p-2 text-center">Days Worked</th>
              <th rowSpan={3} className="border p-2 text-center">Overtime</th>
              <th rowSpan={3} className="border p-2 text-center">Total Days</th>
              <th colSpan={6} className="border p-2 text-center">Gross Earnings</th>
              <th rowSpan={3} className="border p-2 text-center">Total Earnings</th>
              <th colSpan={5} className="border p-2 text-center">Deductions</th>
              <th rowSpan={3} className="border p-2 text-center">Net Payable</th>
            </tr>
            <tr>
              <th className="border p-1 text-center">BS</th>
              <th className="border p-1 text-center">DA</th>
              <th className="border p-1 text-center">BS</th>
              <th className="border p-1 text-center">DA</th>
              <th className="border p-1 text-center">HRA</th>
              <th className="border p-1 text-center">COV</th>
              <th className="border p-1 text-center">OTA</th>
              <th className="border p-1 text-center">AE</th>
              <th className="border p-1 text-center">ESI</th>
              <th className="border p-1 text-center">CT</th>
              <th className="border p-1 text-center">PTAX</th>
              <th className="border p-1 text-center">ADV</th>
              <th className="border p-1 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {mockFormBData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{row.slNo}</td>
                <td className="border p-2 text-center">{row.employeeCode}</td>
                <td className="border p-2">{row.employeeName}</td>
                <td className="border p-2 text-center">{row.designation}</td>
                <td className="border p-2 text-right">{row.rateOfWage.bs}</td>
                <td className="border p-2 text-right">{row.rateOfWage.da}</td>
                <td className="border p-2 text-center">{row.daysWorked}</td>
                <td className="border p-2 text-center">{row.overtime}</td>
                <td className="border p-2 text-center">{row.totalDays}</td>
                <td className="border p-2 text-right">{row.grossEarnings.bs}</td>
                <td className="border p-2 text-right">{row.grossEarnings.da}</td>
                <td className="border p-2 text-right">{row.grossEarnings.hra}</td>
                <td className="border p-2 text-right">{row.grossEarnings.cov}</td>
                <td className="border p-2 text-right">{row.grossEarnings.ota}</td>
                <td className="border p-2 text-right">{row.grossEarnings.ae}</td>
                <td className="border p-2 text-right font-semibold">{row.totalEarnings}</td>
                <td className="border p-2 text-right">{row.deductions.esi}</td>
                <td className="border p-2 text-right">{row.deductions.ct}</td>
                <td className="border p-2 text-right">{row.deductions.ptax}</td>
                <td className="border p-2 text-right">{row.deductions.adv}</td>
                <td className="border p-2 text-right">{row.deductions.total}</td>
                <td className="border p-2 text-right font-semibold text-green-600">{row.netPayable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}