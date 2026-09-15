import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, Lock, MessageSquare, Flag, Mail, Sun, Moon, Monitor, Languages } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/auth";
import { submitComplaint, contactDeveloper, giveFeedback } from "../api/feedback";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage, SUPPORTED_LANGUAGES } from "../context/LanguageContext";

const THEME_OPTIONS = [
  { value: "light", icon: Sun, key: "theme_light", label: "Light" },
  { value: "dark", icon: Moon, key: "theme_dark", label: "Dark" },
  { value: "system", icon: Monitor, key: "theme_system", label: "System" },
];

export default function Settings() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(null);

  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [complaintText, setComplaintText] = useState("");
  const [rating, setRating] = useState(5);
  const [contact, setContact] = useState({
    fullname: user?.name || "",
    address: "",
    contactno: "",
    email: user?.email || "",
    reason: "",
  });

  const runChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await changePassword(pwForm);
      toast.success(res.message || "Password updated");
      setPwForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const runComplaint = async (e) => {
    e.preventDefault();
    try {
      const res = await submitComplaint(complaintText);
      toast.success(res.message || "Complaint submitted");
      setComplaintText("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const runFeedback = async () => {
    try {
      const res = await giveFeedback(rating);
      toast.success(res.message || "Thanks for the feedback");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const runContact = async (e) => {
    e.preventDefault();
    try {
      const res = await contactDeveloper(contact);
      toast.success(res.message || "Message sent");
      setContact((c) => ({ ...c, reason: "" }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  const items = [
    { key: "password", label: t("settings_password", "Change Password"), icon: Lock },
    { key: "feedback", label: t("settings_feedback", "Give Feedback"), icon: MessageSquare },
    { key: "complaint", label: t("settings_complaint", "Report a Complaint"), icon: Flag },
    { key: "contact", label: t("settings_contact", "Contact Developer"), icon: Mail },
  ];

  return (
    <div className="max-w-xl">
      <div className="card flex items-center gap-4 p-5 mb-6">
        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600">
          {(user?.name || user?.username || "U")[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-display text-lg text-ink">{user?.name || "Foodie"}</p>
          <p className="text-[13px] text-ink-soft">@{user?.username}</p>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <p className="text-[13px] font-bold text-ink mb-3">{t("settings_preferences", "Preferences")}</p>

        <p className="text-[12px] text-ink-soft mb-2">{t("settings_theme", "Theme")}</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-[12px] font-medium transition ${
                theme === opt.value
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-(--color-line) text-ink-soft hover:border-orange-200"
              }`}
            >
              <opt.icon size={17} />
              {t(opt.key, opt.label)}
            </button>
          ))}
        </div>

        <p className="text-[12px] text-ink-soft mb-2 flex items-center gap-1.5">
          <Languages size={13} /> {t("settings_language", "Language")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`py-3 rounded-2xl border text-[13px] font-medium transition ${
                language === lang.code
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-(--color-line) text-ink-soft hover:border-orange-200"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key}>
          <button
            onClick={() => setOpen(open === item.key ? null : item.key)}
            className="card w-full flex items-center gap-3.5 px-4 py-4 text-left"
          >
            <span className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <item.icon size={17} />
            </span>
            <span className="text-[14px] font-medium text-ink flex-1">{item.label}</span>
            <ChevronRight size={16} className="text-ink-soft/40" />
          </button>

          {open === "password" && item.key === "password" && (
            <form onSubmit={runChangePassword} className="card p-4 mt-2 flex flex-col gap-2">
              <input className="input-field" type="password" placeholder="Current password" value={pwForm.oldPassword} onChange={(e) => setPwForm((f) => ({ ...f, oldPassword: e.target.value }))} required />
              <input className="input-field" type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required />
              <input className="input-field" type="password" placeholder="Confirm new password" value={pwForm.confirmNewPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmNewPassword: e.target.value }))} required />
              <button className="btn-primary">Update Password</button>
            </form>
          )}

          {open === "feedback" && item.key === "feedback" && (
            <div className="card p-4 mt-2 flex flex-col gap-3">
              <p className="text-[13px] text-ink-soft">How is FoodMenu treating you?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-full text-[13px] font-semibold ${
                      rating >= n ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-400"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button className="btn-primary" onClick={runFeedback}>Submit Feedback</button>
            </div>
          )}

          {open === "complaint" && item.key === "complaint" && (
            <form onSubmit={runComplaint} className="card p-4 mt-2 flex flex-col gap-2">
              <textarea className="input-field min-h-[90px] resize-none" placeholder="Describe your issue..." value={complaintText} onChange={(e) => setComplaintText(e.target.value)} required />
              <button className="btn-primary">Submit Complaint</button>
            </form>
          )}

          {open === "contact" && item.key === "contact" && (
            <form onSubmit={runContact} className="card p-4 mt-2 flex flex-col gap-2">
              <input className="input-field" placeholder="Full name" value={contact.fullname} onChange={(e) => setContact((c) => ({ ...c, fullname: e.target.value }))} required />
              <input className="input-field" placeholder="Address" value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} />
              <input className="input-field" placeholder="Contact number" value={contact.contactno} onChange={(e) => setContact((c) => ({ ...c, contactno: e.target.value }))} />
              <input className="input-field" type="email" placeholder="Email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} required />
              <textarea className="input-field min-h-[90px] resize-none" placeholder="Reason" value={contact.reason} onChange={(e) => setContact((c) => ({ ...c, reason: e.target.value }))} required />
              <button className="btn-primary">Send message</button>
            </form>
          )}
        </div>
      ))}
      </div>

      <button onClick={doLogout} className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 text-[14px] font-medium bg-(--color-surface)">
        <LogOut size={16} /> {t("nav_logout", "Logout")}
      </button>
    </div>
  );
}
