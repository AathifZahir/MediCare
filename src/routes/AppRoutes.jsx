// src/AppRoutes.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../pages/client/auth/Register";
import Login from "../pages/client/auth/Login";
import AdminRegister from "../pages/admin/auth/Register";
import AdminLogin from "../pages/admin/auth/Login";

const AppRoutes = () => {
  console.log("AppRoutes component rendered!");
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
