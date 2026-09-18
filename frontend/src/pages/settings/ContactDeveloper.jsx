import { useState } from "react";
import toast from "react-hot-toast";
import { contactDeveloper } from "../../api/feedback.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

export default function ContactDeveloper() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullname: user?.name || "",
    address: "",
    contactno: "",
    email: user?.email || "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactDeveloper({
        fullname: form.fullname.trim(),
        address: form.address.trim(),
        contactno: form.contactno.trim(),
        email: form.email.trim(),
        reason: form.reason.trim(),
      });
      toast.success("Form submitted successfully and email sent");
      setForm((f) => ({ ...f, address: "", contactno: "", reason: "" }));
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't send your message."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Contact the Developer</h2>
        <p className="mt-1 text-sm text-muted">Questions, ideas or collaboration — drop a message.</p>
      </div>

      <FormField label="Full name">
        <input required value={form.fullname} onChange={update("fullname")} className={inputClass} placeholder="Your full name" />
      </FormField>

      <FormField label="Address">
        <input required value={form.address} onChange={update("address")} className={inputClass} placeholder="City, State" />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Contact number">
          <input required value={form.contactno} onChange={update("contactno")} className={inputClass} placeholder="9876543210" />
        </FormField>
        <FormField label="Email">
          <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@email.com" />
        </FormField>
      </div>

      <FormField label="Reason">
        <textarea required value={form.reason} onChange={update("reason")} rows={5} maxLength={2000} className={inputClass} placeholder="What's on your mind?" />
      </FormField>

      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
