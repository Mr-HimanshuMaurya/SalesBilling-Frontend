import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  User,
  Building2,
  Clock,
  BellOff,
  CheckCircle,
  Bell,
  RefreshCw,
  UserX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { renewalService } from "../../services/renewal.service.js";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Layout } from "../../components/layout/Layout.jsx";
import { EditBillModal } from "../../features/bills/EditBillModal.jsx";
import { MarkLostModal } from "../../features/bills/MarkLostModal.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { toast } from "react-hot-toast";

export const AdminRenewals = () => {
  const { user } = useAuth();
  const [renewals, setRenewals] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [clientsWithMultipleBills, setClientsWithMultipleBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertStatus, setAlertStatus] = useState({});
  const [loadingAlert, setLoadingAlert] = useState({});
  const [filters, setFilters] = useState({
    days: 90,
    salesPerson: "",
    client: "",
    service: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewingBill, setRenewingBill] = useState(null);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [lostBill, setLostBill] = useState(null);

  useEffect(() => {
    fetchRenewals();
  }, [filters]);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const response = await renewalService.getAllRenewals(filters);
      setRenewals(response.data.renewals);
      if (response.data.salesPersons) {
        setSalesPersons(response.data.salesPersons);
      }
      if (response.data.clientsWithMultipleBills) {
        setClientsWithMultipleBills(response.data.clientsWithMultipleBills);
      }

      // Check alert status for each renewal
      response.data.renewals.forEach((renewal) => {
        checkAlertStatus(renewal._id);
      });
    } catch (error) {
      console.error("Error fetching renewals:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlertStatus = async (billId) => {
    try {
      const response = await renewalService.getAlertStatus(billId);
      setAlertStatus((prev) => ({
        ...prev,
        [billId]: response.data.data,
      }));
    } catch (error) {
      console.error("Error checking alert status:", error);
    }
  };

  const handleStopAlerts = async (billId) => {
    if (
      !window.confirm(
        "Are you sure you want to stop renewal alerts for this bill?",
      )
    ) {
      return;
    }

    try {
      setLoadingAlert((prev) => ({ ...prev, [billId]: true }));
      await renewalService.stopAlerts(billId);

      toast.success("Renewal alerts stopped successfully!");

      // Update status
      setAlertStatus((prev) => ({
        ...prev,
        [billId]: {
          ...prev[billId],
          alertsStopped: true,
          canStopAlerts: false,
          clientRenewed: true,
        },
      }));

      // Refresh data
      fetchRenewals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to stop alerts");
    } finally {
      setLoadingAlert((prev) => ({ ...prev, [billId]: false }));
    }
  };

  const getDaysDifference = (date) => {
    const now = new Date();
    const renewalDate = new Date(date);
    const diffTime = renewalDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (days) => {
    if (days <= 3) return "bg-red-100 text-red-800";
    if (days <= 7) return "bg-orange-100 text-orange-800";
    if (days <= 15) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const filteredRenewals = renewals.filter((renewal) => {
    if (renewal.isLost === true) return false;
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      renewal.billNumber?.toLowerCase().includes(search) ||
      renewal.client?.companyName?.toLowerCase().includes(search) ||
      renewal.client?.representativeName?.toLowerCase().includes(search)
    );
  });

  // Check if user can stop alerts (Superadmin or Accountant)
  const canStopAlerts =
    user.role === "superadmin" || user.role === "accountant";

  return (
    <Layout pageTitle="All Upcoming Renewals">
      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days Range
              </label>
              <select
                value={filters.days}
                onChange={(e) =>
                  setFilters({ ...filters, days: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>Next 7 days</option>
                <option value={15}>Next 15 days</option>
                <option value={30}>Next 30 days</option>
                <option value={60}>Next 60 days</option>
                <option value={90}>Next 90 days</option>
                <option value={365}>Next 365 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Person
              </label>
              <select
                value={filters.salesPerson}
                onChange={(e) =>
                  setFilters({ ...filters, salesPerson: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Sales Persons</option>
                {salesPersons.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select
                value={filters.service}
                onChange={(e) =>
                  setFilters({ ...filters, service: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Services</option>

                <option value="Printer">Printer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients or bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Renewals Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredRenewals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No Renewals Found
            </h3>
            <p className="text-gray-500 mt-2">
              No renewals matching your filters in the selected time period
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renewal Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRenewals.map((renewal) => {
                    const daysLeft = getDaysDifference(renewal.renewalDate);
                    const alertInfo = alertStatus[renewal._id] || {};
                    const isRenewed = renewal.renewed || false;
                    const canStop =
                      alertInfo.canStopAlerts &&
                      daysLeft <= 7 &&
                      daysLeft > 0 &&
                      !alertInfo.alertsStopped &&
                      !isRenewed;
                    const isStopped =
                      alertInfo.alertsStopped || alertInfo.clientRenewed;

                    const clientId = renewal.client?._id?.toString();
                    const isHighlighted =
                      clientId && clientsWithMultipleBills.includes(clientId);

                    return (
                      <tr
                        key={renewal._id}
                        className={`hover:bg-gray-50 ${
                          isHighlighted
                            ? "bg-indigo-50/60 border-l-4 border-l-indigo-500"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                          {renewal.billNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-medium text-gray-900">
                            {renewal.client?.companyName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {renewal.client?.representativeName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {renewal.createdBy?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {renewal.service?.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{renewal.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(renewal.renewalDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {renewal.renewed === true ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1 mt-1" />
                                Renewed
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(daysLeft)}`}
                              >
                                {daysLeft < 0
                                  ? `${Math.abs(daysLeft)} days overdue`
                                  : daysLeft === 0
                                    ? "Due today"
                                    : `${daysLeft} days left`}
                              </span>
                            )}
                            {isStopped && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Renewed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            {renewal.isLost === true ? (
                              <Badge variant="inactive" label="Lost" />
                            ) : (
                              <>
                                {isRenewed ? (
                                  <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-lg">
                                    <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" />
                                    Renewed
                                  </span>
                                ) : canStopAlerts && canStop ? (
                                  <button
                                    onClick={() => handleStopAlerts(renewal._id)}
                                    disabled={loadingAlert[renewal._id]}
                                    className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {loadingAlert[renewal._id] ? (
                                      <Spinner size="sm" className="mr-1" />
                                    ) : (
                                      <BellOff className="w-4 h-4 mr-1" />
                                    )}
                                    Stop Alerts
                                  </button>
                                ) : isStopped ? (
                                  <span className="text-sm text-gray-400 font-medium">
                                    <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                                    Alerts Stopped
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    <Bell className="w-4 h-4 inline mr-1 text-gray-300" />
                                    {daysLeft > 7 ? "Not yet" : "Alert Active"}
                                  </span>
                                )}

                                {daysLeft <= 7 && !isStopped && !isRenewed && (
                                  <button
                                    onClick={() => {
                                      setRenewingBill(renewal);
                                      setIsRenewModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Renew Now
                                  </button>
                                )}

                                {!isRenewed && (
                                  <button
                                    title="Mark as Lost"
                                    onClick={() => {
                                      setLostBill(renewal);
                                      setIsLostModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 text-red-500 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-red-200"
                                  >
                                    <UserX className="w-4 h-4 mr-1" />
                                    Mark as Lost
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <EditBillModal
        isOpen={isRenewModalOpen}
        onClose={() => {
          setIsRenewModalOpen(false);
          setRenewingBill(null);
          fetchRenewals();
        }}
        bill={renewingBill}
        mode="renew"
      />

      <MarkLostModal
        isOpen={isLostModalOpen}
        onClose={() => {
          setIsLostModalOpen(false);
          setLostBill(null);
        }}
        bill={lostBill}
        onSuccess={() => {
          fetchRenewals();
        }}
      />
    </Layout>
  );
};
