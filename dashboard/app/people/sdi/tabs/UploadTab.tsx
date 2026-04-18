"use client";

import { useState, useCallback } from "react";

export function UploadTab() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setMessage(null);
    }
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setMessage(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleProcessFile = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file to upload" });
      return;
    }

    setProcessing(true);
    setMessage({ type: "info", text: "Processing file..." });

    // Simulate processing delay - backend integration placeholder
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setProcessing(false);
    setMessage({
      type: "info",
      text: "Backend processing for SDI data is not yet implemented. The file was received but not processed.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">Upload SDI Data</h2>
        <p className="text-sm text-secondary mt-1">
          Upload CSV or Excel files containing SDI data to update the dashboard visualizations.
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
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          SDI Data File
        </h3>
        <p className="text-sm text-secondary mb-4">
          Upload an SDI data file in CSV or Excel format (.csv, .xlsx)
        </p>

        <label className="block">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm text-secondary">
              Click to select a file or drag and drop
            </p>
            <p className="text-xs text-secondary mt-1">
              Accepts .csv and .xlsx files
            </p>
          </div>
        </label>

        {/* File Display */}
        {file && (
          <div className="mt-4">
            <p className="text-sm font-medium text-secondary mb-2">Selected file:</p>
            <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-primary">{file.name}</p>
                  <p className="text-xs text-secondary">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Process Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleProcessFile}
            disabled={processing || !file}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              processing || !file
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
            {processing ? "Processing..." : "Upload & Process"}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Instructions
        </h3>
        <ul className="space-y-3 text-sm text-secondary">
          <li className="flex gap-3">
            <span className="text-teal-500 font-semibold">1.</span>
            <span>
              Obtain SDI data from the{" "}
              <a
                href="https://ghdx.healthdata.org/record/ihme-data/gbd-2021-socio-demographic-index-sdi-1990-2021"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-500 hover:underline"
              >
                IHME Global Health Data Exchange
              </a>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-teal-500 font-semibold">2.</span>
            <span>
              Ensure the file contains columns for country, year, and SDI value.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-teal-500 font-semibold">3.</span>
            <span>
              Upload the file using the form above.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-teal-500 font-semibold">4.</span>
            <span>
              Click &quot;Upload &amp; Process&quot; to update the dashboard data.
            </span>
          </li>
        </ul>
      </div>

      {/* Data Format Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          Expected Data Format
        </h3>
        <p className="text-sm text-secondary mb-3">
          The uploaded file should contain SDI data with the following structure:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-secondary">Column</th>
                <th className="text-left py-2 px-3 font-semibold text-secondary">Description</th>
                <th className="text-left py-2 px-3 font-semibold text-secondary">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">location_name</td>
                <td className="py-2 px-3">Country or region name</td>
                <td className="py-2 px-3 text-secondary">Thailand</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">year</td>
                <td className="py-2 px-3">Year of the data point</td>
                <td className="py-2 px-3 text-secondary">2023</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-xs">val</td>
                <td className="py-2 px-3">SDI value (0 to 1)</td>
                <td className="py-2 px-3 text-secondary">0.742</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
