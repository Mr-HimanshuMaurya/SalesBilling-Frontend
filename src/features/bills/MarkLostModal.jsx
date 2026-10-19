import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { markAsLost } from "../../api/lost.api.js";

export const MarkLostModal = ({ isOpen, onClose, bill, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const mutation = useMutation({
    mutationFn: ({ billId, reason }) => markAsLost(billId, { reason }),
    onSuccess: () => {
      toast.success("Client marked as lost successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err) => {
      console.error("Error marking as lost:", err);
      toast.error(err?.response?.data?.message || "Failed to mark as lost");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 5) {
      setError("Reason must be at least 5 characters");
      return;
    }

    setError("");
    mutation.mutate({ billId: bill._id, reason: reason.trim() });
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const getServiceLabel = (service) => {
    const labels = {
      Printer: "Printer",
    };
    return labels[service] || service;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Mark as Lost Client"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        {bill && (
          <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {bill.client?.companyName || "Unknown Client"}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              <span>
                Bill No: <strong>{bill.billNumber}</strong>
              </span>
              <span>
                Service: <strong>{getServiceLabel(bill.service)}</strong>
              </span>
              <span>
                Amount: <strong>₹{Number(bill.amount).toLocaleString()}</strong>
              </span>
            </div>
          </div>
        )}

        <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            This client will be moved to Lost Clients section.
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for marking as lost <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder="Please provide a reason..."
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
              error ? "border-red-400 focus:ring-red-500" : "border-gray-300"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={mutation.isPending}>
            {mutation.isPending ? "Processing..." : "Mark as Lost"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
