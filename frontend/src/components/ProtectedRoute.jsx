import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/admin/login" replace state={{ error: "no_access" }} />;

  return children;
}
