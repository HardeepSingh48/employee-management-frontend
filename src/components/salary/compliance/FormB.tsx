'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formsService, FormBEmployee, FormBTotals } from '@/lib/forms-service';



export default function FormB() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [formBData, setFormBData] = useState<FormBEmployee[]>([]);
  const [totals, setTotals] = useState<FormBTotals | null>(null);
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

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

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Load available sites on component mount
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await formsService.getAvailableSites();
        setAvailableSites(sites);
      } catch (error) {
        console.error('Failed to load sites:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available sites',
          variant: 'destructive',
        });
      }
    };

    loadSites();
  }, [toast]);

  // Load Form B data when filters change
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadFormBData();
    }
  }, [selectedMonth, selectedYear, selectedSite]);

  const loadFormBData = async () => {
    if (!selectedMonth || !selectedYear) return;

    setIsLoading(true);
    try {
      const response = await formsService.getFormBData({
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        site: selectedSite && selectedSite !== 'all' ? selectedSite : undefined,
      });

      setFormBData(response.data);
      setTotals(response.totals);
    } catch (error: any) {
      console.error('Failed to load Form B data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load Form B data',
        variant: 'destructive',
      });
      setFormBData([]);
      setTotals(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({
        title: 'Error',
        description: 'Please select month and year before downloading',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await formsService.downloadFormBExcel({
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        site: selectedSite && selectedSite !== 'all' ? selectedSite : undefined,
      });

      const filename = formsService.generateExcelFilename(
        selectedSite && selectedSite !== 'all' ? selectedSite : 'All',
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );

      formsService.triggerFileDownload(blob, filename);

      toast({
        title: 'Success',
        description: 'Form B Excel file downloaded successfully',
      });
    } catch (error: any) {
      console.error('Failed to download Form B:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download Form B Excel file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
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
              <SelectValue placeholder="Select site (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {availableSites.filter(site => site && site.trim() !== '').map(site => (
                <SelectItem key={site} value={site}>
                  {site}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleDownload}
            className="w-full"
            disabled={isDownloading || !selectedMonth || !selectedYear}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? 'Downloading...' : 'Download Form B'}
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
            {isLoading ? (
              <tr>
                <td colSpan={22} className="border p-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Loading Form B data...
                  </div>
                </td>
              </tr>
            ) : formBData.length === 0 ? (
              <tr>
                <td colSpan={22} className="border p-8 text-center text-gray-500">
                  {selectedMonth && selectedYear
                    ? 'No data found for the selected criteria'
                    : 'Please select month and year to view data'
                  }
                </td>
              </tr>
            ) : (
              <>
                {formBData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{row.slNo}</td>
                    <td className="border p-2 text-center">{row.employeeCode}</td>
                    <td className="border p-2">{row.employeeName}</td>
                    <td className="border p-2 text-center">{row.designation}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.rateOfWage.bs)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.rateOfWage.da)}</td>
                    <td className="border p-2 text-center">{row.daysWorked}</td>
                    <td className="border p-2 text-center">{row.overtime}</td>
                    <td className="border p-2 text-center">{row.totalDays.toFixed(1)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.grossEarnings.bs)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.grossEarnings.da)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.grossEarnings.hra)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.grossEarnings.cov)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.grossEarnings.ota)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.grossEarnings.ae)}</td>
                    <td className="border p-2 text-right font-semibold">{formsService.formatNumber(row.totalEarnings)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.deductions.pf)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.deductions.esi)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.deductions.cit)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.deductions.ptax)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.deductions.adv)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.deductions.total)}</td>
                    <td className="border p-2 text-right font-semibold text-green-600">{formsService.formatNumber(row.netPayable)}</td>
                  </tr>
                ))}
                {totals && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2">TOTAL</td>
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-center">{totals.totalDaysWorked}</td>
                    <td className="border p-2 text-center">{totals.totalOvertime.toFixed(1)}</td>
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalEarnings)}</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">-</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalDeductions)}</td>
                    <td className="border p-2 text-right text-green-600">{formsService.formatNumber(totals.totalNetPayable)}</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}