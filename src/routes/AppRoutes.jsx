// src/AppRoutes.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../pages/auth/Register";

const AppRoutes = () => {
  console.log("AppRoutes component rendered!");
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
