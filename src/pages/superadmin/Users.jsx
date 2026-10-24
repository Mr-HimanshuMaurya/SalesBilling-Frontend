import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  ToggleLeft,
  Trash2,
  Calendar, // ✅ Add this
  Clock, // ✅ Add this
  ArrowRightLeft,
  KeyRound,
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
import { ScheduleModal } from "../../components/schedule/ScheduleModal"; // ✅ Add this
import { TransferDataModal } from "../../features/users/TransferDataModal.jsx";
import {
  getUsers,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  toggleUserStatus,
} from "../../api/users.api";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/formatters";
import { ROLE_LABELS } from "../../utils/constants";
import toast from "react-hot-toast";

const CreateEditUserModal = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
  });

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "sales",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data) =>
          updateUser(user._id, {
            ...data,
            password: data.password || undefined,
          })
      : createUser,
    onSuccess: () => {
      toast.success(
        isEdit ? "User updated successfully!" : "User created successfully!",
      );
      queryClient.invalidateQueries(["users"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save user");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Team Members" : "Create Team Members"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {!isEdit && (
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        )}
        <Select
          label="Role"
          name="role"
          options={[
            { value: "sales", label: "Sales" },
            { value: "accountant", label: "Accountant" },
          ]}
          value={formData.role}
          onChange={handleChange}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Team Members"
                : "Create Team Members"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ChangePasswordModal = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  const isTooShort = newPassword.length > 0 && newPassword.length < 6;
  const isMismatch = confirmPassword !== "" && newPassword !== confirmPassword;
  const isValid = newPassword.length >= 6 && newPassword === confirmPassword;

  const mutation = useMutation({
    mutationFn: () => changeUserPassword(user._id, newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      queryClient.invalidateQueries(["users"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    mutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-500">Team Member</p>
          <p className="text-sm font-semibold text-gray-900 break-words">
            {user?.name}{" "}
            <span className="font-normal text-gray-500">({user?.email})</span>
          </p>
        </div>

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {isTooShort && (
          <p className="text-xs text-red-500">
            Password must be at least 6 characters long
          </p>
        )}
        {isMismatch && (
          <p className="text-xs text-red-500">Passwords do not match</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !isValid}>
            {mutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const Users = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // ✅ Add this
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [scheduleUser, setScheduleUser] = useState(null); // ✅ Add this
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferUser, setTransferUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, setPage } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, search: debouncedSearch, role }],
    queryFn: () => getUsers({ page, search: debouncedSearch, role }),
    placeholderData: (previousData) => previousData,
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleUserStatus(id),
    onSuccess: () => {
      toast.success("User status updated!");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries(["users"]);
      setIsDeleteConfirmOpen(false);
      setDeletingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const columns = [
    { key: "index", label: "#", render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <Badge variant={row.role} label={ROLE_LABELS[row.role]} />
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <Badge variant={row.isActive ? "active" : "inactive"} />,
    },
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
          {/* ✅ Schedule Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setScheduleUser(row);
              setIsScheduleModalOpen(true);
            }}
            title="Manage Schedule"
            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingUser(row);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleMutation.mutate(row._id)}
          >
            <ToggleLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPasswordUser(row);
              setIsPasswordModalOpen(true);
            }}
            title="Change Password"
            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
          >
            <KeyRound className="w-4 h-4" />
          </Button>
          {row.role !== "superadmin" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTransferUser(row);
                  setIsTransferModalOpen(true);
                }}
                title="Transfer Data"
                className="text-purple-500 hover:text-purple-700 hover:bg-purple-50"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeletingUser(row);
                  setIsDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout pageTitle="Team Members">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-64">
              <SearchInput
                placeholder="Search Team Members..."
                onChange={setSearch}
              />
            </div>
            <Select
              options={[
                { value: "", label: "All Roles" },
                { value: "sales", label: "Sales" },
                { value: "accountant", label: "Accountant" },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Team Members
          </Button>
        </div>

        <div className="p-6">
          <Table columns={columns} data={data?.users} isLoading={isLoading} />
          {data?.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateEditUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <CreateEditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
      />

      {/* ✅ Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setScheduleUser(null);
        }}
        userId={scheduleUser?._id}
        userName={scheduleUser?.name}
      />

      <TransferDataModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferUser(null);
        }}
        fromUser={transferUser}
        onSuccess={() => {
          queryClient.invalidateQueries(["users"]);
        }}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordUser(null);
        }}
        user={passwordUser}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={() => deleteMutation.mutate(deletingUser._id)}
        title="Delete User"
        message={`Are you sure you want to delete user "${deletingUser?.name}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
};
