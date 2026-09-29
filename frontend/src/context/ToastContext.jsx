import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const STYLES = {
  success: { Icon: CheckCircle2, ring: "border-green-300", icon: "text-green-700" },
  error: { Icon: CircleAlert, ring: "border-red-300", icon: "text-danger" },
  info: { Icon: Info, ring: "border-orange-300", icon: "text-orange-700" },
};

// toast.success("Recipe saved")
// toast.success("Recipe deleted", { action: { label: "Undo", onClick: undo } })
// toast.error("Couldn't update. Try again.")
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, opts = {}) => {
      const id = ++counter.current;
      const duration = opts.duration ?? (opts.action ? 7000 : type === "error" ? 5000 : 3200);
      setToasts((all) => [...all.slice(-2), { id, type, message, action: opts.action }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  // Stable identity so pages can safely use `toast` in effect dependencies.
  const toast = useMemo(
    () => ({
      success: (message, opts) => push("success", message, opts),
      error: (message, opts) => push("error", message, opts),
      info: (message, opts) => push("info", message, opts),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed z-[100] inset-x-3 bottom-[calc(80px+env(safe-area-inset-bottom))] lg:inset-x-auto lg:bottom-auto lg:top-4 lg:right-4 lg:w-[380px] flex flex-col gap-2"
      >
        {toasts.map((t) => {
          const { Icon, ring, icon } = STYLES[t.type] || STYLES.info;
          return (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              className={`toast-in pointer-events-auto card !bg-white px-4 py-3 flex items-center gap-3 shadow-lg ${ring}`}
            >
              <Icon size={18} className={`${icon} shrink-0`} aria-hidden="true" />
              <p className="text-[14px] text-ink flex-1">{t.message}</p>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    dismiss(t.id);
                    t.action.onClick();
                  }}
                  className="min-h-11 px-3 -my-2 rounded-xl text-[14px] font-bold text-orange-700 hover:bg-orange-50"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-ink-soft hover:bg-orange-50"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
