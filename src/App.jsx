import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/CustomerDetail';
import JobDetail from '@/pages/JobDetail';
import Estimate from '@/pages/Estimate';
import Invoice from '@/pages/Invoice';
import Templates from '@/pages/Templates';
import Inventory from '@/pages/Inventory';
import StaffTasks from '@/pages/StaffTasks';
import Reminders from '@/pages/Reminders';
import Sales from '@/pages/Sales';
import Reports from '@/pages/Reports';
import EmployeeEarningsDetail from '@/pages/EmployeeEarningsDetail';
import ReportStatement from '@/pages/ReportStatement';
import PartHistory from '@/pages/PartHistory';
import Staff from '@/pages/Staff';
import StaffDetail from '@/pages/StaffDetail';
import SaleDetail from '@/pages/SaleDetail';
import Units from '@/pages/Units';
import UnitDetail from '@/pages/UnitDetail';
import ClockPortal from '@/pages/ClockPortal';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import RootGate from '@/components/RootGate';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import Pricing from '@/pages/Pricing';
import Billing from '@/pages/Billing';
import BetaAccess from '@/pages/BetaAccess';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      <Route path="/" element={<RootGate />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/board" element={<Home />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/estimate" element={<Estimate />} />
          <Route path="/jobs/:id/invoice" element={<Invoice />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/staff-tasks" element={<StaffTasks />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/employee-earnings" element={<EmployeeEarningsDetail />} />
          <Route path="/reports/statement/:type" element={<ReportStatement />} />
          <Route path="/reports/part-history" element={<PartHistory />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/:id" element={<StaffDetail />} />
          <Route path="/sales/:id" element={<SaleDetail />} />
          <Route path="/units" element={<Units />} />
          <Route path="/units/:id" element={<UnitDetail />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/beta-access" element={<BetaAccess />} />
        </Route>
        <Route path="/clock" element={<ClockPortal />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App