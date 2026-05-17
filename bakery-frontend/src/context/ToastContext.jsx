import { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4200) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove],
  );

  const showSuccess = useCallback((message) => showToast(message, 'success', 3600), [showToast]);
  const showError = useCallback((message) => showToast(message, 'error', 5200), [showToast]);
  const showInfo = useCallback((message) => showToast(message, 'info', 4000), [showToast]);
  const showWarning = useCallback((message) => showToast(message, 'warning', 4400), [showToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning, dismissToast: remove }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <div key={toast.id} className={`toast-card toast-card--${toast.type}`} role="status">
              <Icon className="toast-card__icon" size={22} strokeWidth={2} aria-hidden />
              <p className="toast-card__text">{toast.message}</p>
              <button type="button" className="toast-card__close" onClick={() => remove(toast.id)} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
