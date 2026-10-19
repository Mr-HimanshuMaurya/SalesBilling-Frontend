import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  Clock,
  ChevronRight,
  Bell,
  BellOff,
  CheckCircle,
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

export const SalesRenewals = () => {
  const { user } = useAuth();
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDays, setFilterDays] = useState(90);
  const [stats, setStats] = useState({});
  const [alertStatus, setAlertStatus] = useState({});
  const [loadingAlert, setLoadingAlert] = useState({});
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewingBill, setRenewingBill] = useState(null);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [lostBill, setLostBill] = useState(null);

  useEffect(() => {
    fetchRenewals();
    fetchStats();
  }, [filterDays]);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const response = await renewalService.getSalesRenewals(filterDays);
      setRenewals(response.data.renewals);

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

  const fetchStats = async () => {
    try {
      const response = await renewalService.getRenewalStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  const filteredRenewals = renewals.filter((renewal) => renewal.isLost !== true);

  return (
    <Layout pageTitle="Upcoming Renewals">
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Next 7 Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.next7Days || 0}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Next 30 Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.next30Days || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Next 60 Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.next60Days || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalActive || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ChevronRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Show renewals for:
              </label>
              <select
                value={filterDays}
                onChange={(e) => setFilterDays(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>Next 7 days</option>
                <option value={15}>Next 15 days</option>
                <option value={30}>Next 30 days</option>
                <option value={60}>Next 60 days</option>
                <option value={90}>Next 90 days</option>
                <option value={365}>Next 365 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Renewals List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredRenewals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No Upcoming Renewals
            </h3>
            <p className="text-gray-500 mt-2">
              You don't have any renewals in the next {filterDays} days
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
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
                    !isRenewed;
                  const isStopped =
                    alertInfo.alertsStopped || alertInfo.clientRenewed;

                  return (
                    <tr key={renewal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {renewal.billNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {renewal.client?.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {renewal.client?.representativeName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(daysLeft)}`}
                          >
                            {daysLeft < 0
                              ? `${Math.abs(daysLeft)} days overdue`
                              : daysLeft === 0
                                ? "Due today"
                                : `${daysLeft} days left`}
                          </span>
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
                              ) : canStop && !isStopped ? (
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
