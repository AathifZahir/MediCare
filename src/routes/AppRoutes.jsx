// src/AppRoutes.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../pages/client/auth/Register";
import Login from "../pages/client/auth/Login";
import AdminRegister from "../pages/admin/auth/Register";
import AdminLogin from "../pages/admin/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import PaymentGateway from "../pages/client/PaymentGateway";
import Transactions from "../pages/admin/Transactions";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/client/Home";
import Appointment from "../pages/client/Appointment";
import Hospital from "../pages/admin/Hospital";
import Profile from "../pages/client/Profile";
import ViewProfile from "../pages/admin/ViewProfile";
import AdminAppointment from "../pages/admin/AdminAppointment";
import AddReport from "../pages/admin/AddReport";
import ReportHome from "../pages/admin/ReportHome";
import EditReport from "../pages/admin/EditReport";
import ViewReport from "../pages/client/ViewReport";

const AppRoutes = () => {
  console.log("AppRoutes component rendered!");
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/appointments" element={<Appointment />} />
        <Route path="/Profile" element={<Profile />} />

        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/ViewProfile" element={<ViewProfile />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hospital"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Hospital />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports/add/:customerId" // Updated to include :customerId as a route parameter
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <AddReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports/edit/:customerId/:reportId" // reportId added here
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <EditReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/report" // reportId added here
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <ReportHome />
            </ProtectedRoute>
          }
        />

        <Route path="/payment-gateway" element={<PaymentGateway />} />

        <Route path="/ViewReport" element={<ViewReport />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
