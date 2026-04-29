import type { ReactNode } from "react";

type ModalDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
};

export function ModalDialog({ open, title, children, onClose, actions }: ModalDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="text-sm text-slate-700">{children}</div>
        {actions ? <div className="mt-4 flex justify-end gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
