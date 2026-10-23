import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { CreateClientModal } from "../../features/clients/CreateClientModal";
import { EditClientModal } from "../../features/clients/EditClientModal";
import { ClientInvoicesModal } from "../../features/clients/ClientInvoicesModal";
import { getClients, deleteClient } from "../../api/clients.api";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

export const AllClients = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [invoicesClient, setInvoicesClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [search, setSearch] = useState("");
  const [salesPerson, setSalesPerson] = useState("");
  const [salesPersons, setSalesPersons] = useState([]);
  const debouncedSearch = useDebounce(search);
  const { page, setPage } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, [salesPerson, setPage]);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", { page, search: debouncedSearch, salesPerson }],
    queryFn: () => getClients({ page, search: debouncedSearch, salesPerson }),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (data?.salesPersons) {
      setSalesPersons(data.salesPersons);
    }
  }, [data?.salesPersons]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteClient(id),
    onSuccess: () => {
      toast.success("Client deleted successfully!");
      queryClient.invalidateQueries(["clients"]);
      setIsDeleteConfirmOpen(false);
      setDeletingClient(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete client");
    },
  });

  const columns = [
    { key: "index", label: "#", render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: "companyName", label: "Company Name" },
    { key: "representativeName", label: "Representative" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gstNumber", label: "GST Number" },
    {
      key: "billCount",
      label: "No. of Invoices",
      render: (row) => {
        const count = row.billCount ?? 0;
        const isMultiple = count >= 2;
        return (
          <button
            type="button"
            onClick={() => {
              setInvoicesClient(row);
              setIsInvoicesModalOpen(true);
            }}
            title="View invoices"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors hover:ring-2 hover:ring-indigo-300 ${
              isMultiple
                ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FileText className="w-3 h-3" />
            {count}
          </button>
        );
      },
    },
    { key: "salesRepName", label: "Sales Rep" },
    {
      key: "createdAt",
      label: "Created At",
      render: (row) => formatDate(row.createdAt),
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
              setEditingClient(row);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingClient(row);
              setIsDeleteConfirmOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const getRowClassName = (row) => {
    const count = row.billCount ?? 0;
    if (count >= 2) {
      return "bg-indigo-50/60 border-l-4 border-l-indigo-500";
    }
    return "";
  };

  return (
    <Layout pageTitle="All Clients">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="w-full sm:w-64">
              <SearchInput
                placeholder="Search clients..."
                onChange={setSearch}
              />
            </div>
            <Select
              // label="Sales Person"
              options={[
                { value: "", label: "All Sales Persons" },
                ...salesPersons.map((p) => ({ value: p._id, label: p.name })),
              ]}
              value={salesPerson}
              onChange={(e) => setSalesPerson(e.target.value)}
              className="w-full sm:w-56"
            />
          </div>
          {/* <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Client
          </Button> */}
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={data?.clients}
            isLoading={isLoading}
            getRowClassName={getRowClassName}
          />
          {data?.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
      />

      <ClientInvoicesModal
        isOpen={isInvoicesModalOpen}
        onClose={() => {
          setIsInvoicesModalOpen(false);
          setInvoicesClient(null);
        }}
        client={invoicesClient}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingClient(null);
        }}
        onConfirm={() => deleteMutation.mutate(deletingClient._id)}
        title="Delete Client"
        message={`Are you sure you want to delete client "${deletingClient?.companyName || deletingClient?.representativeName}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
};
