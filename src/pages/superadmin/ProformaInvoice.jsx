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
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewBillModal } from "../../features/bills/ViewBillModal";
import { EditBillModal } from "../../features/bills/EditBillModal";
import { getBills, deleteBill, exportBillsExcel } from "../../api/bills.api";
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

export const ProformaInvoice = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [deletingBill, setDeletingBill] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("draft");
  const [service, setService] = useState("");
  const [salesPerson, setSalesPerson] = useState("");
  const [salesPersons, setSalesPersons] = useState([]);
  const [clientsWithMultipleBills, setClientsWithMultipleBills] = useState([]);
  const [billingDateFilter, setBillingDateFilter] = useState("");
  const [billingStartDate, setBillingStartDate] = useState("");
  const [billingEndDate, setBillingEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
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

  const handleDownloadPdf = (billId) => {
    const baseUrl =
      import.meta.env.VITE_API_URL || "https://billing.saviengineering.com";
    window.open(`${baseUrl}/api/pdf/${billId}`, "_blank");
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
    // {
    //   key: "service",
    //   label: "Service",
    //   render: (row) => serviceNames[row?.service],
    // },
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
      render: (row) => <Badge variant={row.status} />,
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadPdf(row._id)}
          >
            <Download className="w-4 h-4 text-green-500" />
          </Button>
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
    <Layout pageTitle="Proforma Invoice">
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

              {/* <Select
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "draft", label: "Draft" },
                  { value: "pending_approval", label: "Pending Approval" },
                  { value: "approved", label: "Approved" },
                  { value: "correction", label: "Correction" },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full sm:w-48"
              /> */}

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

      <ViewBillModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingBill(null);
        }}
        bill={viewingBill}
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
    </Layout>
  );
};
