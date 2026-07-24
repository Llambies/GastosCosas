import { AnimatePresence, motion } from "motion/react";

export interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface Props {
  toast: ToastState | null;
  onDismiss: () => void;
}

export function ToastHost({ toast, onDismiss }: Props) {
  return (
    <div className="toast-host">
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <span>{toast.message}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    onDismiss();
                  }}
                >
                  {toast.actionLabel}
                </button>
              )}
              <button type="button" onClick={onDismiss} aria-label="Cerrar">
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
