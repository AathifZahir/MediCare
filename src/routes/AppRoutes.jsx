// src/AppRoutes.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Patient
import Register from "../pages/client/auth/Register";
import Login from "../pages/client/auth/Login";
import PaymentGateway from "../pages/client/PaymentGateway";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/client/Home";
import Appointment from "../pages/client/Appointment";
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
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/appointments" element={<Appointment />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/MyAppointments" element={<MyAppointments />} />
        <Route path="/Services" element={<ServicesPage />} />

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
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <AdminAppointment />
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

        <Route
          path="/admin/reports/view/:customerId/:reportId" // reportId added here
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <ViewAdminReport />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/scan" // reportId added here
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
              <Scan />
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
