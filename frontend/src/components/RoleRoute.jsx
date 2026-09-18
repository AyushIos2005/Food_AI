import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ role = "chef" }) {
  const { user } = useAuth();

  if (user?.role !== role) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
