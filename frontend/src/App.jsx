import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import PreferenceSetup from "./pages/PreferenceSetup";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import RandomDish from "./pages/RandomDish";
import DishDetail from "./pages/DishDetail";
import FoodCommunity from "./pages/FoodCommunity";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import AiHub from "./pages/AiHub";
import AiCreate from "./pages/AiCreate";
import AiResult from "./pages/AiResult";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/preferences" element={<PreferenceSetup />} />
                  <Route element={<AppLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/recipes" element={<Explore />} />
                    <Route path="/explore" element={<Navigate to="/recipes" replace />} />
                    <Route path="/random" element={<RandomDish />} />
                    <Route path="/dish/:id" element={<DishDetail />} />
                    <Route path="/community" element={<FoodCommunity />} />
                    <Route path="/community/create" element={<CreatePost />} />
                    <Route path="/create" element={<Navigate to="/community/create" replace />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<EditProfile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/ai" element={<AiHub />} />
                    <Route path="/ai/create" element={<AiCreate />} />
                    <Route path="/ai/result" element={<AiResult />} />
                    <Route path="/ai-chef" element={<Navigate to="/ai" replace />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
