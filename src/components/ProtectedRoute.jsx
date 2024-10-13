// src/components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import auth from "../firebase/auth"; // Import your Firebase configuration
import getUserRole from "../utils/getUserRole";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch the user role from your Firestore or any other source
        const userRole = await getUserRole(user.uid); // Implement this function
        setUserRole(userRole);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // If loading, return null or a loading indicator
  if (loading) {
    return <p>Loading...</p>; // Replace with your loading component
  }

  // If the user role is not in the allowed roles, redirect to login
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
