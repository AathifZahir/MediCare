import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import auth from "../firebase/auth";
import getUserRole from "../utils/getUserRole";

const ProtectedRoute = ({ children, allowedRoles, loginRedirect }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch the user role from your Firestore or any other source
        const userRole = await getUserRole(user.uid);
        setUserRole(userRole);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // If loading, return a loading indicator
  if (loading) {
    return <p>Loading...</p>;
  }

  // If the user role is not in the allowed roles, redirect to the appropriate login page
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={loginRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
