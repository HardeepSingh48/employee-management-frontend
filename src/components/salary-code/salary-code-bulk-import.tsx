'use client';

import React, { useCallback, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { salaryCodesService } from '@/lib/salary-codes-service';

type ParsedRow = {
  site_name: string;
  rank: string;
  state: string;
  base_wage: number;
};

const REQUIRED_HEADERS = ['Site name', 'Rank', 'State Name', 'Wages'];

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
}

export default function SalaryCodeBulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const handleDownloadTemplate = useCallback(() => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      REQUIRED_HEADERS,
      ['Acme Plant', 'Security Guard', 'Karnataka', 15000],
      ['Contoso Mall', 'Supervisor', 'Maharashtra', 22000]
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Codes');
    XLSX.writeFile(workbook, 'salary_codes_bulk_template.xlsx');
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setErrors(['Please upload an Excel file (.xlsx or .xls).']);
      return;
    }
    setFile(f);
    setErrors([]);
    setRows([]);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const wb = XLSX.read(evt.target?.result as string | ArrayBuffer, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!json.length) {
          setErrors(['The selected sheet is empty.']);
          setRows([]);
          return;
        }

        // Build a header map by normalizing keys
        const firstRow = json[0];
        const availableHeaders = Object.keys(firstRow);
        const headerMap: Record<string, string> = {};
        for (const h of availableHeaders) {
          headerMap[normalizeHeader(h)] = h;
        }

        // Validate required headers
        const missing = REQUIRED_HEADERS.filter(h => !(normalizeHeader(h) in headerMap));
        if (missing.length) {
          setErrors([`Missing required columns: ${missing.join(', ')}`]);
          setRows([]);
          return;
        }

        const mappedRows: ParsedRow[] = [];
        const rowErrors: string[] = [];

        for (let i = 0; i < json.length; i++) {
          const r = json[i];
          const site = String(r[headerMap[normalizeHeader('Site name')]] ?? '').trim();
          const rank = String(r[headerMap[normalizeHeader('Rank')]] ?? '').trim();
          const state = String(r[headerMap[normalizeHeader('State Name')]] ?? '').trim();
          const wageRaw = r[headerMap[normalizeHeader('Wages')]];
          const wage = typeof wageRaw === 'number' ? wageRaw : parseFloat(String(wageRaw).toString().replace(/,/g, ''));

          if (!site && !rank && !state && (wage === undefined || wage === null || Number.isNaN(wage))) {
            continue; // skip empty rows
          }

          const missingFields: string[] = [];
          if (!site) missingFields.push('Site name');
          if (!rank) missingFields.push('Rank');
          if (!state) missingFields.push('State Name');
          if (Number.isNaN(wage) || wage <= 0) missingFields.push('Wages');

          if (missingFields.length) {
            rowErrors.push(`Row ${i + 2}: Missing/invalid ${missingFields.join(', ')}`);
            continue;
          }

          mappedRows.push({
            site_name: site,
            rank,
            state,
            base_wage: wage,
          });
        }

        setRows(mappedRows);
        setErrors(rowErrors);
      } catch (err: any) {
        setErrors([`Failed to parse file: ${err?.message || String(err)}`]);
        setRows([]);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(f);
  }, []);

  const handleImport = useCallback(async () => {
    if (!rows.length) {
      setResultMsg('No valid rows to import.');
      return;
    }
    setIsImporting(true);
    setResultMsg(null);
    try {
      const res = await salaryCodesService.bulkCreateSalaryCodes(rows);
      const created = res?.created_count ?? res?.created_codes?.length ?? 0;
      const errCount = res?.error_count ?? res?.errors?.length ?? 0;
      setResultMsg(`Imported ${created} salary codes. ${errCount} error(s).`);
    } catch (e: any) {
      setResultMsg(e?.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  }, [rows]);

  const preview = useMemo(() => rows.slice(0, 10), [rows]);

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Bulk Import Salary Codes</h2>
        <p className="text-gray-600 mt-1">Upload an Excel file with columns: <strong>Site name, Rank, State Name, Wages</strong>.</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            Download Template
          </button>
          <button
            onClick={handleImport}
            disabled={!rows.length || isParsing || isImporting}
            className={`px-3 py-2 rounded-md ${(!rows.length || isParsing || isImporting) ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {isImporting ? 'Importing…' : 'Import'}
          </button>
        </div>

        {isParsing && (
          <div className="text-gray-600">Parsing file…</div>
        )}

        {resultMsg && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{resultMsg}</div>
        )}

        {errors.length > 0 && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 space-y-1">
            {errors.map((e, idx) => (
              <div key={idx}>{e}</div>
            ))}
          </div>
        )}

        <div className="text-gray-700">Valid rows ready to import: {rows.length}</div>

        {preview.length > 0 && (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Site Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Base Wage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 whitespace-nowrap">{r.site_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{r.rank}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{r.state}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{r.base_wage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > preview.length && (
              <div className="text-xs text-gray-500 px-3 py-2">and {rows.length - preview.length} more…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



