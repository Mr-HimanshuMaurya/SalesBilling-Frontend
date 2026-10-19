import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { getUsers } from "../../api/users.api";
import { getClients, getClientsWithoutBills } from "../../api/clients.api";
import { getBills } from "../../api/bills.api";
import { getRevenueStats, getRevenueByMonth } from "../../api/revenue.api";
import { Spinner } from "../../components/ui/Spinner";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "indigo",
  subtext = null,
}) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    pink: "bg-pink-50 text-pink-600",
    teal: "bg-teal-50 text-teal-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
};

const RevenueCard = ({
  title,
  amount,
  count,
  month,
  icon: Icon,
  color = "indigo",
}) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{amount}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500">
              <span className="font-medium">{count}</span> bills
            </span>
            {month && <span className="text-xs text-gray-400">{month}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const GrowthIndicator = ({ percentage, label }) => {
  const isPositive = percentage >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? "text-green-600" : "text-red-600";
  const bgColor = isPositive ? "bg-green-50" : "bg-red-50";

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-full ${bgColor}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className={`text-sm font-semibold ${color}`}>
        {isPositive ? "+" : ""}
        {percentage}%
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
};

export const SuperAdminDashboard = () => {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ limit: 100 }),
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients({ limit: 100 }),
  });

  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => getBills({ limit: 100 }),
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueStats"],
    queryFn: getRevenueStats,
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["revenueByMonth"],
    queryFn: () => getRevenueByMonth(6),
  });

  const { data: clientsWithoutBillsData } = useQuery({
    queryKey: ["clientsWithoutBills"],
    queryFn: getClientsWithoutBills,
  });

  const isLoading =
    usersLoading ||
    clientsLoading ||
    billsLoading ||
    revenueLoading ||
    monthlyLoading;

  if (isLoading) {
    return (
      <Layout pageTitle="Dashboard">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  const approvedBills =
    billsData?.bills?.filter((b) => b.status === "approved").length || 0;
  const pendingBills =
    billsData?.bills?.filter((b) => b.status === "pending_approval").length ||
    0;
  const correctionBills =
    billsData?.bills?.filter((b) => b.status === "correction").length || 0;

  const revenue = revenueData?.data || {};
  const growth = revenue.growth || {};

  return (
    <Layout pageTitle="Dashboard">
      {/* Revenue Cards - 3 New Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <RevenueCard
          title="Overall Total Revenue"
          amount={revenue.overall?.formatted || "₹0"}
          count={billsData?.total || 0}
          icon={DollarSign}
          color="indigo"
        />
        <RevenueCard
          title={`${revenue.thisMonth?.month || "This Month"} Revenue`}
          amount={revenue.thisMonth?.formatted || "₹0"}
          count={revenue.thisMonth?.count || 0}
          month={revenue.thisMonth?.month}
          icon={Calendar}
          color="green"
        />
        <RevenueCard
          title={`${revenue.previousMonth?.month || "Previous Month"} Revenue`}
          amount={revenue.previousMonth?.formatted || "₹0"}
          count={revenue.previousMonth?.count || 0}
          month={revenue.previousMonth?.month}
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Growth Indicator */}
      {growth.percentage && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <GrowthIndicator
              percentage={growth.percentage}
              label={growth.label}
            />
            <span className="text-sm text-gray-500">vs previous month</span>
          </div>
        </div>
      )}

      {/* Existing Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Team Members"
          value={usersData?.total || 0}
          color="blue"
        />
        <StatCard
          icon={LayoutDashboard}
          label="Total Clients"
          value={clientsData?.total || 0}
          color="indigo"
        />
        <StatCard
          icon={AlertTriangle}
          label="Clients Without Bills"
          value={
            clientsWithoutBillsData?.data?.summary?.clientsWithoutBills || 0
          }
          color="red"
          subtext={`${clientsWithoutBillsData?.data?.summary?.percentageWithoutBills || 0}% of total`}
        />
        <StatCard
          icon={FileText}
          label="Total Bills"
          value={billsData?.total || 0}
          color="indigo"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved Bills"
          value={approvedBills}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Pending Approval"
          value={pendingBills}
          color="yellow"
        />
        <StatCard
          icon={AlertCircle}
          label="Correction Bills"
          value={correctionBills}
          color="orange"
        />
      </div>
    </Layout>
  );
};
