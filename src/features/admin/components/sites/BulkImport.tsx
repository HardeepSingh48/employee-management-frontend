"use client";

import React, { useState, useRef, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { sitesService } from '@/lib/sites-service';

interface SiteData {
  site_name: string;
  location: string;
  state: string;
}

const REQUIRED_HEADERS = ['Site name', 'State'];
const OPTIONAL_HEADERS = ['Location'];

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
}

export default function BulkImport() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<SiteData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = useCallback(() => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Site name', 'Location', 'State'],
      ['Acme Plant', 'Industrial Area', 'Karnataka'],
      ['Contoso Mall', 'Downtown', 'Maharashtra']
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sites');
    XLSX.writeFile(workbook, 'sites_bulk_template.xlsx');
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewData([]);
    setErrors([]);

    // Check file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv' && fileType !== 'xlsx' && fileType !== 'xls') {
      toast({
        title: 'Error',
        description: 'Please upload a CSV or Excel file',
        variant: 'destructive'
      });
      return;
    }

    setIsParsing(true);

    if (fileType === 'csv') {
      // Handle CSV files
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            setErrors(['CSV file must have at least a header row and one data row']);
            setIsParsing(false);
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          parseCsvData(headers, lines.slice(1));
        } catch (error: any) {
          setErrors([`Failed to parse CSV: ${error.message}`]);
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target?.result as ArrayBuffer, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!jsonData.length) {
            setErrors(['The selected sheet is empty']);
            setIsParsing(false);
            return;
          }

          parseExcelData(jsonData);
        } catch (error: any) {
          setErrors([`Failed to parse Excel file: ${error.message}`]);
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const parseCsvData = (headers: string[], dataLines: string[]) => {
    // Build header map
    const headerMap: Record<string, string> = {};
    for (const header of headers) {
      headerMap[normalizeHeader(header)] = header;
    }

    // Validate required headers
    const missingHeaders = REQUIRED_HEADERS.filter(h => !(normalizeHeader(h) in headerMap));
    if (missingHeaders.length) {
      setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      return;
    }

    const parsedData: SiteData[] = [];
    const rowErrors: string[] = [];

    dataLines.forEach((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        rowErrors.push(`Row ${index + 2}: Column count mismatch`);
        return;
      }

      const rowData: Record<string, string> = {};
      headers.forEach((header, i) => {
        rowData[header] = values[i] || '';
      });

      const siteName = rowData[headerMap[normalizeHeader('Site name')]]?.trim();
      const state = rowData[headerMap[normalizeHeader('State')]]?.trim();
      const location = rowData[headerMap[normalizeHeader('Location')] || '']?.trim() || '';

      if (!siteName || !state) {
        rowErrors.push(`Row ${index + 2}: Missing required fields (Site name, State)`);
        return;
      }

      parsedData.push({
        site_name: siteName,
        location: location,
        state: state
      });
    });

    setPreviewData(parsedData);
    setErrors(rowErrors);
  };

  const parseExcelData = (jsonData: Record<string, any>[]) => {
    // Build header map
    const firstRow = jsonData[0];
    const availableHeaders = Object.keys(firstRow);
    const headerMap: Record<string, string> = {};
    
    for (const header of availableHeaders) {
      headerMap[normalizeHeader(header)] = header;
    }

    // Validate required headers
    const missingHeaders = REQUIRED_HEADERS.filter(h => !(normalizeHeader(h) in headerMap));
    if (missingHeaders.length) {
      setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      return;
    }

    const parsedData: SiteData[] = [];
    const rowErrors: string[] = [];

    jsonData.forEach((row, index) => {
      const siteName = String(row[headerMap[normalizeHeader('Site name')]] || '').trim();
      const state = String(row[headerMap[normalizeHeader('State')]] || '').trim();
      const location = String(row[headerMap[normalizeHeader('Location')] || ''] || '').trim();

      // Skip completely empty rows
      if (!siteName && !state && !location) {
        return;
      }

      if (!siteName || !state) {
        rowErrors.push(`Row ${index + 2}: Missing required fields (Site name, State)`);
        return;
      }

      parsedData.push({
        site_name: siteName,
        location: location,
        state: state
      });
    });

    setPreviewData(parsedData);
    setErrors(rowErrors);
  };

 const handleImport = async () => {
  if (!previewData.length) {
    toast({
      title: 'Error',
      description: 'No valid data to import',
      variant: 'destructive'
    });
    return;
  }

  setImporting(true);

  try {
    // Create Excel file with the cleaned, unique data
    // Map to the exact column names the backend expects
    const worksheet = XLSX.utils.json_to_sheet(
      previewData.map(item => ({
        'site_name': item.site_name,  // backend expects 'site_name'
        'location': item.location || '',  // backend expects 'location'
        'state': item.state  // backend expects 'state'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sites');
    
    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });
    
    // Create File object from buffer
    const dataFile = new File(
      [new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })],
      'sites_import_cleaned.xlsx',
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        lastModified: Date.now()
      }
    );

    const response = await sitesService.bulkImportSites(dataFile); // ← This should be dataFile, NOT previewData

    toast({
      title: 'Success',
      description: `Bulk import completed. Created: ${response.created || previewData.length}`,
      variant: 'default'
    });

    // Reset form
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || error.message || 'Failed to import sites',
      variant: 'destructive'
    });
  } finally {
    setImporting(false);
  }
};

  const previewRows = useMemo(() => previewData.slice(0, 10), [previewData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Sites</CardTitle>
          <CardDescription>
            Upload a CSV or Excel file containing site information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Choose File
            </label>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              size="sm"
            >
              Download Template
            </Button>
            <span className="text-sm text-gray-500">
              {file ? file.name : 'No file chosen'}
            </span>
          </div>
          
          {isParsing && (
            <div className="text-sm text-blue-600">
              Parsing file...
            </div>
          )}

          {errors.length > 0 && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 space-y-1">
              <strong>Errors found:</strong>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            <p><strong>Required columns:</strong> Site name, State</p>
            <p><strong>Optional column:</strong> Location</p>
            <p className="mt-2 text-blue-600">Note: Site IDs will be auto-generated</p>
            {previewData.length > 0 && (
              <p className="text-green-600">Valid rows ready to import: {previewData.length}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleImport}
              disabled={!previewData.length || importing || isParsing}
            >
              {importing ? 'Importing...' : 'Import Sites'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data</CardTitle>
            <CardDescription>
              Review the data before importing ({previewData.length} total rows)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((site, index) => (
                  <TableRow key={index}>
                    <TableCell>{site.site_name}</TableCell>
                    <TableCell>{site.location || '-'}</TableCell>
                    <TableCell>{site.state}</TableCell>
                  </TableRow>
                ))}
                {previewData.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      ... and {previewData.length - 10} more rows
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}