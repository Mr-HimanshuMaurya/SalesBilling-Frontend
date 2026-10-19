import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FileText, Info } from "lucide-react";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure you want to do this?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,

  invoiceNumber,
  setInvoiceNumber,
  showInvoiceField = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-gray-600">{message}</p>
        {showInvoiceField && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-blue-600" />
              Invoice Number
            </label>

            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value.toUpperCase())}
              placeholder="Enter Invoice Number"
              className="
        w-full
        rounded-xl
        border border-gray-300
        bg-white
        px-4 py-2.5
        text-sm
        font-medium
        text-gray-800
        shadow-sm
        outline-none
        transition-all
        duration-200
        placeholder:text-gray-400
        focus:border-blue-500
        focus:ring-4
        focus:ring-blue-100
      "
            />

            <p className="flex items-center gap-1 text-xs text-gray-500">
              <Info className="w-3.5 h-3.5" />
              You can modify the invoice number before approving the invoice.
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
