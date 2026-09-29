import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./States";

function CheckingSession() {
  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center">
      <LoadingState label="Checking your session..." />
    </div>
  );
}

// Requires a session the backend has verified (not just localStorage).
export function ProtectedRoute() {
  const { isAuthenticated, isChecking } = useAuth();
  const location = useLocation();

  if (isChecking) return <CheckingSession />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// Mirrors the backend's verifyAdmin (role === "chef"). The backend still
// enforces it; this only avoids showing a page that would 403.
export function ChefRoute() {
  const { isChef } = useAuth();
  if (!isChef) return <Navigate to="/home" replace />;
  return <Outlet />;
}

// For /login: already-authenticated users go where they were headed (or /home).
export function GuestRoute() {
  const { isAuthenticated, isChecking } = useAuth();
  const location = useLocation();

  if (isChecking) return <CheckingSession />;
  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/home"} replace />;
  }
  return <Outlet />;
}
