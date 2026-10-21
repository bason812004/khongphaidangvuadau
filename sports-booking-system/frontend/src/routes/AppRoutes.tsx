import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { EnterpriseAdminPortalPage } from "../pages/admin/EnterpriseAdminPortalPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main Enterprise Admin Portal Route (Protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin-portal" element={<EnterpriseAdminPortalPage />} />
        <Route path="/admin/portal" element={<EnterpriseAdminPortalPage />} />
        <Route path="/enterprise-portal" element={<EnterpriseAdminPortalPage />} />
      </Route>

      {/* Default Fallback: Redirect to /admin-portal */}
      <Route path="/" element={<Navigate to="/admin-portal" replace />} />
      <Route path="*" element={<Navigate to="/admin-portal" replace />} />
    </Routes>
  );
}
