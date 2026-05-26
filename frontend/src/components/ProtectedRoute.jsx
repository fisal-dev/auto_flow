import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute
 *
 * @param {string[]} roles  - Optional array of allowed roles. If empty/omitted, any logged-in user can access.
 * @param {React.ReactNode} children
 *
 * Behaviour:
 *  - Not logged in  → redirect to /login (with return path saved)
 *  - Logged in, wrong role → redirect to /dashboard
 *  - Logged in, correct role → render children
 */
const ProtectedRoute = ({ roles = [], children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "";

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
