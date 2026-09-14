export default function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-md card p-5 sm:p-6">
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="text-[14px] text-ink-soft mt-2">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 mt-5">
          <button type="button" className="btn-outline flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn-primary flex-1 bg-red-500" onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
