import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileUp,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";
import toast from "react-hot-toast";
import api from "../../api/axios";

const BulkUploadModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post(
        "/server-assignments/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.data);
      toast.success(data.message || "Bulk upload completed!");
      queryClient.invalidateQueries(["serverAssignments"]);
      queryClient.invalidateQueries(["expiringAssignments"]);

      // Auto close after 3 seconds if all successful
      if (data.data.summary.failed === 0 && data.data.summary.skipped === 0) {
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload file");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload an Excel file (.xlsx, .xls, .csv)");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    await uploadMutation.mutateAsync(formData);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/server-assignments/template/download", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Server_Assignment_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download template");
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setResult(null);
    setShowDetails(false);
    onClose();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Upload Server Assignments"
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Upload Instructions
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                <li>Download the template file below</li>
                <li>Fill in your data in the template format</li>
                <li>Upload the filled Excel file (.xlsx, .xls, .csv)</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>
        </div> */}

        {/* Template Download */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Download Template
              </p>
              <p className="text-xs text-gray-500">
                Get the sample template with correct format
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={isUploading}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>

        {/* File Upload */}
        <div>
          <div className="flex items-center justify-center w-full">
            <label
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                file
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <FileUp className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Excel files only (.xlsx, .xls, .csv)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          {file && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                File ready for upload
              </span>
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                className="text-xs text-red-600 hover:text-red-800"
                disabled={isUploading}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uploading...</span>
              <span className="text-gray-900 font-medium">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {result.summary.total}
                </p>
                <p className="text-xs text-gray-500">Total Records</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {result.summary.successful}
                </p>
                <p className="text-xs text-green-600">Successful</p>
              </div>
              <div
                className={`rounded-lg p-3 text-center ${
                  result.summary.failed > 0 || result.summary.skipped > 0
                    ? "bg-red-50"
                    : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-2xl font-bold ${
                    result.summary.failed > 0 || result.summary.skipped > 0
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {result.summary.failed + result.summary.skipped}
                </p>
                <p
                  className={`text-xs ${
                    result.summary.failed > 0 || result.summary.skipped > 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  Failed / Skipped
                </p>
              </div>
            </div>

            {/* Error Details Toggle */}
            {(result.details.errors.length > 0 ||
              result.details.skipped.length > 0) && (
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  View Details (
                  {result.details.errors.length + result.details.skipped.length}{" "}
                  issues)
                </button>

                {showDetails && (
                  <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                    {result.details.errors.map((error, index) => (
                      <div
                        key={`error-${index}`}
                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              Row {error.row}: {error.error}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Data: {JSON.stringify(error.data)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {result.details.skipped.map((skip, index) => (
                      <div
                        key={`skip-${index}`}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Row {skip.row}: {skip.reason}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                              Client: {skip.client} | Server: {skip.server}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Success Summary */}
            {result.details.created.length > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {result.details.created.length} records created
                      successfully
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {result.details.created.slice(0, 5).map((item, index) => (
                        <span
                          key={index}
                          className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                        >
                          {item.client} → {item.server}
                        </span>
                      ))}
                      {result.details.created.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{result.details.created.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
