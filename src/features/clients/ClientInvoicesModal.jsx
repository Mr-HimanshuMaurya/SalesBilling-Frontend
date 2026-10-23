import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { getBills } from "../../api/bills.api";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { SERVICES } from "../../utils/constants";

const serviceLabel = (value) =>
  SERVICES.find((s) => s.value === value)?.label || value || "-";

const DetailItem = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900 break-words">
      {value || "-"}
    </p>
  </div>
);

export const ClientInvoicesModal = ({ isOpen, onClose, client }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["client-bills", client?._id],
    queryFn: () => getBills({ client: client._id, limit: 100 }),
    enabled: isOpen && !!client?._id,
  });

  const bills = data?.bills || [];

  // Group invoices by year, newest first
  const groupedBills = useMemo(() => {
    const sorted = [...bills].sort(
      (a, b) =>
        new Date(b.billingDate || b.createdAt) -
        new Date(a.billingDate || a.createdAt),
    );

    const groups = [];
    sorted.forEach((bill) => {
      const year = new Date(bill.billingDate || bill.createdAt).getFullYear();
      const existing = groups.find((g) => g.year === year);
      if (existing) existing.items.push(bill);
      else groups.push({ year, items: [bill] });
    });

    return groups;
  }, [bills]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoices${client?.companyName ? ` - ${client.companyName}` : ""}`}
      size="xxl"
    >
      {/* Client basic details */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <DetailItem label="Company Name" value={client?.companyName} />
          <DetailItem
            label="Representative"
            value={client?.representativeName}
          />
          <DetailItem label="Email" value={client?.email} />
          <DetailItem label="Phone" value={client?.phone} />
          <DetailItem label="GST Number" value={client?.gstNumber} />

        </div>
      </div>

      {/* Invoices tree */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading invoices...</span>
          </div>
        ) : groupedBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
            <FileText className="w-8 h-8" />
            <p className="text-sm">No invoices found for this client</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedBills.map((group) => (
              <div key={group.year}>
                {/* Year (parent node) */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {group.year}
                  </span>
                  <span className="text-xs text-gray-500">
                    {group.items.length} invoice
                    {group.items.length > 1 ? "s" : ""}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Invoices (children) */}
                <div className="mt-3 ml-3 space-y-3 border-l-2 border-gray-200 pl-4">
                  {group.items.map((bill) => {
                    const amount = Number(bill.amount || 0);
                    // const total = Math.round((client, amount).total);

                    return (
                      <div
                        key={bill._id}
                        className="relative rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <span className="absolute -left-[22px] top-6 h-2.5 w-2.5 rounded-full bg-indigo-400" />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-900">
                              {bill.billNumber}
                            </span>
                            <Badge variant={bill.status} />
                          </div>
                          {/* <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(total)}
                          </span> */}
                        </div>

                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          <DetailItem
                            label="Service"
                            value={serviceLabel(bill.service)}
                          />
                          <DetailItem
                            label="Billing Date"
                            value={
                              bill.billingDate
                                ? formatDate(bill.billingDate)
                                : "-"
                            }
                          />
                          <DetailItem
                            label="Renewal Date"
                            value={
                              bill.renewalDate
                                ? formatDate(bill.renewalDate)
                                : "-"
                            }
                          />
                          <DetailItem
                            label="Amount (Base)"
                            value={formatCurrency(amount)}
                          />
                          <DetailItem
                            label="Created By"
                            value={bill.createdBy?.name}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
