import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  AlertCircle,
  Search,
  Building2,
  User,
  Calendar,
  XCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { getClientsWithoutBills } from "../../api/clients.api";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "react-hot-toast";

export const ClientsWithoutBills = () => {
  const [clients, setClients] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClientsWithoutBills();
  }, []);

  const fetchClientsWithoutBills = async () => {
    try {
      setLoading(true);
      const response = await getClientsWithoutBills();
      setClients(response.data.clients);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients without bills");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      client.companyName?.toLowerCase().includes(search) ||
      client.representativeName?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search) ||
      client.phone?.includes(search)
    );
  });

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Layout pageTitle="Clients Without Bills">
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalClients || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">With Bills</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.clientsWithBills || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Without Bills</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.clientsWithoutBills || 0}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Percentage</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.percentageWithoutBills || 0}%
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredClients.length} clients found
            </div>
          </div>
        </div>

        {/* Clients Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              All Clients Have Bills!
            </h3>
            <p className="text-gray-500 mt-2">
              Great job! Every client has at least one bill created.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {client.companyName}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <User className="w-3 h-3" />
                              {client.representativeName || "N/A"}
                            </div>
                            {client.gstNumber && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                GST: {client.gstNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {client.email || "N/A"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {client.phone || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.createdBy?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(client.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
