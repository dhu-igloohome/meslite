import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
};

export function FormField({ label, children, hint, className = "" }: FormFieldProps) {
  return (
    <label className={`text-sm text-slate-700 ${className}`.trim()}>
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
