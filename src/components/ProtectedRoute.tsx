import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  // Simple implementation - just renders children
  // In a full implementation, this would check authentication and roles
  return <>{children}</>;
};

