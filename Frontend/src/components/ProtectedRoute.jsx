import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children, role }) => {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role.toUpperCase() !== role.toUpperCase()) {
    // Redirect to their respective dashboard if they have the wrong role
    const normalizedRole = user.role.toUpperCase();
    return <Navigate to={normalizedRole === "ADMIN" ? "/admin" : "/agent"} replace />;
  }

  return children;
};

export default ProtectedRoute;
