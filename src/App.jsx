import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import CreateNewLead from "./pages/sales/CreateNewLead.jsx";
import InterestedFollowUp from "./pages/sales/InterestedFollowUp.jsx";
import HotLead from "./pages/sales/HotLead.jsx";
import ColdLead from "./pages/sales/ColdLead.jsx";
import DetailShare from "./pages/sales/DetailShare.jsx";
import CallBack from "./pages/sales/CallBack.jsx";
import CustomerNoTally from "./pages/sales/CustomerNoTally.jsx";
import NotRelevant from "./pages/sales/NotRelevant.jsx";
import AnotherCompany from "./pages/sales/AnotherCompany.jsx";
import  AllLeads  from "./pages/sales/AllLeads.jsx";
import InternationalLead from "./pages/sales/InternationalLead.jsx";
import DomesticLead from "./pages/sales/DomesticLead.jsx";
import NotInterestedFollowUp from "./pages/sales/NotInterestedFollowUp.jsx";
import NotAnswered from "./pages/sales/NotAnswered.jsx";
import Offline from "./pages/sales/Offline.jsx";
import Invalid from "./pages/sales/Invalid.jsx";
import Other from "./pages/sales/Other.jsx";
import { Spinner } from "./components/ui/Spinner.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { Clients } from "./pages/sales/Clients.jsx";
import { Billing } from "./pages/sales/Billing.jsx";
import { AccountantBilling } from "./pages/accountant/AccountantBilling.jsx";
import { SuperAdminDashboard } from "./pages/superadmin/SuperAdminDashboard.jsx";
import { Users } from "./pages/superadmin/Users.jsx";
import { AllBills } from "./pages/superadmin/AllBills.jsx";
import { AllClients } from "./pages/superadmin/AllClients.jsx";
import { SalesRenewals } from "./pages/sales/SalesRenewals.jsx"; // NEW
import { AdminRenewals } from "./pages/superadmin/AdminRenewals.jsx";
import { ClientsWithoutBills } from "./pages/superadmin/ClientsWithoutBills.jsx";
import { ServerDashboard } from "./pages/serveradmin/ServerDashboard.jsx";
import { Servers } from "./pages/serveradmin/Servers.jsx";
import { ServerAssignments } from "./pages/serveradmin/ServerAssignments.jsx";
import { ExpiringAssignments } from "./pages/serveradmin/ExpiringAssignments.jsx";
import { ProformaInvoice } from "./pages/superadmin/ProformaInvoice.jsx";
import { ServerInfo } from "./pages/superadmin/ServerInfo.jsx";
import { LostClients } from "./pages/LostClients.jsx";
import Reminder from "./pages/sales/Reminder.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "superadmin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "sales") {
      return <Navigate to="/sales/clients" replace />;
    } else if (user.role === "accountant") {
      return <Navigate to="/accountant/billing" replace />;
    } else if (user.role === "server_admin") {
      return <Navigate to="/server/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === "sales" && <Navigate to="/sales/leads" replace />}
            {user?.role === "accountant" && (
              <Navigate to="/accountant/billing" replace />
            )}
            {user?.role === "superadmin" && (
              <Navigate to="/admin/dashboard" replace />
            )}
            {user?.role === "server_admin" && (
              <Navigate to="/server/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* Sales Routes */}
      <Route
        path="/sales/clients"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <Clients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales/billing"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/billing-renewal"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <SalesRenewals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <AllLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/reminder"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <Reminder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/create-new-lead"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <CreateNewLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/new/international"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <InternationalLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/new/domestic"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <DomesticLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/interested-follow-up"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <InterestedFollowUp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/interested-follow-up/hot-lead"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <HotLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/interested-follow-up/cold-lead"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <ColdLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/interested-follow-up/detail-share"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <DetailShare />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/interested-follow-up/call-back"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <CallBack />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/not-interested/customer-no-tally"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <CustomerNoTally />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/not-interested/not-relevant"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <NotRelevant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/not-interested/another-company"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <AnotherCompany />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/connected/not-interested-follow-up"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <NotInterestedFollowUp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/not-connected/not-answered"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <NotAnswered />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/not-connected/offline"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <Offline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/not-connected/invalid"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <Invalid />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/leads/not-connected/other"
        element={
          <ProtectedRoute allowedRoles={["sales", "superadmin"]}>
            <Other />
          </ProtectedRoute>
        }
      />

      {/* Accountant Routes */}
      <Route
        path="/accountant/billing"
        element={
          <ProtectedRoute allowedRoles={["accountant", "superadmin"]}>
            <AccountantBilling />
          </ProtectedRoute>
        }
      />

      {/* SuperAdmin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/proforma-invoice"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <ProformaInvoice />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/server-info"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <ServerInfo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/clients-without-bills"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <ClientsWithoutBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bills"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <AllBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute>
            <AllClients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing-renewal"
        element={
          <ProtectedRoute allowedRoles={["superadmin", "accountant"]}>
            <AdminRenewals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-clients"
        element={
          <ProtectedRoute>
            <LostClients />
          </ProtectedRoute>
        }
      />

      {/*  Server Admin Routes */}
      <Route
        path="/server/dashboard"
        element={
          <ProtectedRoute allowedRoles={["server_admin", "superadmin"]}>
            <ServerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/server/servers"
        element={
          <ProtectedRoute allowedRoles={["server_admin", "superadmin"]}>
            <Servers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/server/assignments"
        element={
          <ProtectedRoute allowedRoles={["server_admin", "superadmin"]}>
            <ServerAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/server/expiring"
        element={
          <ProtectedRoute allowedRoles={["server_admin", "superadmin"]}>
            <ExpiringAssignments />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
