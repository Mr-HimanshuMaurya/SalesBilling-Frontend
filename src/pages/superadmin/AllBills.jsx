import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Edit,
  Download,
  Trash2,
  Calendar,
  X,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  User,
  FileText,
  Plus,
  Send,
  Mail,
  Loader2,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewBillModal } from "../../features/bills/ViewBillModal";
import { EditBillModal } from "../../features/bills/EditBillModal";
import { CreateBillModal } from "../../features/bills/CreateBillModal";
import {
  getBills,
  deleteBill,
  exportBillsExcel,
  submitBill,
  sendBillEmail,
} from "../../api/bills.api";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { SERVICES } from "../../utils/constants";
import toast from "react-hot-toast";

const BILLING_DATE_OPTIONS = [
  { value: "", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

export const AllBills = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCorrectionInfoOpen, setIsCorrectionInfoOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [deletingBill, setDeletingBill] = useState(null);
  const [correctionBill, setCorrectionBill] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [salesPerson, setSalesPerson] = useState("");
  const [salesPersons, setSalesPersons] = useState([]);
  const [clientsWithMultipleBills, setClientsWithMultipleBills] = useState([]);
  const [billingDateFilter, setBillingDateFilter] = useState("");
  const [billingStartDate, setBillingStartDate] = useState("");
  const [billingEndDate, setBillingEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingBillId, setDownloadingBillId] = useState(null);
  const debouncedSearch = useDebounce(search);
  const { page, setPage } = usePagination();
  const queryClient = useQueryClient();
  const exportTimeoutRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [
    salesPerson,
    status,
    service,
    billingDateFilter,
    billingStartDate,
    billingEndDate,
    setPage,
  ]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "bills",
      {
        page,
        search: debouncedSearch,
        status,
        service,
        salesPerson,
        billingDateFilter:
          billingDateFilter === "custom" ? "" : billingDateFilter,
        billingStartDate,
        billingEndDate,
      },
    ],
    queryFn: () =>
      getBills({
        page,
        search: debouncedSearch,
        status,
        service,
        salesPerson,
        billingDateFilter:
          billingDateFilter === "custom" ? "" : billingDateFilter,
        billingStartDate,
        billingEndDate,
      }),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (data?.salesPersons) {
      setSalesPersons(data.salesPersons);
    }
  }, [data?.salesPersons]);

  useEffect(() => {
    if (data?.clientsWithMultipleBills) {
      setClientsWithMultipleBills(data.clientsWithMultipleBills);
    }
  }, [data?.clientsWithMultipleBills]);

  const handleBillingDateFilterChange = (value) => {
    setBillingDateFilter(value);
    if (value !== "custom") {
      setBillingStartDate("");
      setBillingEndDate("");
    }
  };

  const clearBillingDateFilters = () => {
    setBillingDateFilter("");
    setBillingStartDate("");
    setBillingEndDate("");
  };

  const hasBillingDateFilter =
    billingDateFilter || billingStartDate || billingEndDate;

  // ✅ Download Excel function
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      toast.loading("Preparing export...", { id: "exportToast" });

      const params = {
        search: debouncedSearch || undefined,
        status: status || undefined,
        service: service || undefined,
        salesPerson: salesPerson || undefined,
        billingDateFilter:
          billingDateFilter === "custom"
            ? undefined
            : billingDateFilter || undefined,
        billingStartDate:
          billingDateFilter === "custom" ? billingStartDate : undefined,
        billingEndDate:
          billingDateFilter === "custom" ? billingEndDate : undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      const response = await exportBillsExcel(params);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with filters
      let filename = "Bills_Export";
      const dateStr = new Date().toISOString().split("T")[0];
      filename += `_${dateStr}`;

      if (status) filename += `_${status}`;
      if (service) filename += `_${service}`;
      if (billingDateFilter && billingDateFilter !== "custom")
        filename += `_${billingDateFilter}`;

      link.setAttribute("download", `${filename}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully!", { id: "exportToast" });
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || "Failed to export bills", {
        id: "exportToast",
      });
    } finally {
      setIsExporting(false);
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBill(id),
    onSuccess: () => {
      toast.success("Bill deleted successfully!");
      queryClient.invalidateQueries(["bills"]);
      setIsDeleteConfirmOpen(false);
      setDeletingBill(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete bill");
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id) => submitBill(id),
    onSuccess: () => {
      toast.success("Bill submitted for approval");
      queryClient.invalidateQueries(["bills"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit bill");
    },
  });

  const sendInvoiceEmailMutation = useMutation({
    mutationFn: ({ id, invoiceType }) => sendBillEmail(id, { invoiceType }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.invoiceType === "proforma"
          ? "Proforma Invoice sent successfully"
          : "Tax Invoice sent successfully",
      );
      queryClient.invalidateQueries(["bills"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send invoice");
    },
  });

  const handleDownloadPdf = async (
    billId,
    type = "tax",
    adminDirectBill = false,
  ) => {
    if (downloadingBillId) return;

    setDownloadingBillId(billId);
    const toastId = toast.loading("Generating PDF, please wait...");

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://billing.saviengineering.com";
      const suffix = adminDirectBill ? `?type=${type}` : "";
      const url = `${baseUrl}/api/pdf/${billId}${suffix}`;

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Invoice-${billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("PDF download failed. Please try again.", { id: toastId });
    } finally {
      setDownloadingBillId(null);
    }
  };

  const serviceNames = {
    Printer: "Printer",
  };

  const getRowClassName = (row) => {
    const clientId = row?.client?._id?.toString();
    if (clientId && clientsWithMultipleBills.includes(clientId)) {
      return "bg-indigo-50/60 border-l-4 border-l-indigo-500";
    }
    return "";
  };

  const columns = [
    { key: "index", label: "#", render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: "billNumber", label: "Bill No" },
    {
      key: "client",
      label: "Client",
      render: (row) =>
        row?.client?.companyName || row?.client?.representativeName,
    },
    {
      key: "service",
      label: "Service",
      render: (row) => serviceNames[row?.service],
    },
    {
      key: "amount",
      label: "Amount ",
      render: (row) => {
        const amount = Number(row.amount || 0);
        const amountWithGST = Math.round(amount * 1.18);
        return formatCurrency(amountWithGST);
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.status} />
          {row.adminDirectBill && (
            <span className="text-[10px] font-medium text-indigo-600">
              PI + Tax Invoice
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdBy",
      label: "Created By",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.createdBy?.name || "-"}</span>
          <span className="text-xs text-gray-500">
            {new Date(row.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}{" "}
          </span>
        </div>
      ),
    },
    {
      key: "billingDate",
      label: "Billing Date",
      render: (row) => formatDate(row.billingDate),
    },
    {
      key: "renewalDate",
      label: "Renewal Date",
      render: (row) => (
        <span className="text-red-600 whitespace-nowrap">
          {formatDate(row.renewalDate)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setViewingBill(row);
              setIsViewModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingBill(row);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {["draft", "correction"].includes(row.status) &&
            !row.adminDirectBill && (
              <Button
                variant="ghost"
                size="sm"
                title="Submit for approval"
                disabled={submitMutation.isPending}
                onClick={() => submitMutation.mutate(row._id)}
              >
                <Send className="w-4 h-4 text-indigo-500" />
              </Button>
            )}
          {row.adminDirectBill ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                title="Download Proforma PDF"
                disabled={downloadingBillId === row._id}
                onClick={() => handleDownloadPdf(row._id, "proforma", true)}
              >
                {downloadingBillId === row._id ? (
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-gray-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Download Tax Invoice PDF"
                disabled={downloadingBillId === row._id}
                onClick={() => handleDownloadPdf(row._id, "tax", true)}
              >
                {downloadingBillId === row._id ? (
                  <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-green-500" />
                )}
              </Button>
              {!row.proformaSentAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Send Proforma to client"
                  disabled={sendInvoiceEmailMutation.isPending}
                  onClick={() =>
                    sendInvoiceEmailMutation.mutate({
                      id: row._id,
                      invoiceType: "proforma",
                    })
                  }
                >
                  <Mail className="w-4 h-4 text-gray-600" />
                </Button>
              )}
              {!row.emailSentAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Send Tax Invoice to client"
                  disabled={sendInvoiceEmailMutation.isPending}
                  onClick={() =>
                    sendInvoiceEmailMutation.mutate({
                      id: row._id,
                      invoiceType: "tax",
                    })
                  }
                >
                  <Mail className="w-4 h-4 text-amber-500" />
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={downloadingBillId === row._id}
              onClick={() => handleDownloadPdf(row._id, "tax", false)}
            >
              {downloadingBillId === row._id ? (
                <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-green-500" />
              )}
            </Button>
          )}
          {row.status === "correction" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCorrectionBill(row);
                setIsCorrectionInfoOpen(true);
              }}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <AlertCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingBill(row);
              setIsDeleteConfirmOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout pageTitle="All Bills">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search + Status + Service + Sales Person */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="w-full sm:w-64">
                <SearchInput
                  placeholder="Search bills..."
                  onChange={setSearch}
                />
              </div>

              <Select
                options={[
                  { value: "", label: "All Statuses" },
                  // { value: "draft", label: "Draft" },
                  { value: "pending_approval", label: "Pending Approval" },
                  { value: "approved", label: "Approved" },
                  { value: "correction", label: "Correction" },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full sm:w-48"
              />

              <Select
                options={[{ value: "", label: "All Services" }, ...SERVICES]}
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full sm:w-48"
              />

              <Select
                options={[
                  { value: "", label: "All Sales Persons" },
                  ...salesPersons.map((p) => ({
                    value: p._id,
                    label: p.name,
                  })),
                ]}
                value={salesPerson}
                onChange={(e) => setSalesPerson(e.target.value)}
                className="w-full sm:w-56"
              />
            </div>

            {/* Row 2: Billing Date Filter + Export Excel */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
              {/* Billing Date Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <Calendar className="w-4 h-4 text-gray-500" />

                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Billing Date Filter:
                  </span>
                </div>

                <Select
                  options={BILLING_DATE_OPTIONS}
                  value={billingDateFilter}
                  onChange={(e) =>
                    handleBillingDateFilterChange(e.target.value)
                  }
                  className="w-full sm:w-48"
                />

                {hasBillingDateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearBillingDateFilters}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Export Excel + Create Bill */}
              <div className="flex flex-wrap gap-3 shrink-0 ml-auto">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Create Bill
                </Button>
                <Button
                  onClick={handleExportExcel}
                  disabled={isExporting || isLoading}
                  variant="secondary"
                  className="border border-green-300 hover:bg-green-50 text-green-700"
                >
                  <FileSpreadsheet
                    className={`w-4 h-4 mr-2 ${
                      isExporting ? "animate-pulse" : ""
                    }`}
                  />
                  {isExporting ? "Exporting..." : "Export Excel"}
                </Button>
              </div>
            </div>

            {/* Custom Billing Dates */}
            {billingDateFilter === "custom" && (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center pl-0 sm:pl-6">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-xs font-medium text-gray-500">
                    From Date
                  </label>

                  <Input
                    type="date"
                    value={billingStartDate}
                    onChange={(e) => setBillingStartDate(e.target.value)}
                    className="w-full sm:w-40"
                  />
                </div>

                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-xs font-medium text-gray-500">
                    To Date
                  </label>

                  <Input
                    type="date"
                    value={billingEndDate}
                    onChange={(e) => setBillingEndDate(e.target.value)}
                    className="w-full sm:w-40"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="min-w-[900px] sm:min-w-0">
              <Table
                columns={columns}
                data={data?.bills}
                isLoading={isLoading}
                getRowClassName={getRowClassName}
              />
            </div>
          </div>
          {data?.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <CreateBillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ViewBillModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingBill(null);
        }}
        bill={viewingBill}
        userRole="superadmin"
      />

      <EditBillModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBill(null);
        }}
        bill={editingBill}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingBill(null);
        }}
        onConfirm={() => deleteMutation.mutate(deletingBill._id)}
        title="Delete Bill"
        message={`Are you sure you want to delete bill "${deletingBill?.billNumber}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />

      <Modal
        isOpen={isCorrectionInfoOpen}
        onClose={() => {
          setIsCorrectionInfoOpen(false);
          setCorrectionBill(null);
        }}
        title="Correction Details"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-orange-800 mb-1">
                  Correction Reason
                </h4>
                <p className="text-sm text-orange-700">
                  {correctionBill?.correctionReason || "No reason provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium">Corrected By</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {correctionBill?.correctionBy?.name || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {correctionBill?.correctionBy?.email || ""}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Corrected At</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {correctionBill?.correctionAt
                  ? new Date(correctionBill.correctionAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {correctionBill?.correctionAt
                  ? new Date(correctionBill.correctionAt).toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )
                  : ""}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-medium">Bill Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Bill Number:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {correctionBill?.billNumber}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium text-gray-900">
                  ₹{correctionBill?.amount}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Client:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {correctionBill?.client?.companyName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Service:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {serviceNames[correctionBill?.service] ||
                    correctionBill?.service ||
                    "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCorrectionInfoOpen(false);
                setCorrectionBill(null);
              }}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingBill(correctionBill);
                setIsCorrectionInfoOpen(false);
                setCorrectionBill(null);
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Bill
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
