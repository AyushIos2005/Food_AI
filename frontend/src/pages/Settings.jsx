import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { usePreferences, DIET_OPTIONS, CUISINE_OPTIONS } from "../utils/preferences";
import { Chip, ChipGroup } from "../components/ui/Chip";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/auth";
import { submitComplaint, contactDeveloper, giveFeedback } from "../api/feedback";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const { logout, user, isChef } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
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

  const [busy, setBusy] = useState(null); // key of the form being submitted

  // One place for: duplicate-submit guard, backend error toast, success toast.
  // `onSuccess` (form reset) only runs when the request succeeded.
  const submitForm = async (key, request, fallbackMessage, onSuccess) => {
    if (busy) return;
    setBusy(key);
    try {
      const res = await request();
      toast.success(res?.message || fallbackMessage);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const runChangePassword = (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) return toast.error("New password must be at least 6 characters.");
    if (pwForm.newPassword !== pwForm.confirmNewPassword) return toast.error("New passwords do not match.");
    return submitForm("password", () => changePassword(pwForm), "Password updated", () =>
      setPwForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" })
    );
  };

  const runComplaint = (e) => {
    e.preventDefault();
    return submitForm("complaint", () => submitComplaint(complaintText.trim()), "Complaint submitted", () =>
      setComplaintText("")
    );
  };

  const runFeedback = () => submitForm("feedback", () => giveFeedback(rating), "Thanks for the feedback");

  const runContact = (e) => {
    e.preventDefault();
    return submitForm(
      "contact",
      () => contactDeveloper({ ...contact, contactno: String(contact.contactno).trim() }),
      "Message sent",
      () => setContact((c) => ({ ...c, reason: "" }))
    );
  };

  const doLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const { prefs, setPrefs } = usePreferences();
  const togglePref = (key) => setPrefs(prefs.includes(key) ? prefs.filter((k) => k !== key) : [...prefs, key]);

  const items = [
    { key: "preferences", label: "Food Preferences" },
    { key: "password", label: "Change Password" },
    { key: "feedback", label: "Give Feedback" },
    // Backend: /feedback/complain is users-only (chefs get 403).
    ...(isChef ? [] : [{ key: "complaint", label: "Report a Complaint" }]),
    { key: "contact", label: "Contact Developer" },
  ];

  return (
    <div className="max-w-xl space-y-3">
      {items.map((item) => (
        <div key={item.key}>
          <button
            onClick={() => setOpen(open === item.key ? null : item.key)}
            className="card w-full flex items-center justify-between px-4 py-4 text-left"
          >
            <span className="text-[14px] font-medium text-ink">{item.label}</span>
            <ChevronRight size={16} className="text-ink-soft/40" />
          </button>

          {open === "preferences" && item.key === "preferences" && (
            <div className="card p-4 mt-2 flex flex-col gap-4">
              <ChipGroup label="Diet and style preferences">
                {DIET_OPTIONS.map((o) => (
                  <Chip key={o.key} selected={prefs.includes(o.key)} onClick={() => togglePref(o.key)}>
                    {o.label}
                  </Chip>
                ))}
              </ChipGroup>
              <ChipGroup label="Cuisine preferences">
                {CUISINE_OPTIONS.map((o) => (
                  <Chip key={o.key} selected={prefs.includes(o.key)} onClick={() => togglePref(o.key)}>
                    {o.label}
                  </Chip>
                ))}
              </ChipGroup>
              <p className="text-[13px] text-ink-soft">Saved automatically.</p>
            </div>
          )}

          {open === "password" && item.key === "password" && (
            <form onSubmit={runChangePassword} className="card p-4 mt-2 flex flex-col gap-2">
              <input className="input-field" type="password" placeholder="Current password" value={pwForm.oldPassword} onChange={(e) => setPwForm((f) => ({ ...f, oldPassword: e.target.value }))} required />
              <input className="input-field" type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required />
              <input className="input-field" type="password" placeholder="Confirm new password" value={pwForm.confirmNewPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmNewPassword: e.target.value }))} required />
              <button className="btn-primary" disabled={busy === "password"}>{busy === "password" ? "Updating..." : "Update Password"}</button>
            </form>
          )}

          {open === "feedback" && item.key === "feedback" && (
            <div className="card p-4 mt-2 flex flex-col gap-3">
              <p className="text-[13px] text-ink-soft">How is FOODAI treating you?</p>
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
              <button className="btn-primary" onClick={runFeedback} disabled={busy === "feedback"}>{busy === "feedback" ? "Sending..." : "Submit Feedback"}</button>
            </div>
          )}

          {open === "complaint" && item.key === "complaint" && (
            <form onSubmit={runComplaint} className="card p-4 mt-2 flex flex-col gap-2">
              <textarea className="input-field min-h-[90px] resize-none" placeholder="Describe your issue..." value={complaintText} onChange={(e) => setComplaintText(e.target.value)} required />
              <button className="btn-primary" disabled={busy === "complaint"}>{busy === "complaint" ? "Sending..." : "Submit Complaint"}</button>
            </form>
          )}

          {open === "contact" && item.key === "contact" && (
            <form onSubmit={runContact} className="card p-4 mt-2 flex flex-col gap-2">
              <input className="input-field" placeholder="Full name" value={contact.fullname} onChange={(e) => setContact((c) => ({ ...c, fullname: e.target.value }))} required />
              <input className="input-field" placeholder="Address" value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} required />
              <input className="input-field" placeholder="Contact number" value={contact.contactno} onChange={(e) => setContact((c) => ({ ...c, contactno: e.target.value }))} required />
              <input className="input-field" type="email" placeholder="Email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} required />
              <textarea className="input-field min-h-[90px] resize-none" placeholder="Reason" value={contact.reason} onChange={(e) => setContact((c) => ({ ...c, reason: e.target.value }))} required />
              <button className="btn-primary" disabled={busy === "contact"}>{busy === "contact" ? "Sending..." : "Send message"}</button>
            </form>
          )}
        </div>
      ))}

      <button onClick={doLogout} className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 text-[14px] font-medium bg-white">
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
