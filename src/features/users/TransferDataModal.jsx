import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Users as UsersIcon,
  FileText,
  IndianRupee,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Select } from "../../components/ui/Select.jsx";
import {
  getUsers,
  getTransferPreview,
  transferUserData,
} from "../../api/users.api.js";
import { ROLE_LABELS } from "../../utils/constants.js";

export const TransferDataModal = ({ isOpen, onClose, fromUser, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [toUserId, setToUserId] = useState("");
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setToUserId("");
      setConfirmError("");
    }
  }, [isOpen]);

  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ["transfer-preview", fromUser?._id],
    queryFn: () => getTransferPreview(fromUser._id),
    enabled: !!isOpen && !!fromUser?._id,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", { page: 1, limit: 1000, isActive: true }],
    queryFn: () =>
      getUsers({ page: 1, limit: 1000, isActive: true, role: "" }),
    enabled: !!isOpen,
  });

  const activeUsers = (usersData?.users || usersData?.data?.users || []).filter(
    (u) =>
      u._id !== fromUser?._id &&
      u.role !== "superadmin" &&
      u.isActive === true,
  );

  const targetUser = activeUsers.find((u) => u._id === toUserId);

  const transferMutation = useMutation({
    mutationFn: ({ fromUserId, toUserId }) =>
      transferUserData(fromUserId, { toUserId }),
    onSuccess: () => {
      toast.success("Data transferred successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || "Failed to transfer data";
      setConfirmError(msg);
      toast.error(msg);
    },
  });

  const handleClose = () => {
    setStep(1);
    setToUserId("");
    setConfirmError("");
    onClose();
  };

  const handleNext = () => {
    if (!toUserId) return;
    setConfirmError("");
    setStep(2);
  };

  const handleConfirm = () => {
    if (!toUserId) return;
    transferMutation.mutate({
      fromUserId: fromUser._id,
      toUserId,
    });
  };

  const preview = previewData || {};

  const renderStep1 = () => (
    <div>
      <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
          This will transfer <strong>ALL data</strong> from{" "}
          <strong>{fromUser?.name}</strong> to the selected member and
          deactivate their account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {previewLoading ? (
          <div className="col-span-3 flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <UsersIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-indigo-700">
                  Total Clients
                </span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                {preview.clientCount ?? 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-700">
                  Total Bills
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {preview.billCount ?? 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <IndianRupee className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-700">
                  Total Amount
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                ₹{(preview.totalAmount ?? 0).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transfer to <span className="text-red-500">*</span>
        </label>
        {usersLoading ? (
          <div className="flex items-center justify-center py-6 border border-gray-200 rounded-lg">
            <Spinner size="sm" />
          </div>
        ) : activeUsers.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 px-4 border border-gray-200 rounded-lg bg-gray-50">
            No active team members available to transfer to.
          </p>
        ) : (
          <>
            <Select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              options={[
                { value: "", label: "Select a team member..." },
                ...activeUsers.map((u) => ({
                  value: u._id,
                  label: `${u.name} — ${ROLE_LABELS[u.role] || u.role} (${u.email})`,
                })),
              ]}
              label=""
            />
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {activeUsers.map((u) => (
                <label
                  key={u._id}
                  className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                    toUserId === u._id ? "bg-indigo-50" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="targetUser"
                    value={u._id}
                    checked={toUserId === u._id}
                    onChange={(e) => setToUserId(e.target.value)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="font-medium text-gray-900 truncate">
                      {u.name}
                    </span>
                    <Badge variant={u.role} label={ROLE_LABELS[u.role]} />
                    <span className="text-xs text-gray-500 truncate">
                      {u.email}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!toUserId || previewLoading || usersLoading}
        >
          Next: Confirm Transfer
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const clientCount = preview.clientCount ?? 0;
    const billCount = preview.billCount ?? 0;
    return (
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          You are about to transfer:
        </p>

        <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-10 shrink-0 mt-0.5">
              FROM:
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {fromUser?.name}
              </p>
              <p className="text-xs text-gray-500">{fromUser?.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-10 shrink-0 mt-0.5">
              TO:
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {targetUser?.name}
              </p>
              <p className="text-xs text-gray-500">{targetUser?.email}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-1.5 text-sm text-gray-700">
            <p>
              • <strong>{clientCount}</strong> Client
              {clientCount === 1 ? "" : "s"} will be transferred
            </p>
            <p>
              • <strong>{billCount}</strong> Bill
              {billCount === 1 ? "" : "s"} will be transferred
            </p>
            <p>
              • <strong>{fromUser?.name}</strong>
              &apos;s account will be <strong>DEACTIVATED</strong>
            </p>
          </div>
        </div>

        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800">
            This action cannot be undone.
          </p>
        </div>

        {confirmError && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{confirmError}</p>
          </div>
        )}

        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setStep(1);
              setConfirmError("");
            }}
            disabled={transferMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={transferMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirm}
              disabled={transferMutation.isPending || !toUserId}
            >
              {transferMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-1" />
                  Transferring...
                </>
              ) : (
                "Confirm Transfer"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Transfer Data & Deactivate Member"
      size="md"
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            step === 1
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          1
        </span>
        <span
          className={`text-sm ${
            step === 1 ? "font-semibold text-gray-900" : "text-gray-500"
          }`}
        >
          Preview & Select Member
        </span>
        <div className="flex-1 h-px bg-gray-200 mx-2" />
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            step === 2
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          2
        </span>
        <span
          className={`text-sm ${
            step === 2 ? "font-semibold text-gray-900" : "text-gray-500"
          }`}
        >
          Confirmation
        </span>
      </div>

      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};
