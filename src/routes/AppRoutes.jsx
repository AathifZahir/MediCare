// src/AppRoutes.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//ProtectedRoute
import ProtectedRoute from "../components/ProtectedRoute";

//Patient
import Register from "../pages/client/auth/Register";
import Login from "../pages/client/auth/Login";
import PaymentGateway from "../pages/client/PaymentGateway";
import Home from "../pages/client/Home";
import Profile from "../pages/client/Profile";
import ViewReport from "../pages/client/ViewReport";
import MyAppointments from "../pages/client/MyAppointments";
import ServicesPage from "../pages/client/Services";

//Admin
import AdminRegister from "../pages/admin/auth/Register";
import AdminLogin from "../pages/admin/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import Transactions from "../pages/admin/Transactions";
import ViewAdminReport from "../pages/admin/ViewAdminReport";
import ViewProfile from "../pages/admin/ViewProfile";
import AdminAppointment from "../pages/admin/AdminAppointment";
import AddReport from "../pages/admin/AddReport";
import ReportHome from "../pages/admin/ReportHome";
import EditReport from "../pages/admin/EditReport";
import Hospital from "../pages/admin/Hospital";
import Scan from "../pages/admin/Scan";

const AppRoutes = () => {
  console.log("AppRoutes component rendered!");
  return (
    <Router>
      <Routes>
        {/* Patient routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/Profile"
          element={
            <ProtectedRoute allowedRoles={["patient"]} loginRedirect="/login">
              <Profile />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/MyAppointments"
          element={
            <ProtectedRoute allowedRoles={["patient"]} loginRedirect="/login">
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route path="/Services" element={<ServicesPage />} />
        <Route
          path="/payment-gateway"
          element={
            <ProtectedRoute allowedRoles={["patient"]} loginRedirect="/login">
              <PaymentGateway />
            </ProtectedRoute>
          }
        />
        <Route path="/ViewReport" element={<ViewReport />} />

        {/* Admin routes */}
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/ViewProfile"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <ViewProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hospital"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              loginRedirect="/admin/login"
            >
              <Hospital />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <AdminAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/add/:customerId" // Updated to include :customerId as a route parameter
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <AddReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/edit/:customerId/:reportId" // reportId added here
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <EditReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/report" // reportId added here
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <ReportHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/view/:customerId/:reportId" // reportId added here
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <ViewAdminReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/scan" // reportId added here
          element={
            <ProtectedRoute
              allowedRoles={["admin", "staff", "doctor"]}
              loginRedirect="/admin/login"
            >
              <Scan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
