import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute() {
  const { isAuthenticated, hydrated } = useAuthStore();

  // Wait until IndexedDB is loaded
  if (!hydrated) return null;

  // Block unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render all nested protected routes
  return <Outlet />;
}
