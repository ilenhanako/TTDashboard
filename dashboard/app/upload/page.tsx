"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useDashboard } from "@/lib/context";

interface UploadedFile {
  name: string;
  size: number;
  type: "country" | "global";
}

export default function UploadPage() {
  const { refreshData } = useDashboard();
  const [countryFiles, setCountryFiles] = useState<File[]>([]);
  const [globalFile, setGlobalFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const handleCountryFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCountryFiles(Array.from(files));
      setMessage(null);
    }
  }, []);

  const handleGlobalFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setGlobalFile(files[0]);
      setMessage(null);
    }
  }, []);

  const handleRemoveCountryFile = (index: number) => {
    setCountryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveGlobalFile = () => {
    setGlobalFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleProcessFiles = async () => {
    if (countryFiles.length === 0 && !globalFile) {
      setMessage({ type: "error", text: "Please upload at least one file" });
      return;
    }

    setProcessing(true);
    setMessage({ type: "info", text: "Processing files..." });

    try {
      const formData = new FormData();

      countryFiles.forEach((file) => {
        formData.append("countryFiles", file);
      });

      if (globalFile) {
        formData.append("globalFile", globalFile);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: result.message || "Files processed successfully!" });
        setCountryFiles([]);
        setGlobalFile(null);
        // Refresh the dashboard data
        if (refreshData) {
          await refreshData();
        }
      } else {
        setMessage({ type: "error", text: result.error || "Failed to process files" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error uploading files. Please try again." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="breadcrumb mb-4">
          <Link href="/" className="text-trust-accent hover:underline">
            Home
          </Link>
          <span className="text-secondary mx-2">›</span>
          <span className="font-medium">Upload Data</span>
        </div>
        <h1 className="text-3xl font-bold text-trust-blue">Upload Data Files</h1>
        <p className="text-secondary mt-1">
          Upload WHO GHE Excel files to update the dashboard data
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Files */}
        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-2">Country Data Files</h2>
          <p className="text-sm text-secondary mb-4">
            Upload one or more country DALY Excel files (.xlsx)
          </p>

          <label className="block">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-trust-accent hover:bg-trust-light/30 transition-colors">
              <input
                type="file"
                accept=".xlsx"
                multiple
                onChange={handleCountryFileChange}
                className="hidden"
              />
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm text-secondary">
                Click to select files or drag and drop
              </p>
              <p className="text-xs text-secondary mt-1">
                Accepts .xlsx files
              </p>
            </div>
          </label>

          {/* File List */}
          {countryFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-secondary">
                {countryFiles.length} file(s) selected:
              </p>
              {countryFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-trust-light/50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <div>
                      <p className="text-sm font-medium text-primary">{file.name}</p>
                      <p className="text-xs text-secondary">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCountryFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global File */}
        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-2">Global Data File</h2>
          <p className="text-sm text-secondary mb-4">
            Upload the global DALY Excel file for world comparisons (optional)
          </p>

          <label className="block">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-trust-accent hover:bg-trust-light/30 transition-colors">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleGlobalFileChange}
                className="hidden"
              />
              <div className="text-4xl mb-2">🌍</div>
              <p className="text-sm text-secondary">
                Click to select file or drag and drop
              </p>
              <p className="text-xs text-secondary mt-1">
                Accepts .xlsx files
              </p>
            </div>
          </label>

          {/* File Display */}
          {globalFile && (
            <div className="mt-4">
              <p className="text-sm font-medium text-secondary mb-2">Selected file:</p>
              <div className="flex items-center justify-between p-2 bg-trust-light/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="text-sm font-medium text-primary">{globalFile.name}</p>
                    <p className="text-xs text-secondary">{formatFileSize(globalFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveGlobalFile}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-trust-light/30">
        <h2 className="text-lg font-semibold text-primary mb-3">Instructions</h2>
        <ul className="space-y-2 text-sm text-secondary">
          <li className="flex gap-2">
            <span className="text-trust-accent">1.</span>
            <span>
              Download DALY data files from the{" "}
              <a
                href="https://www.who.int/data/gho/data/themes/mortality-and-global-health-estimates/global-health-estimates-leading-causes-of-dalys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-trust-accent hover:underline"
              >
                WHO Global Health Estimates
              </a>{" "}
              page.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-trust-accent">2.</span>
            <span>
              Upload country-specific Excel files for the 14 target Asian countries.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-trust-accent">3.</span>
            <span>
              Optionally upload the global DALY file for world average comparisons.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-trust-accent">4.</span>
            <span>
              Click "Process Files" to generate the dashboard data.
            </span>
          </li>
        </ul>
      </div>

      {/* Process Button */}
      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-2 border border-trust-blue text-trust-blue rounded-md hover:bg-trust-light transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <button
          onClick={handleProcessFiles}
          disabled={processing || (countryFiles.length === 0 && !globalFile)}
          className={`px-6 py-2 rounded-md transition-colors ${
            processing || (countryFiles.length === 0 && !globalFile)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-trust-blue text-white hover:bg-trust-accent"
          }`}
        >
          {processing ? "Processing..." : "Process Files"}
        </button>
      </div>
    </div>
  );
}
