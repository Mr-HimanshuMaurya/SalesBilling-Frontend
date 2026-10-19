import React, { useState } from "react";
import { UserX, Eye, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "../components/layout/Layout.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { SearchInput } from "../components/ui/SearchInput.jsx";
import { getLostClients } from "../api/lost.api.js";
import { formatDate } from "../utils/formatters.js";

export const LostClients = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedReason, setSelectedReason] = useState(null); // ✅ NEW

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["lost-clients", { page, search }],
    queryFn: async () => {
      const res = await getLostClients({
        page,
        limit: 10,
        search,
      });
      return {
        bills: res.bills || [],
        total: res.total || 0,
        page: res.page || 1,
        totalPages: res.totalPages || 1,
      };
    },
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const bills = data?.bills || [];
  const total = data?.total || 0;
  const currentPage = data?.page || page;
  const totalPages = data?.totalPages || 1;

  const getServiceLabel = (service) => {
    const labels = {
      Printer: "Printer",
    };
    return labels[service] || service;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const serialStart = (currentPage - 1) * 10;

  return (
    <Layout pageTitle="Lost Clients">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Lost Clients
              </h1>
              <p className="text-sm text-gray-500">
                Total: {total} lost {total === 1 ? "client" : "clients"}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-80">
            <SearchInput
              placeholder="Search by company name or bill number..."
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 bg-white rounded-lg shadow border border-gray-200">
            <Spinner size="lg" />
          </div>
        ) : bills.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
            <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No lost clients found
            </h3>
            <p className="text-gray-500 mt-2">
              {search
                ? "Try adjusting your search criteria."
                : "Lost clients will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Representative
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[200px]">
                        Lost Reason
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marked By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Lost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.map((bill, index) => (
                      <tr key={bill._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {serialStart + index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {bill.client?.companyName || "N/A"}
                          </div>
                          {bill.client?.phone && (
                            <div className="text-xs text-gray-500">
                              {bill.client.phone}
                              {bill.client.email
                                ? ` • ${bill.client.email}`
                                : ""}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {bill.client?.representativeName || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {bill.billNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {getServiceLabel(bill.service)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{Number(bill.amount).toLocaleString()}
                        </td>

                        {/* ✅ UPDATED: Lost Reason with Eye Icon */}
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span title={bill.lostReason}>
                              {truncateText(bill.lostReason, 20)}
                            </span>
                            {bill.lostReason && bill.lostReason.length > 40 && (
                              <button
                                onClick={() => setSelectedReason(bill)}
                                className="p-1 rounded hover:bg-indigo-100 text-indigo-600 transition-colors flex-shrink-0"
                                title="View full reason"
                              >
                                <Eye className="w-4 h-4 cursor-pointer" />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {bill.lostMarkedBy?.name || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bill.lostMarkedAt
                            ? formatDate(bill.lostMarkedAt)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      {/* ✅ NEW: Modal for Full Lost Reason */}
      {selectedReason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 p-4"
          onClick={() => setSelectedReason(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Lost Reason
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedReason.client?.companyName || "N/A"} •{" "}
                  {selectedReason.billNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedReason(null)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedReason.lostReason || "No reason provided."}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedReason(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
