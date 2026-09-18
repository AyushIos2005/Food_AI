import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { changePassword } from "../../api/auth.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

export default function Security() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(form);
      toast.success("Password changed successfully");
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't change your password."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Change Password</h2>
        <FormField label="Current password">
          <input required type="password" value={form.oldPassword} onChange={update("oldPassword")} className={inputClass} placeholder="••••••••" />
        </FormField>
        <FormField label="New password">
          <input required type="password" value={form.newPassword} onChange={update("newPassword")} className={inputClass} placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm new password">
          <input required type="password" value={form.confirmNewPassword} onChange={update("confirmNewPassword")} className={inputClass} placeholder="••••••••" />
        </FormField>
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Updating..." : "Change Password"}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Session</h2>
        <p className="mt-1 text-sm text-muted">Sign out of FoodAI on this device.</p>
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 rounded-full border border-danger/30 px-5 py-2.5 text-sm font-semibold text-danger transition-all duration-200 hover:bg-danger/5"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );
}
