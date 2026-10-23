import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Edit,
  Download,
  Send,
  Mail,
  X,
  Check,
  Info,
  AlertCircle,
  Clock,
  User,
  FileText,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewBillModal } from "./ViewBillModal";
import { EditBillModal } from "./EditBillModal";
import {
  submitBill,
  approveBill,
  sendForCorrection,
  sendBillEmail,
} from "../../api/bills.api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export const BillActions = ({ bill, onView, onEdit }) => {
  const { user } = useAuth();
  const userRole = user.role;
  const queryClient = useQueryClient();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(bill.billNumber);
  const [isCorrectionInfoOpen, setIsCorrectionInfoOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: () => submitBill(bill._id),
    onSuccess: () => {
      toast.success("Bill submitted for approval");
      queryClient.invalidateQueries(["bills"]);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to submit bill"),
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: () =>
      approveBill(bill._id, {
        billNumber: invoiceNumber,
      }),
    onSuccess: () => {
      toast.success("Bill approved");
      queryClient.invalidateQueries(["bills"]);
      setIsApproveConfirmOpen(false);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to approve bill"),
  });

  // Send for Correction Mutation
  const sendForCorrectionMutation = useMutation({
    mutationFn: () => sendForCorrection(bill._id, { reason: correctionReason }),
    onSuccess: () => {
      toast.success("Bill sent for correction");
      queryClient.invalidateQueries(["bills"]);
      setIsCorrectionModalOpen(false);
      setCorrectionReason("");
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Failed to send bill for correction",
      ),
  });

  const sendProformaMutation = useMutation({
    mutationFn: () => sendBillEmail(bill._id, { invoiceType: "proforma" }),
    onSuccess: () => {
      toast.success("Proforma Invoice sent successfully");
      queryClient.invalidateQueries(["bills"]);
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Failed to send proforma invoice",
      ),
  });

  const sendTaxInvoiceMutation = useMutation({
    mutationFn: () =>
      sendBillEmail(
        bill._id,
        bill.adminDirectBill ? { invoiceType: "tax" } : undefined,
      ),
    onSuccess: () => {
      toast.success("Tax Invoice sent successfully");
      queryClient.invalidateQueries(["bills"]);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to send tax invoice"),
  });

  const handleDownloadPdf = (type = "tax") => {
    const baseUrl =
      import.meta.env.VITE_API_URL || "https://billing.saviengineering.com";
    const suffix = bill.adminDirectBill ? `?type=${type}` : "";
    window.open(`${baseUrl}/api/pdf/${bill._id}${suffix}`, "_blank");
  };

  const canEdit =
    (user.role === "sales" && ["draft", "correction"].includes(bill.status)) ||
    user.role === "superadmin" ||
    (user.role === "accountant" && ["pending_approval"].includes(bill.status));

  const canSubmit =
    user.role === "sales" &&
    !bill.adminDirectBill &&
    ["draft", "correction"].includes(bill.status);
  const canApproveReject =
    user.role === "accountant" && bill.status === "pending_approval";
  // const canSendEmail =
  //   user.role === "sales" && bill.status === "approved" && !bill.emailSentAt;

  const canSendEmail =
    (["sales", "accountant"].includes(user.role) &&
      bill.status === "approved" &&
      !bill.emailSentAt) ||
    (user.role === "superadmin" &&
      bill.adminDirectBill &&
      !bill.emailSentAt);

  const canSendPI =
    (user.role === "sales" && bill.status === "draft" && !bill.proformaSentAt) ||
    (user.role === "superadmin" &&
      bill.adminDirectBill &&
      !bill.proformaSentAt);

  // Check if bill is in correction status
  const isCorrection = bill.status === "correction";

  // Loading states
  const isLoading =
    submitMutation.isPending ||
    approveMutation.isPending ||
    sendForCorrectionMutation.isPending ||
    sendProformaMutation.isPending ||
    sendTaxInvoiceMutation.isPending;

  return (
    <>
      <div className="flex items-center gap-1">
        {/* View Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsViewModalOpen(true)}
          disabled={isLoading}
        >
          <Eye className="w-4 h-4 text-blue-500" />
        </Button>

        {/* Edit Button */}

        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            disabled={isLoading}
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}

        {/* Download Button */}

        {bill.adminDirectBill && user.role === "superadmin" ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              title="Download Proforma PDF"
              onClick={() => handleDownloadPdf("proforma")}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Download Tax Invoice PDF"
              onClick={() => handleDownloadPdf("tax")}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 text-green-500" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadPdf()}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 text-green-500" />
          </Button>
        )}

        {/* Correction Info Button */}
        {isCorrection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCorrectionInfoOpen(true)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            disabled={isLoading}
          >
            <AlertCircle className="w-4 h-4" />
          </Button>
        )}

        {/* Submit Button */}
        {canSubmit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => submitMutation.mutate()}
            className="border border-[#b1b1fa]"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Submit for Approval
                <Send className="w-4 h-4 text-[#4F39F6]" />
              </>
            )}
          </Button>
        )}

        {canSendPI && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sendProformaMutation.mutate()}
            disabled={sendProformaMutation.isPending}
            className="border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            {sendProformaMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send PI to Client
              </>
            )}
          </Button>
        )}
        {/* Send Email Button */}
        {canSendEmail && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sendTaxInvoiceMutation.mutate()}
            disabled={sendTaxInvoiceMutation.isPending}
            className="border border-amber-200 bg-amber-50 hover:bg-amber-100"
          >
            {sendTaxInvoiceMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <span className="text-amber-500">Send Invoice to Client</span>
                <Mail className="w-4.5 h-4.5 text-amber-500 " />
              </>
            )}
          </Button>
        )}

        {/* Approve/Send for Correction Buttons */}
        {canApproveReject && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInvoiceNumber(bill.billNumber);
                setIsApproveConfirmOpen(true);
              }}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              ) : (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCorrectionModalOpen(true)}
              disabled={sendForCorrectionMutation.isPending}
            >
              {sendForCorrectionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
              ) : (
                <X className="w-4 h-4 text-orange-600" />
              )}
            </Button>
          </>
        )}
      </div>

      {/* View Bill Modal */}
      <ViewBillModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        bill={bill}
        userRole={userRole}
      />

      {/* Edit Bill Modal */}
      <EditBillModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bill={bill}
      />

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={() =>
          approveMutation.mutate({
            invoiceNumber,
          })
        }
        title="Approve Bill"
        message="Please verify the invoice number before approving."
        confirmText={approveMutation.isPending ? "Approving..." : "Approve"}
        isLoading={approveMutation.isPending}
        showInvoiceField
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
      />

      {/* Send for Correction Modal */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Send for Correction"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (correctionReason.trim()) {
              sendForCorrectionMutation.mutate();
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Reason for Correction"
            as="textarea"
            rows={3}
            value={correctionReason}
            onChange={(e) => setCorrectionReason(e.target.value)}
            placeholder="Please provide a reason for correction"
            required
            disabled={sendForCorrectionMutation.isPending}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCorrectionModalOpen(false)}
              disabled={sendForCorrectionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={
                sendForCorrectionMutation.isPending || !correctionReason.trim()
              }
            >
              {sendForCorrectionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send for Correction"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Correction Info Modal */}
      <Modal
        isOpen={isCorrectionInfoOpen}
        onClose={() => setIsCorrectionInfoOpen(false)}
        title="Correction Details"
        size="md"
      >
        <div className="space-y-6">
          {/* Correction Reason */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-orange-800 mb-1">
                  Correction Reason
                </h4>
                <p className="text-sm text-orange-700">
                  {bill.correctionReason || "No reason provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Corrected By */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium">Corrected By</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {bill.correctionBy?.name || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {bill.correctionBy?.email || ""}
              </p>
            </div>

            {/* Corrected At */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Corrected At</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {bill.correctionAt
                  ? new Date(bill.correctionAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {bill.correctionAt
                  ? new Date(bill.correctionAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : ""}
              </p>
            </div>
          </div>

          {/* Bill Info */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-medium">Bill Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Bill Number:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {bill.billNumber}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium text-gray-900">
                  ₹{bill.amount}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Client:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {bill.client?.companyName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Service:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {bill.service || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setIsCorrectionInfoOpen(false)}
              disabled={isLoading}
            >
              Close
            </Button>
            {canEdit && (
              <Button
                variant="primary"
                onClick={() => {
                  setIsCorrectionInfoOpen(false);
                  setIsEditModalOpen(true);
                }}
                disabled={isLoading}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Bill
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
