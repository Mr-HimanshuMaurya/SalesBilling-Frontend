import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Server,
  Search,
  MoreVertical,
  Power,
  PowerOff,
  Activity,
  Eye,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import {
  getServers,
  createServer,
  updateServer,
  deleteServer,
  toggleServerStatus,
} from "../../api/servers.api";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

const ServerFormModal = ({ isOpen, onClose, server }) => {
  const queryClient = useQueryClient();
  const isEdit = !!server;
  const [formData, setFormData] = useState({
    name: "",
    ipAddress: "",
    port: 22,
    osType: "linux",
    osVersion: "",
    specs: {
      cpu: "",
      ram: "",
      storage: "",
      bandwidth: "",
    },
    location: "",
    provider: "cloudedata",
    status: "active",
    isDedicated: false,
    notes: "",
  });

  React.useEffect(() => {
    if (server) {
      setFormData({
        name: server.name || "",
        ipAddress: server.ipAddress || "",
        port: server.port || 22,
        osType: server.osType || "linux",
        osVersion: server.osVersion || "",
        specs: {
          cpu: server.specs?.cpu || "",
          ram: server.specs?.ram || "",
          storage: server.specs?.storage || "",
          bandwidth: server.specs?.bandwidth || "",
        },
        location: server.location || "",
        provider: server.provider || "cloudedata",
        status: server.status || "active",
        isDedicated: server.isDedicated || false,
        notes: server.notes || "",
      });
    } else {
      setFormData({
        name: "",
        ipAddress: "",
        port: 22,
        osType: "linux",
        osVersion: "",
        specs: {
          cpu: "",
          ram: "",
          storage: "",
          bandwidth: "",
        },
        location: "",
        provider: "cloudedata",
        status: "active",
        isDedicated: false,
        notes: "",
      });
    }
  }, [server]);

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data) => updateServer(server._id, data)
      : createServer,
    onSuccess: () => {
      toast.success(isEdit ? "Server updated!" : "Server created!");
      queryClient.invalidateQueries(["servers"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save server");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Please enter server name");
      return;
    }
    if (!formData.ipAddress?.trim()) {
      toast.error("Please enter IP address");
      return;
    }
    if (!formData.specs?.cpu?.trim()) {
      toast.error("Please enter CPU details");
      return;
    }
    if (!formData.specs?.ram?.trim()) {
      toast.error("Please enter RAM details");
      return;
    }
    if (!formData.specs?.storage?.trim()) {
      toast.error("Please enter storage details");
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("specs.")) {
      const specKey = name.split(".")[1];
      setFormData({
        ...formData,
        specs: { ...formData.specs, [specKey]: value },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Server" : "Add Server"}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Server Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="IP Address"
            name="ipAddress"
            value={formData.ipAddress}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Port"
            name="port"
            type="number"
            value={formData.port}
            onChange={handleChange}
          />
          <Select
            label="OS Type"
            name="osType"
            options={[
              { value: "linux", label: "Linux" },
              { value: "windows", label: "Windows" },
              // { value: "ubuntu", label: "Ubuntu" },
              // { value: "centos", label: "CentOS" },
              // { value: "other", label: "Other" },
            ]}
            value={formData.osType}
            onChange={handleChange}
          />
        </div>

        {/* <Input
          label="OS Version"
          name="osVersion"
          value={formData.osVersion}
          onChange={handleChange}
        /> */}

        <div className="border-t border-gray-300 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Specifications
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CPU"
              name="specs.cpu"
              value={formData.specs.cpu}
              onChange={handleChange}
              placeholder="e.g., 4 vCPU"
            />
            <Input
              label="RAM"
              name="specs.ram"
              value={formData.specs.ram}
              onChange={handleChange}
              placeholder="e.g., 8 GB"
            />
            <Input
              label="Storage"
              name="specs.storage"
              value={formData.specs.storage}
              onChange={handleChange}
              placeholder="e.g., 100 GB SSD"
            />
            <Input
              label="Bandwidth"
              name="specs.bandwidth"
              value={formData.specs.bandwidth}
              onChange={handleChange}
              placeholder="e.g., 1 TB"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Mumbai, India"
          />
          <Select
            label="Provider"
            name="provider"
            options={[
              { value: "cloudedata", label: "Cloudedata" },
              { value: "other", label: "Other" },
            ]}
            value={formData.provider}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status"
            options={[
              { value: "active", label: "Active" },
              { value: "maintenance", label: "Maintenance" },
              { value: "inactive", label: "Inactive" },
              { value: "pending", label: "Pending" },
            ]}
            value={formData.status}
            onChange={handleChange}
          />
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDedicated"
                checked={formData.isDedicated}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Dedicated Server</span>
            </label>
          </div>
        </div>

        <Input
          label="Notes"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4 ">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Saving..."
              : isEdit
                ? "Update Server"
                : "Create Server"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const Servers = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [deletingServer, setDeletingServer] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingServer, setViewingServer] = useState(null);
  const debouncedSearch = useDebounce(search);
  const { page, setPage } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["servers", { page, search: debouncedSearch, status }],
    queryFn: () =>
      getServers({ page, search: debouncedSearch, status, limit: 10 }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteServer(id),
    onSuccess: () => {
      toast.success("Server deleted!");
      queryClient.invalidateQueries(["servers"]);
      setIsDeleteConfirmOpen(false);
      setDeletingServer(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete server");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => toggleServerStatus(id),
    onSuccess: () => {
      toast.success("Server status updated!");
      queryClient.invalidateQueries(["servers"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      maintenance: "yellow",
      inactive: "red",
      pending: "orange",
    };

    return colors[(status || "").toLowerCase()] || "gray";
  };

  const columns = [
    { key: "index", label: "#", render: (_, i) => (page - 1) * 10 + i + 1 },
    {
      key: "name",
      label: "Server",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-sm text-gray-500">{row.ipAddress}</p>
        </div>
      ),
    },
    {
      key: "osType",
      label: "OS",
      render: (row) => (
        <span className="text-sm text-gray-700 capitalize">{row.osType}</span>
      ),
    },
    // {
    //   key: "specs",
    //   label: "Specs",
    //   render: (row) => (
    //     <div className="text-sm text-gray-600">
    //       <p>{row.specs?.cpu}</p>
    //       <p>
    //         {row.specs?.ram} / {row.specs?.storage}
    //       </p>
    //     </div>
    //   ),
    // },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge
          variant={(row.status || "pending").toLowerCase()}
          label={(row.status || "Pending").toUpperCase()}
        />
      ),
    },
    // {
    //   key: "totalClients",
    //   label: "Clients",
    //   render: (row) => (
    //     <span className="text-sm text-gray-700">{row.totalClients || 0}</span>
    //   ),
    // },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setViewingServer(row);
              setIsViewModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingServer(row);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4 text-indigo-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleStatusMutation.mutate(row._id)}
          >
            <Power className="w-4 h-4 text-orange-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingServer(row);
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
    <Layout pageTitle="Server Management">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-64">
              <SearchInput
                placeholder="Search servers..."
                onChange={setSearch}
              />
            </div>
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "maintenance", label: "Maintenance" },
                { value: "inactive", label: "Inactive" },
                { value: "pending", label: "Pending" },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Server
          </Button>
        </div>

        <div className="p-6">
          <Table columns={columns} data={data?.servers} isLoading={isLoading} />
          {data?.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <ServerFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <ServerFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingServer(null);
        }}
        server={editingServer}
      />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingServer(null);
        }}
        onConfirm={() => deleteMutation.mutate(deletingServer._id)}
        title="Delete Server"
        message={`Are you sure you want to delete server "${deletingServer?.name}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingServer(null);
        }}
        title="Server Details"
        size="lg"
      >
        {viewingServer && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-600">Server Name</p>
              <p>{viewingServer.name}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">IP Address</p>
              <p>{viewingServer.ipAddress}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">Port</p>
              <p>{viewingServer.port}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">OS</p>
              <p className="capitalize">{viewingServer.osType}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">Provider</p>
              <p>{viewingServer.provider}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">Location</p>
              <p>{viewingServer.location || "-"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">Status</p>
              <Badge
                variant={(viewingServer.status || "pending").toLowerCase()}
                label={(viewingServer.status || "Pending").toUpperCase()}
              />
            </div>

            <div>
              <p className="font-semibold text-gray-600">Dedicated</p>
              <p>{viewingServer.isDedicated ? "Yes" : "No"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">CPU</p>
              <p>{viewingServer.specs?.cpu}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">RAM</p>
              <p>{viewingServer.specs?.ram}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">Storage</p>
              <p>{viewingServer.specs?.storage}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">Bandwidth</p>
              <p>{viewingServer.specs?.bandwidth}</p>
            </div>

            <div className="col-span-2">
              <p className="font-semibold text-gray-600">Notes</p>
              <p>{viewingServer.notes || "-"}</p>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
