import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Server,
  XCircle,
  Hourglass,
  AlertTriangle,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { getExpiringAssignments } from "../../api/servers.api";
import { Spinner } from "../../components/ui/Spinner";
import { Badge } from "../../components/ui/Badge";

export const ExpiringAssignments = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["expiringAssignments"],
    queryFn: () => getExpiringAssignments(7),
  });

  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (days) => {
    if (days <= 2) return "bg-red-100 text-red-800";
    if (days <= 5) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const AssignmentCard = ({ assignment, isExpired }) => {
    const daysLeft = getDaysLeft(assignment.validityEnd);
    const daysAgo = Math.abs(daysLeft);
    return (
      <div
        className={`bg-white rounded-xl shadow-sm p-6 border transition-shadow hover:shadow-md ${
          isExpired
            ? "border-red-200 hover:border-red-300"
            : "border-gray-100 hover:border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">
              {assignment.client?.companyName}
            </h4>
            <p className="text-sm text-gray-500">
              {assignment.client?.representativeName}
            </p>
          </div>
          {isExpired ? (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {daysAgo === 0 ? "Expired today" : `${daysAgo}d ago`}
            </div>
          ) : (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                daysLeft,
              )}`}
            >
              {daysLeft} days left
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Server className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{assignment.server?.name}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              {assignment.server?.ipAddress}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Badge
              variant={
                assignment.serverType === "dedicated" ? "indigo" : "blue"
              }
              label={assignment.serverType.toUpperCase()}
            />
            {assignment.sharedUsers > 0 && (
              <span className="text-gray-500">
                + {assignment.sharedUsers} users
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Valid until:{" "}
              {new Date(assignment.validityEnd).toLocaleDateString()}
            </span>
          </div>

          {assignment.windowsKeyLastDigits && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Windows Key: *****-{assignment.windowsKeyLastDigits}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => (window.location.href = `/server/assignments`)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Manage Assignment →
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout pageTitle="Expiring Assignments">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  const upcoming = data?.upcomingExpiring || [];
  const expired = data?.alreadyExpired || [];
  const allCount = upcoming.length + expired.length;

  return (
    <Layout pageTitle="Expiring Assignments">
      <div className="p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Expiring / Expired Server
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="orange"
              label={`${upcoming.length} expiring soon`}
            />
            <Badge variant="red" label={`${expired.length} expired`} />
            <Badge variant="gray" label={`${allCount} total`} />
          </div>
        </div>

        {allCount === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              All caught up!
            </h3>
            <p className="text-gray-500 mt-2">
              No Server expiring soon and no expired Server found
            </p>
          </div>
        ) : (
          <>
            {expired.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-700 flex items-center gap-2">
                      Already Expired
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expired.map((a) => (
                    <AssignmentCard
                      key={a._id}
                      assignment={a}
                      isExpired={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Hourglass className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-700 flex items-center gap-2">
                      Expiring Soon
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((a) => (
                    <AssignmentCard
                      key={a._id}
                      assignment={a}
                      isExpired={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
