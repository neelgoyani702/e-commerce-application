import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileDown,
  FileUp,
  Info,
} from "lucide-react";

function AdminBulk() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bulk/export/products`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        toast.error("Failed to export products");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Products exported successfully!");
    } catch {
      toast.error("Failed to export products");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("csvFile", file);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bulk/import/products`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        setImportResult(data);
        toast.success(data.message || "Import completed!");
      } else {
        toast.error(data.message || "Import failed");
      }
    } catch {
      toast.error("Failed to import products");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImport(file);
  };

  return (
    <div className="max-w-5xl space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-indigo-600" /> Bulk
          Import / Export
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your product catalogue at scale using CSV files.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5">
            <FileDown className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Export Products
          </h2>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Download your entire product catalogue as a CSV spreadsheet. Open
            it in Excel or Google Sheets to review, edit, or use as a
            template for bulk imports.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Exporting..." : "Download CSV"}
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
            <FileUp className="h-7 w-7 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Import Products
          </h2>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Upload a CSV file to bulk-create or update products. If a
            product with the same name already exists, it will be updated.
            New categories are auto-created.
          </p>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-indigo-400 bg-indigo-50/50"
                : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleImport(e.target.files[0])}
            />
            {importing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-indigo-600">
                  Processing your CSV...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">
                  Drop your CSV here or{" "}
                  <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-xs text-gray-400">.csv files only</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Import
            Results
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900">
                {importResult.summary?.total || 0}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Total Rows
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-700">
                {importResult.summary?.created || 0}
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Created
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-blue-700">
                {importResult.summary?.updated || 0}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Updated
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-amber-700">
                {importResult.summary?.skipped || 0}
              </p>
              <p className="text-xs text-amber-600 font-medium mt-1">
                Skipped
              </p>
            </div>
          </div>
          {importResult.errors?.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Errors
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-500">
                    {err}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-8">
        <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-500" /> CSV Format Guide
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-indigo-400 font-bold uppercase tracking-wider border-b border-indigo-100">
                <th className="pb-2 pr-4">Column</th>
                <th className="pb-2 pr-4">Required</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-indigo-800">
              {[
                ["name", "Yes", "Product name (used to match existing products)"],
                ["price", "Yes", "Product price (number)"],
                ["description", "No", "Product description text"],
                ["category", "No", "Category name (auto-created if new)"],
                ["stock", "No", "Stock quantity (default: 0)"],
                ["discount", "No", "Discount percentage 0-100 (default: 0)"],
                ["featured", "No", '"true" or "false" (default: false)'],
                ["image", "No", "Image URL"],
                ["bulletPoints", "No", 'Pipe-separated list: "fast | premium | reliable"'],
              ].map(([col, req, desc]) => (
                <tr key={col} className="border-b border-indigo-50">
                  <td className="py-2 pr-4 font-mono font-bold">{col}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req === "Yes"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {req}
                    </span>
                  </td>
                  <td className="py-2 text-indigo-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminBulk;
