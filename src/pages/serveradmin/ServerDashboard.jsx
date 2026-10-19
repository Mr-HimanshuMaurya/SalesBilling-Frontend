import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Cpu,
  Database,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import {
  getServers,
  getAssignments,
  getExpiringAssignments,
} from "../../api/servers.api";
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
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
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

export const ServerDashboard = () => {
  const [serverStats, setServerStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
  });
  const [assignmentStats, setAssignmentStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0,
  });

  const { data: serversData, isLoading: serversLoading } = useQuery({
    queryKey: ["servers"],
    queryFn: () => getServers({ limit: 100 }),
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["serverAssignments"],
    queryFn: () => getAssignments({ limit: 100 }),
  });

  const { data: expiringData, isLoading: expiringLoading } = useQuery({
    queryKey: ["expiringAssignments"],
    queryFn: () => getExpiringAssignments(7),
  });

  useEffect(() => {
    if (serversData?.servers) {
      const servers = serversData.servers;
      setServerStats({
        total: servers.length,
        active: servers.filter((s) => s.status === "active").length,
        maintenance: servers.filter((s) => s.status === "maintenance").length,
        inactive: servers.filter(
          (s) => s.status === "inactive" || s.status === "pending",
        ).length,
      });
    }
  }, [serversData]);

  useEffect(() => {
    if (assignmentsData?.assignments) {
      const assignments = assignmentsData.assignments;
      setAssignmentStats({
        total: assignments.length,
        active: assignments.filter((a) => a.status === "active").length,
        expired: assignments.filter((a) => a.status === "expired").length,
        expiringSoon: expiringData?.count || 0,
      });
    }
  }, [assignmentsData, expiringData]);

  const isLoading = serversLoading || assignmentsLoading || expiringLoading;

  if (isLoading) {
    return (
      <Layout pageTitle="Server Dashboard">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Server Dashboard">
      <div className="p-6 space-y-6">
        {/* Server Stats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            Server Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={Server}
              label="Total Servers"
              value={serverStats.total}
              color="indigo"
            />
            <StatCard
              icon={CheckCircle}
              label="Active"
              value={serverStats.active}
              color="green"
            />
            <StatCard
              icon={Activity}
              label="Maintenance"
              value={serverStats.maintenance}
              color="yellow"
            />
            <StatCard
              icon={AlertCircle}
              label="Inactive"
              value={serverStats.inactive}
              color="red"
            />
          </div>
        </div>

        {/* Assignment Stats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Client Assignments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Assignments"
              value={assignmentStats.total}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="Active"
              value={assignmentStats.active}
              color="green"
            />
            <StatCard
              icon={Clock}
              label="Expiring Soon (7 days)"
              value={assignmentStats.expiringSoon}
              color="orange"
            />
            {/* <StatCard
              icon={AlertCircle}
              label="Expired"
              value={assignmentStats.expired}
              color="red"
            /> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};
