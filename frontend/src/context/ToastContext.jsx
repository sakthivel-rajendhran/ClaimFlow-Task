import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, type, title, message }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const success = useCallback((title, message) => toast({ type: 'success', title, message }), [toast])
  const error = useCallback((title, message) => toast({ type: 'error', title, message, duration: 6000 }), [toast])
  const info = useCallback((title, message) => toast({ type: 'info', title, message }), [toast])
  const warning = useCallback((title, message) => toast({ type: 'warning', title, message }), [toast])

  const icons = {
    success: <CheckCircle size={18} color="var(--success)" />,
    error: <XCircle size={18} color="var(--danger)" />,
    info: <Info size={18} color="var(--info)" />,
    warning: <AlertTriangle size={18} color="var(--warning)" />,
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <span className="toast-icon">{icons[t.type]}</span>
            <div style={{ flex: 1 }}>
              <div className="toast-message">{t.title}</div>
              {t.message && <div className="toast-subtitle">{t.message}</div>}
            </div>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
