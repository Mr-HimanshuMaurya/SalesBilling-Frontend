import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "../../components/layout/Layout";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { BillActions } from "../../features/bills/BillActions";
import { getBills } from "../../api/bills.api";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { SERVICES } from "../../utils/constants";

export const AccountantBilling = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, setPage } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: ["bills", { page, search: debouncedSearch, status, service }],
    queryFn: () => getBills({ page, search: debouncedSearch, status, service }),
    placeholderData: (previousData) => previousData,
  });

  const serviceNames = {
    Printer: "Printer",
  };

  const columns = [
    { key: "index", label: "S.no", render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: "billNumber", label: "Bill No" },
    {
      key: "client",
      label: "Client",
      render: (row) =>
        row.client?.companyName || row?.client?.representativeName,
    },
    {
      key: "service",
      label: "Service",
      render: (row) => serviceNames[row.service],
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => {
        const amount = Number(row.amount || 0);
        const amountWithGST = Math.round(amount * 1.18);
        return formatCurrency(amountWithGST);
      },
    },
    {
      key: "billingDate",
      label: "Billing Date",
      render: (row) => formatDate(row.billingDate),
    },
    {
      key: "renewalDate",
      label: "Renewal Date",
      render: (row) => (
        <span className="text-red-600">{formatDate(row.renewalDate)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge variant={row.status} />,
    },
    {
      key: "createdBy",
      label: "Submitted By",
      render: (row) => row.createdBy?.name,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => <BillActions bill={row} />,
    },
  ];

  return (
    <Layout pageTitle="Billing">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-64">
              <SearchInput placeholder="Search bills..." onChange={setSearch} />
            </div>
            <Select
              options={[
                { value: "", label: "All Statuses" },
                { value: "pending_approval", label: "Pending Approval" },
                { value: "approved", label: "Approved" },
                { value: "correction", label: "Correction" },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full md:w-48"
            />
            <Select
              options={[{ value: "", label: "All Services" }, ...SERVICES]}
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </div>

        <div className="p-6">
          <Table columns={columns} data={data?.bills} isLoading={isLoading} />
          {data?.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};
