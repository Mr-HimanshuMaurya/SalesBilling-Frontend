import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Server,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Building2,
  Mail,
  Phone,
  HardDrive,
  Cpu,
  Database,
  Globe,
  Key,
  StickyNote,
  CalendarRange,
  Hash,
  UserCircle,
  Upload,
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
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getServers,
} from "../../api/servers.api";
import { getClients } from "../../api/clients.api";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";
import BulkUploadModal from "../../components/serveradmin/BulkUploadModal";

const AssignmentFormModal = ({ isOpen, onClose, assignment }) => {
  const queryClient = useQueryClient();
  const isEdit = !!assignment;
  const [formData, setFormData] = useState({
    client: "",
    server: "",
    serverType: "shared",
    sharedUsers: 0,
    sharedUsernames: "",
    sharedUserDetails: [],
    configuration: {
      cpu: "",
      ram: "",
      storage: "",
      bandwidth: "",
      database: "",
      phpVersion: "",
      nodeVersion: "",
      otherDetails: "",
    },
    windowsKey: "",
    windowsKeyLastDigits: "",
    validityStart: "",
    validityEnd: "",
    status: "active",
    notes: "",
  });

  const { data: clientsData } = useQuery({
    queryKey: ["clientsForAssignment"],
    queryFn: () => getClients({ limit: 1000 }),
  });

  const { data: serversData } = useQuery({
    queryKey: ["serversForAssignment"],
    queryFn: () => getServers({ limit: 1000, status: "active" }),
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        client: assignment.client?._id || "",
        server: assignment.server?._id || "",
        serverType: assignment.serverType || "shared",
        sharedUsers: assignment.sharedUsers || 0,
        sharedUsernames:
          assignment.sharedUserDetails
            ?.map((u) => u.username)
            .filter(Boolean)
            .join(", ") || "",
        sharedUserDetails: assignment.sharedUserDetails || [],
        configuration: {
          cpu: assignment.configuration?.cpu || "",
          ram: assignment.configuration?.ram || "",
          storage: assignment.configuration?.storage || "",
          bandwidth: assignment.configuration?.bandwidth || "",
          database: assignment.configuration?.database || "",
          phpVersion: assignment.configuration?.phpVersion || "",
          nodeVersion: assignment.configuration?.nodeVersion || "",
          otherDetails: assignment.configuration?.otherDetails || "",
        },
        windowsKey: assignment.windowsKey || "",
        windowsKeyLastDigits: assignment.windowsKeyLastDigits || "",
        validityStart: assignment.validityStart
          ? new Date(assignment.validityStart).toISOString().split("T")[0]
          : "",
        validityEnd: assignment.validityEnd
          ? new Date(assignment.validityEnd).toISOString().split("T")[0]
          : "",
        status: assignment.status || "active",
        notes: assignment.notes || "",
      });
    } else {
      setFormData({
        client: "",
        server: "",
        serverType: "shared",
        sharedUsers: 0,
        sharedUsernames: "",
        sharedUserDetails: [],
        configuration: {
          cpu: "",
          ram: "",
          storage: "",
          bandwidth: "",
          database: "",
          phpVersion: "",
          nodeVersion: "",
          otherDetails: "",
        },
        windowsKey: "",
        windowsKeyLastDigits: "",
        validityStart: "",
        validityEnd: "",
        status: "active",
        notes: "",
      });
    }
  }, [assignment]);

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data) => updateAssignment(assignment._id, data)
      : createAssignment,
    onSuccess: () => {
      toast.success(isEdit ? "Assignment updated!" : "Assignment created!");
      queryClient.invalidateQueries(["serverAssignments"]);
      queryClient.invalidateQueries(["expiringAssignments"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save assignment");
    },
  });

  const handleSubmit = (e) => {
    if (!formData.server) {
      toast.error("Please select a server");
      return;
    }
    if (!formData.validityStart) {
      toast.error("Please enter valid from date");
      return;
    }
    if (!formData.validityEnd) {
      toast.error("Please enter valid until date");
      return;
    }
    if (new Date(formData.validityEnd) < new Date(formData.validityStart)) {
      toast.error("Valid until must be after valid from");
      return;
    }
    const usernameArr = (formData.sharedUsernames || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const finalSharedUsers = Number(formData.sharedUsers) || usernameArr.length;
    const finalSharedUserDetails =
      usernameArr.length > 0
        ? usernameArr.map((username) => ({ username }))
        : formData.sharedUserDetails || [];
    mutation.mutate({
      ...formData,
      sharedUsers: finalSharedUsers,
      sharedUserDetails: finalSharedUserDetails,
      sharedUsernames: undefined,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("configuration.")) {
      const configKey = name.split(".")[1];
      setFormData({
        ...formData,
        configuration: { ...formData.configuration, [configKey]: value },
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
      title={isEdit ? "Edit Assignment" : "New Assign Server"}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto"
      >
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Client"
            name="client"
            options={[
              { value: "", label: "Select Client" },
              ...(clientsData?.clients?.map((c) => ({
                value: c._id,
                label: c.companyName || c.representativeName,
              })) || []),
            ]}
            value={formData.client}
            onChange={handleChange}
          />
          <Select
            label="Server"
            name="server"
            options={[
              { value: "", label: "Select Server" },
              ...(serversData?.servers?.map((s) => ({
                value: s._id,
                label: `${s.name} (${s.ipAddress})`,
              })) || []),
            ]}
            value={formData.server}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Server Type"
            name="serverType"
            options={[
              { value: "dedicated", label: "Dedicated" },
              { value: "shared", label: "Shared" },
            ]}
            value={formData.serverType}
            onChange={handleChange}
          />

          <Input
            label="No. of Users"
            name="sharedUsers"
            type="number"
            value={formData.sharedUsers}
            onChange={handleChange}
            min="0"
          />

          <div className="col-span-2">
            <Input
              label="Usernames (comma separated for multiple users)"
              name="sharedUsernames"
              type="text"
              value={formData.sharedUsernames}
              onChange={handleChange}
              placeholder="John, Tarun, Amit, Priya"
            />
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Configuration
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CPU"
              name="configuration.cpu"
              value={formData.configuration.cpu}
              onChange={handleChange}
            />
            <Input
              label="RAM"
              name="configuration.ram"
              value={formData.configuration.ram}
              onChange={handleChange}
            />
            <Input
              label="Storage"
              name="configuration.storage"
              value={formData.configuration.storage}
              onChange={handleChange}
            />
            <Input
              label="Bandwidth"
              name="configuration.bandwidth"
              value={formData.configuration.bandwidth}
              onChange={handleChange}
            />

            <Input
              label="Other Details"
              name="configuration.otherDetails"
              value={formData.configuration.otherDetails}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Windows Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Windows Key"
              name="windowsKey"
              value={formData.windowsKey}
              onChange={handleChange}
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            />
          </div>
        </div>

        <div className=" pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Validity</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              name="validityStart"
              type="date"
              value={formData.validityStart}
              onChange={handleChange}
              required
            />
            <Input
              label="Valid Until"
              name="validityEnd"
              type="date"
              value={formData.validityEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status"
            options={[
              { value: "active", label: "Active" },
              { value: "expired", label: "Expired" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ]}
            value={formData.status}
            onChange={handleChange}
          />
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
            {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
    </div>
    <div className="space-y-2 pl-1">{children}</div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, mono }) => (
  <div className="grid grid-cols-3 gap-3 items-start text-sm">
    <div className="flex items-center gap-2 text-gray-500 col-span-1">
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </div>
    <div
      className={`col-span-2 text-gray-900 ${mono ? "font-mono text-xs bg-gray-50 rounded px-2 py-1 border border-gray-200" : ""}`}
    >
      {value || <span className="text-gray-400">—</span>}
    </div>
  </div>
);

const AssignmentViewModal = ({ isOpen, onClose, assignment }) => {
  if (!assignment) return null;
  const a = assignment;
  const client = a.client || {};
  const server = a.server || {};
  const config = a.configuration || {};
  const specs = server.specs || {};
  const userList = a.sharedUserDetails?.length
    ? a.sharedUserDetails.map((u, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 mr-1 mb-1"
        >
          <UserCircle className="w-3 h-3 mr-1" />
          {u.username}
        </span>
      ))
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assignment Details"
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <Section icon={Building2} title="Client Information">
          <InfoRow
            icon={Building2}
            label="Company"
            value={client.companyName}
          />
          <InfoRow
            icon={UserCircle}
            label="Contact Person"
            value={client.representativeName}
          />
          <InfoRow icon={Mail} label="Email" value={client.email} />
          <InfoRow
            icon={Phone}
            label="Phone"
            value={
              client.phone ? (
                <span className="font-mono text-xs">{client.phone}</span>
              ) : null
            }
          />
        </Section>

        <Section icon={Server} title="Server Information">
          <InfoRow icon={Hash} label="Server Name" value={server.name} />
          <InfoRow
            icon={Globe}
            label="IP Address"
            value={
              server.ipAddress ? (
                <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  {server.ipAddress}
                </span>
              ) : null
            }
          />
          <div className="grid grid-cols-3 gap-3 items-start text-sm">
            <div className="flex items-center gap-2 text-gray-500 col-span-1">
              <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Server Type</span>
            </div>
            <div className="col-span-2">
              <Badge
                variant={a.serverType === "dedicated" ? "indigo" : "blue"}
                label={(a.serverType || "shared").toUpperCase()}
              />
            </div>
          </div>
          <InfoRow
            icon={Users}
            label="No. of Users"
            value={String(a.sharedUsers || 0)}
          />
          <div className="grid grid-cols-3 gap-3 items-start text-sm">
            <div className="flex items-center gap-2 text-gray-500 col-span-1">
              <UserCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Usernames</span>
            </div>
            <div className="col-span-2">
              {userList || (
                <span className="text-gray-400 text-sm">No username found</span>
              )}
            </div>
          </div>
        </Section>

        <Section icon={HardDrive} title="Clent's Server Configuration">
          <InfoRow icon={Cpu} label="CPU" value={config.cpu} />
          <InfoRow icon={HardDrive} label="RAM" value={config.ram} />
          <InfoRow icon={Database} label="Storage" value={config.storage} />
          <InfoRow icon={Globe} label="Bandwidth" value={config.bandwidth} />
          {/* <InfoRow icon={Database} label="Database" value={config.database} /> */}
          {/* <InfoRow icon={Hash} label="PHP Version" value={config.phpVersion} /> */}
          {/* <InfoRow
            icon={Hash}
            label="Node Version"
            value={config.nodeVersion}
          /> */}
          <InfoRow
            icon={StickyNote}
            label="Other Details"
            value={config.otherDetails}
          />
        </Section>

        <Section icon={Key} title="Windows Details">
          <InfoRow
            icon={Key}
            label="Windows Key"
            value={
              a.windowsKey ? (
                <span className="font-mono">{a.windowsKey}</span>
              ) : null
            }
          />
        </Section>

        <Section icon={CalendarRange} title="Validity & Status">
          <InfoRow
            icon={Calendar}
            label="Valid From"
            value={
              a.validityStart
                ? new Date(a.validityStart).toLocaleDateString()
                : null
            }
          />
          <InfoRow
            icon={Calendar}
            label="Valid Until"
            value={
              a.validityEnd
                ? new Date(a.validityEnd).toLocaleDateString()
                : null
            }
          />
          {a.validityEnd && new Date(a.validityEnd) < new Date() && (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div />
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                  <XCircle className="w-3.5 h-3.5" /> EXPIRED
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 items-start text-sm">
            <div className="flex items-center gap-2 text-gray-500 col-span-1">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Status</span>
            </div>
            <div className="col-span-2">
              <Badge
                variant={(a.status || "pending").toLowerCase()}
                label={(a.status || "pending").toUpperCase()}
              />
            </div>
          </div>
        </Section>

        {a.notes && (
          <Section icon={StickyNote} title="Notes">
            <div className="pl-1 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">
              {a.notes}
            </div>
          </Section>
        )}

        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const ServerAssignments = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortByIp, setSortByIp] = useState("");
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { page, setPage } = usePagination();
  const queryClient = useQueryClient();

  const ipToNumber = (ipStr) => {
    if (!ipStr) return 0;
    const parts = String(ipStr).split(".");
    if (parts.length !== 4) return 0;
    return (
      (Number(parts[0]) || 0) * 16777216 +
      (Number(parts[1]) || 0) * 65536 +
      (Number(parts[2]) || 0) * 256 +
      (Number(parts[3]) || 0)
    );
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "serverAssignments",
      {
        page,
        search: debouncedSearch,
        status,
        sortByIp,
      },
    ],
    queryFn: () =>
      getAssignments({
        page,
        limit: 10,
        search: debouncedSearch,
        status,
        sortByIp,
      }),
    placeholderData: (previousData) => previousData,
  });

  const sortedAssignments = React.useMemo(() => {
    if (!sortByIp || !data?.assignments) return data?.assignments;
    const arr = [...data.assignments];
    arr.sort((a, b) => {
      const nA = ipToNumber(a.server?.ipAddress);
      const nB = ipToNumber(b.server?.ipAddress);
      return sortByIp === "asc" ? nA - nB : nB - nA;
    });
    return arr;
  }, [data?.assignments, sortByIp]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAssignment(id),
    onSuccess: () => {
      toast.success("Assignment deleted!");
      queryClient.invalidateQueries(["serverAssignments"]);
      setIsDeleteConfirmOpen(false);
      setDeletingAssignment(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete assignment",
      );
    },
  });

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      expired: "red",
      pending: "yellow",
      suspended: "orange",
    };
    return colors[status] || "gray";
  };

  const columns = [
    { key: "index", label: "#", render: (_, i) => (page - 1) * 10 + i + 1 },
    {
      key: "client",
      label: "Client",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.client?.companyName || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            {row.client?.representativeName}
          </p>
        </div>
      ),
    },
    {
      key: "server",
      label: "Server",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.server?.name}</p>
          <p className="text-sm text-gray-500">{row.server?.ipAddress}</p>
        </div>
      ),
    },
    {
      key: "serverType",
      label: "Type",
      render: (row) => (
        <Badge
          variant={row?.serverType === "dedicated" ? "indigo" : "blue"}
          label={row?.serverType.toUpperCase()}
        />
      ),
    },

    // {
    //   key: "validityEnd",
    //   label: "Valid Until",
    //   render: (row) => (
    //     <div className="text-sm">
    //       <p>{new Date(row?.validityEnd).toLocaleDateString()}</p>
    //       {new Date(row?.validityEnd) < new Date() && (
    //         <span className="text-xs text-red-600">Expired</span>
    //       )}
    //     </div>
    //   ),
    // },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge
          variant={row?.status.toLowerCase()}
          label={row?.status.toUpperCase()}
        />
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
              setViewingAssignment(row);
              setIsViewModalOpen(true);
            }}
            title="View Details"
          >
            <Eye className="w-4 h-4 cursor-pointer text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingAssignment(row);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4 cursor-pointer text-indigo-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingAssignment(row);
              setIsDeleteConfirmOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 cursor-pointer text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout pageTitle="Client Servers ">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-64">
              <SearchInput
                placeholder="Search assignments..."
                onChange={setSearch}
              />
            </div>
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "expired", label: "Expired" },
                { value: "pending", label: "Pending" },
                { value: "suspended", label: "Suspended" },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full md:w-48"
            />
            <Select
              options={[
                { value: "", label: "Sort by IP" },
                { value: "asc", label: "IP: Low to High ↑" },
                { value: "desc", label: "IP: High to Low ↓" },
              ]}
              value={sortByIp}
              onChange={(e) => setSortByIp(e.target.value)}
              className="w-full md:w-52"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsBulkUploadModalOpen(true)}
              className="border border-indigo-200 hover:border-indigo-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Server
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={data?.assignments || []}
            isLoading={isLoading}
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

      <AssignmentFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <AssignmentFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAssignment(null);
        }}
        assignment={editingAssignment}
      />
      <AssignmentViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingAssignment(null);
        }}
        assignment={viewingAssignment}
      />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingAssignment(null);
        }}
        onConfirm={() => deleteMutation.mutate(deletingAssignment._id)}
        title="Delete Assignment"
        message={`Are you sure you want to delete this assignment?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
      />
    </Layout>
  );
};
