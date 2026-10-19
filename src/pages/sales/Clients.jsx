import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit } from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { CreateClientModal } from "../../features/clients/CreateClientModal";
import { EditClientModal } from "../../features/clients/EditClientModal";
import { getClients } from "../../api/clients.api";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/formatters";
import { Badge } from "../../components/ui/Badge";

export const Clients = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, setPage } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: ["clients", { page, search: debouncedSearch }],
    queryFn: () => getClients({ page, search: debouncedSearch }),
    placeholderData: (previousData) => previousData,
  });

  const columns = [
    { key: "index", label: "S.No", render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: "representativeName", label: "Representative" },
    { key: `${"companyName" || "NA"}`, label: "Company" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "gstNumber", label: "GST" },
    { key: "salesRepName", label: "Sales Rep" },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <Badge variant={row.isActive ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
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
      ),
    },
  ];

  return (
    <Layout pageTitle="Clients">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-64">
            <SearchInput placeholder="Search clients..." onChange={setSearch} />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Client
          </Button>
        </div>

        <div className="p-6">
          <Table columns={columns} data={data?.clients} isLoading={isLoading} />
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
    </Layout>
  );
};
