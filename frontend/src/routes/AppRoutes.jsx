import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";
import AppShell from "../components/AppShell";

import Landing from "../pages/auth/Landing";
import Register from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOtp";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Home from "../pages/home/Home";

import AiHub from "../pages/ai/AiHub";
import CreateAiRecipe from "../pages/ai/CreateAiRecipe";
import AiResult from "../pages/ai/AiResult";
import AiHistory from "../pages/ai/AiHistory";
import RecreateFood from "../pages/ai/RecreateFood";
import RecreateResult from "../pages/ai/RecreateResult";
import RecreatedHistory from "../pages/ai/RecreatedHistory";

import RecipeExplorer from "../pages/food/RecipeExplorer";
import RecipeDetails from "../pages/food/RecipeDetails";
import ChefCreateRecipe from "../pages/food/ChefCreateRecipe";
import ChefManageRecipes from "../pages/food/ChefManageRecipes";

import CommunityFeed from "../pages/blog/CommunityFeed";
import PostDetails from "../pages/blog/PostDetails";
import CreateBlogPost from "../pages/blog/CreateBlogPost";
import HashtagPage from "../pages/blog/HashtagPage";
import SavedPosts from "../pages/blog/SavedPosts";

import Notifications from "../pages/notifications/Notifications";

import Profile from "../pages/profile/Profile";
import CreateProfile from "../pages/profile/CreateProfile";
import EditProfile from "../pages/profile/EditProfile";

import SettingsLayout from "../pages/settings/SettingsLayout";
import Security from "../pages/settings/Security";
import Feedback from "../pages/settings/Feedback";
import Complaint from "../pages/settings/Complaint";
import ContactDeveloper from "../pages/settings/ContactDeveloper";

import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/home" element={<Home />} />

          <Route path="/ai" element={<AiHub />} />
          <Route path="/ai/create" element={<CreateAiRecipe />} />
          <Route path="/ai/result" element={<AiResult />} />
          <Route path="/ai/history" element={<AiHistory />} />
          <Route path="/ai/recreate" element={<RecreateFood />} />
          <Route path="/ai/recreate/result" element={<RecreateResult />} />
          <Route path="/ai/recreated" element={<RecreatedHistory />} />

          <Route path="/recipes" element={<RecipeExplorer />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />

          {/* Chef only */}
          <Route element={<RoleRoute role="chef" />}>
            <Route path="/chef/recipes" element={<ChefManageRecipes />} />
            <Route path="/chef/recipes/create" element={<ChefCreateRecipe />} />
          </Route>

          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/community/create" element={<CreateBlogPost />} />
          <Route path="/community/post/:id" element={<PostDetails />} />
          <Route path="/hashtag/:tag" element={<HashtagPage />} />
          <Route path="/saved" element={<SavedPosts />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/create" element={<CreateProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/settings/security" replace />} />
            <Route path="security" element={<Security />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="complaint" element={<Complaint />} />
            <Route path="contact-developer" element={<ContactDeveloper />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
