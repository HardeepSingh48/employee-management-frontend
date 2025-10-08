'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formsService, FormDEmployee, FormDTotals } from '@/lib/forms-service';

export default function FormD() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [formDData, setFormDData] = useState<FormDEmployee[]>([]);
  const [totals, setTotals] = useState<FormDTotals | null>(null);
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

  // Load Form D data when filters change
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadFormDData();
    }
  }, [selectedMonth, selectedYear, selectedSite]);

  const loadFormDData = async () => {
    if (!selectedMonth || !selectedYear) return;

    setIsLoading(true);
    try {
      const response = await formsService.getFormDData({
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        site: selectedSite && selectedSite !== 'all' ? selectedSite : undefined,
      });

      setFormDData(response.data);
      setTotals(response.totals);
    } catch (error: any) {
      console.error('Failed to load Form D data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load Form D data',
        variant: 'destructive',
      });
      setFormDData([]);
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
      const blob = await formsService.downloadFormDExcel({
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        site: selectedSite && selectedSite !== 'all' ? selectedSite : undefined,
      });

      const filename = formsService.generateFormDExcelFilename(
        selectedSite && selectedSite !== 'all' ? selectedSite : 'All',
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );

      formsService.triggerFileDownload(blob, filename);

      toast({
        title: 'Success',
        description: 'Form D Excel file downloaded successfully',
      });
    } catch (error: any) {
      console.error('Failed to download Form D:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download Form D Excel file',
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
            {isDownloading ? 'Downloading...' : 'Download Form D'}
          </Button>
        </div>
      </div>

      {/* Form D Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-orange-50">
            <tr>
              <th className="border p-2 text-center">Sl. No.</th>
              <th className="border p-2 text-center">Insurance No.</th>
              <th className="border p-2 text-center">Name of the Insured Person</th>
              <th className="border p-2 text-center">No. Of Days</th>
              <th className="border p-2 text-center">Total Monthly Wages</th>
              <th className="border p-2 text-center">IP Contribution</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="border p-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Loading Form D data...
                  </div>
                </td>
              </tr>
            ) : formDData.length === 0 ? (
              <tr>
                <td colSpan={6} className="border p-8 text-center text-gray-500">
                  {selectedMonth && selectedYear
                    ? 'No data found for the selected criteria'
                    : 'Please select month and year to view data'
                  }
                </td>
              </tr>
            ) : (
              <>
                {formDData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{row.slNo}</td>
                    <td className="border p-2 text-center">{row.insuranceNo}</td>
                    <td className="border p-2">{row.nameOfInsuredPerson}</td>
                    <td className="border p-2 text-center">{row.noOfDays}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.totalMonthlyWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(row.ipContribution)}</td>
                  </tr>
                ))}
                {totals && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2">TOTAL</td>
                    <td className="border p-2 text-center">{totals.totalDays}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalMonthlyWages)}</td>
                    <td className="border p-2 text-right">{formsService.formatNumber(totals.totalIpContribution)}</td>
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