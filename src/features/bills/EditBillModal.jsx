import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { getClients } from "../../api/clients.api";
import { createBill, updateBill } from "../../api/bills.api";
import {
  SERVICES,
  GST_TYPES,
  GST_RATE,
  CGST_RATE,
  SGST_RATE,
} from "../../utils/constants";
import toast from "react-hot-toast";

const emptyItem = () => ({
  description: "",
  quantity: "1",
  rate: "",
});

const itemsFromBill = (bill) => {
  if (bill?.lineItems?.length) {
    return bill.lineItems.map((item) => ({
      description: item.description || "",
      quantity: String(item.quantity ?? 1),
      rate: String(item.rate ?? ""),
    }));
  }

  // Legacy bills: single amount row from service/specs
  return [
    {
      description: bill?.service || "Item",
      quantity: "1",
      rate: String(bill?.amount ?? ""),
    },
  ];
};

export const EditBillModal = ({ isOpen, onClose, bill, mode = "edit" }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState("");
  const [service, setService] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [lineItems, setLineItems] = useState([emptyItem()]);
  const [gstType, setGstType] = useState("IGST");
  const [billingDate, setBillingDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const isRenewMode = mode === "renew";

  const { data: clientsData } = useQuery({
    queryKey: ["clients", { search: clientSearch }],
    queryFn: () => getClients({ search: clientSearch, limit: 50 }),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!bill) return;

    setClientId(bill?.client?._id || "");
    setService(bill?.service || "");
    setLineItems(itemsFromBill(bill));
    setGstType(
      bill?.gstType === "CGST_SGST"
        ? "CGST_SGST"
        : bill?.gstType === "NO_GST"
          ? "NO_GST"
          : "IGST",
    );
    setStep(1);

    if (isRenewMode) {
      const today = new Date();
      setBillingDate(today.toISOString().split("T")[0]);
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setRenewalDate(nextYear.toISOString().split("T")[0]);
    } else {
      setBillingDate(
        bill?.billingDate
          ? new Date(bill.billingDate).toISOString().split("T")[0]
          : "",
      );
      setRenewalDate(
        bill?.renewalDate
          ? new Date(bill.renewalDate).toISOString().split("T")[0]
          : "",
      );
    }
  }, [bill, isRenewMode, isOpen]);

  const taxableAmount = useMemo(
    () =>
      lineItems.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;
        return sum + qty * rate;
      }, 0),
    [lineItems],
  );

  const cgstAmount =
    gstType === "CGST_SGST"
      ? Number(((taxableAmount * CGST_RATE) / 100).toFixed(2))
      : 0;
  const sgstAmount =
    gstType === "CGST_SGST"
      ? Number(((taxableAmount * SGST_RATE) / 100).toFixed(2))
      : 0;
  const igstAmount =
    gstType === "IGST"
      ? Number(((taxableAmount * GST_RATE) / 100).toFixed(2))
      : 0;
  const amountWithGST = Math.round(
    taxableAmount + igstAmount + cgstAmount + sgstAmount,
  );

  const updateMutation = useMutation({
    mutationFn: (data) => updateBill(bill?._id, data),
    onSuccess: () => {
      toast.success("Bill updated successfully!");
      queryClient.invalidateQueries(["bills"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update bill");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => createBill(data),
    onSuccess: () => {
      toast.success("Renewal bill created successfully!");
      queryClient.invalidateQueries(["bills"]);
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create renewal bill",
      );
    },
  });

  const mutation = isRenewMode ? createMutation : updateMutation;

  const handleItemChange = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => setLineItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index) => {
    setLineItems((prev) =>
      prev.length === 1 ? [emptyItem()] : prev.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedItems = lineItems
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
      }))
      .filter((item) => item.description && item.quantity > 0);

    if (cleanedItems.length === 0) {
      toast.error("Add at least one item with description, qty and rate");
      return;
    }

    const submitData = {
      clientId,
      service,
      lineItems: cleanedItems,
      gstType,
      billingDate,
      renewalDate,
      amount: taxableAmount,
    };

    if (isRenewMode && bill?._id) {
      submitData.parentBillId = bill._id;
    }

    mutation.mutate(submitData);
  };

  if (!bill) return null;

  const selectedClient = clientsData?.clients?.find((c) => c._id === clientId);
  const selectedService = SERVICES.find((s) => s.value === service);
  const canProceedItems = lineItems.some(
    (item) =>
      item.description.trim() &&
      Number(item.quantity) > 0 &&
      Number(item.rate) > 0,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRenewMode ? "Renew Bill" : "Edit Bill"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <div className="space-y-2">
                <Input
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {clientsData?.clients?.map((client) => (
                    <button
                      key={client._id}
                      type="button"
                      onClick={() => setClientId(client._id)}
                      className={`
                        w-full text-left px-4 py-2 text-sm border-b border-gray-100 last:border-0
                        ${
                          client._id === clientId
                            ? "bg-indigo-50 text-indigo-700"
                            : "hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="font-medium">{client?.companyName}</div>
                      <div className="text-xs text-gray-500">
                        {client?.representativeName} - {client?.phone}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Service
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SERVICES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setService(s.value)}
                    className={`
                      p-4 border-2 rounded-lg text-center transition-colors
                      ${
                        service === s.value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!clientId || !service}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Client:</span>
                  <span className="ml-2 font-medium">
                    {selectedClient?.companyName || bill?.client?.companyName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Service:</span>
                  <span className="ml-2 font-medium">
                    {selectedService?.label}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Items
                </label>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 w-12">
                        S.N.
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">
                        Description
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 w-28">
                        Rate
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-gray-600 w-28">
                        Amount
                      </th>
                      <th className="px-3 py-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => {
                      const rowAmount =
                        (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2">
                            <Input
                              placeholder="Item description"
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              prefix="₹"
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(index, "rate", e.target.value)
                              }
                              required
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-800">
                            ₹
                            {rowAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Billing Date"
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                required
              />
              <Input
                label="Renewal Date"
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Amount (without GST)"
                type="text"
                prefix="₹"
                value={taxableAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                readOnly
                tabIndex={-1}
                className="pointer-events-none"
              />
              <Select
                label="GST Type"
                options={GST_TYPES}
                value={gstType}
                onChange={(e) => setGstType(e.target.value)}
              />
              <Input
                label={
                  gstType === "NO_GST"
                    ? "Total Amount (No GST)"
                    : gstType === "IGST"
                      ? "Amount with IGST 18%"
                      : "Amount with SGST 9% + CGST 9%"
                }
                type="text"
                prefix="₹"
                value={amountWithGST.toLocaleString("en-IN")}
                readOnly
                tabIndex={-1}
                className="pointer-events-none"
              />
            </div>

            {gstType === "CGST_SGST" && taxableAmount > 0 && (
              <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                <span>CGST 9%: ₹{cgstAmount.toLocaleString("en-IN")}</span>
                <span>SGST 9%: ₹{sgstAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || !canProceedItems}
              >
                {mutation.isPending
                  ? isRenewMode
                    ? "Creating..."
                    : "Updating..."
                  : isRenewMode
                    ? "Create Renewal Bill"
                    : "Update Bill"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
