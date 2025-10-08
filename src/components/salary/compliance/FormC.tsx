'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formsService, FormCEmployee, FormCTotals } from '@/lib/forms-service';

export default function FormC() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [formCData, setFormCData] = useState<FormCEmployee[]>([]);
  const [totals, setTotals] = useState<FormCTotals | null>(null);
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

  // Load Form C data when filters change
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadFormCData();
    }
  }, [selectedMonth, selectedYear, selectedSite]);

  const loadFormCData = async () => {
    if (!selectedMonth || !selectedYear) return;

    setIsLoading(true);
    try {
      const response = await formsService.getFormCData({
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        site: selectedSite && selectedSite !== 'all' ? selectedSite : undefined,
      });

      setFormCData(response.data);
      setTotals(response.totals);
    } catch (error: any) {
      console.error('Failed to load Form C data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load Form C data',
        variant: 'destructive',
      });
      setFormCData([]);
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
      const blob = await formsService.downloadFormCExcel({
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        site: selectedSite && selectedSite !== 'all' ? selectedSite : undefined,
      });

      const filename = formsService.generateFormCExcelFilename(
        selectedSite && selectedSite !== 'all' ? selectedSite : 'All',
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );

      formsService.triggerFileDownload(blob, filename);

      toast({
        title: 'Success',
        description: 'Form C Excel file downloaded successfully',
      });
    } catch (error: any) {
      console.error('Failed to download Form C:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download Form C Excel file',
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
            {isDownloading ? 'Downloading...' : 'Download Form C'}
          </Button>
        </div>
      </div>

      {/* Form C Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-purple-50">
            <tr>
              <th className="border p-2 text-center">Sl.No</th>
              <th className="border p-2 text-center">Member Name</th>
              <th className="border p-2 text-center">Gross Wages</th>
              <th className="border p-2 text-center">EPF Wages</th>
              <th className="border p-2 text-center">EPS Wages</th>
              <th className="border p-2 text-center">EDLI Wages</th>
              <th className="border p-2 text-center">EPF Contribution</th>
              <th className="border p-2 text-center">EPS Contribution</th>
              <th className="border p-2 text-center">EPF EPS Diff</th>
              <th className="border p-2 text-center">NCP Days</th>
              <th className="border p-2 text-center">Refund of Advance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className="border p-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Loading Form C data...
                  </div>
                </td>
              </tr>
            ) : formCData.length === 0 ? (
              <tr>
                <td colSpan={11} className="border p-8 text-center text-gray-500">
                  {selectedMonth && selectedYear
                    ? 'No data found for the selected criteria'
                    : 'Please select month and year to view data'
                  }
                </td>
              </tr>
            ) : (
              <>
                {formCData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{row.slNo}</td>
                    <td className="border p-2">{row.memberName}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.grossWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.epfWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.epsWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.edliWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.epfContribution)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.epsContribution)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.epfEpsDiff)}</td>
                    <td className="border p-2 text-center">{row.ncpDays}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.refundOfAdvance)}</td>
                  </tr>
                ))}
                {totals && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2">TOTAL</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalGrossWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalEpfWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalEpsWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalEdliWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalEpfContribution)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalEpsContribution)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalEpfEpsDiff)}</td>
                    <td className="border p-2 text-center">{totals.totalNcpDays}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalRefundOfAdvance)}</td>
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