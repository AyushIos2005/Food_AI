import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const toast = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2 w-[min(92vw,360px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`card px-4 py-3 flex items-start gap-3 shadow-lg ${
              t.type === "success" ? "border-green-200" : "border-red-200"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            )}
            <p className="text-[13px] text-ink flex-1">{t.message}</p>
            <button onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}>
              <X size={14} className="text-ink-soft/50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
