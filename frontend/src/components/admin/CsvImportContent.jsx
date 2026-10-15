'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_CSV = `SKU,NAME,SIZE,COLOR,STOCK,PRICE
ELK-01-S,Handloom Emerald Lawn Kurta,S,Emerald,15,14500
ELK-01-M,Handloom Emerald Lawn Kurta,M,Emerald,25,14500
RMK-02-7,Kasur Royal Marori Khussa,7 PK,Maroon,12,8200
RMK-02-8,Kasur Royal Marori Khussa,8 PK,Maroon,8,8200`;

export function CsvImportContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [validationResult, setValidationResult] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);

  const parseCsv = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map((v) => v.trim());
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }
    return rows;
  };

  // Validate Mutation
  const validateMutation = useMutation({
    mutationFn: async (rows) => {
      return await apiClient('/admin/products/import/validate', {
        method: 'POST',
        body: { rows },
      });
    },
    onSuccess: (data) => {
      setValidationResult(data);
      toast.success(`Validation finished: ${data.validRows} valid rows, ${data.invalidRows} errors`);
    },
    onError: (err) => {
      toast.error(err.message || 'Validation failed');
    },
  });

  // Commit Mutation
  const commitMutation = useMutation({
    mutationFn: async (rows) => {
      return await apiClient('/admin/products/import/commit', {
        method: 'POST',
        body: { rows },
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Stock successfully updated');
      queryClient.invalidateQueries(['admin', 'products']);
      queryClient.invalidateQueries(['admin', 'dashboard']);
      router.push('/admin/products');
    },
    onError: (err) => {
      toast.error(err.message || 'Commit failed');
    },
  });

  const handleValidate = () => {
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      toast.error('Please enter at least one valid row of CSV data');
      return;
    }
    setParsedRows(rows);
    validateMutation.mutate(rows);
  };

  const handleCommit = () => {
    if (!validationResult || validationResult.validRows === 0) {
      toast.error('Please validate your data first before committing');
      return;
    }
    commitMutation.mutate(parsedRows);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E6E1DA]">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="sm" className="bg-white text-xs">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Products
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#151515]">
              CSV Inventory Import Wizard
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              Bulk update variant stock and integer PKR pricing in atomic batches.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCsvText(SAMPLE_CSV)}
          className="text-xs text-[#8F1A1E] font-semibold hover:underline flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          Load Sample
        </button>
      </div>

      {/* CSV Input Card */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#151515] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#D12C2F]" />
            Paste CSV Data (Comma-Separated)
          </label>
          <p className="text-[11px] text-[#6B6B6B]">
            Format: `SKU,NAME,SIZE,COLOR,STOCK,PRICE` (Prices must be integer PKR)
          </p>
        </div>

        <textarea
          rows={8}
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            setValidationResult(null);
          }}
          className="w-full p-4 rounded-xl font-mono text-xs bg-[#F6F2EC] text-[#151515] border border-[#E6E1DA] focus:outline-none focus:border-[#151515] leading-relaxed"
          placeholder="Paste CSV rows here..."
        />

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            disabled={validateMutation.isPending}
            onClick={handleValidate}
            className="bg-[#151515] hover:bg-black text-white text-xs font-bold"
          >
            {validateMutation.isPending ? 'Validating...' : 'Validate Batch Rows'}
          </Button>

          {validationResult && (
            <Button
              type="button"
              disabled={commitMutation.isPending || validationResult.validRows === 0}
              onClick={handleCommit}
              className="bg-[#D12C2F] hover:bg-[#B52528] text-white text-xs font-bold flex items-center gap-2"
            >
              <span>{commitMutation.isPending ? 'Applying...' : `Commit ${validationResult.validRows} Rows`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Validation Results Card */}
      {validationResult && (
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-[#151515]">Validation Diagnostics</h2>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {validationResult.validRows} Valid
              </span>
              {validationResult.invalidRows > 0 && (
                <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                  {validationResult.invalidRows} Errors
                </span>
              )}
            </div>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-xs text-rose-800">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Row Errors Found:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {validationResult.errors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row} ({err.field}): {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Preview Table */}
          <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Stock Units</th>
                  <th className="py-2.5 px-3">Price (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F6F2EC]/40">
                    <td className="py-2 px-3 font-mono font-bold text-[#151515]">{row.sku}</td>
                    <td className="py-2 px-3">{row.name}</td>
                    <td className="py-2 px-3 font-semibold">{row.size}</td>
                    <td className="py-2 px-3 font-mono font-bold text-[#151515]">{row.stock}</td>
                    <td className="py-2 px-3 font-mono font-bold text-[#151515]">
                      {row.price ? formatPKR(Number(row.price)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
