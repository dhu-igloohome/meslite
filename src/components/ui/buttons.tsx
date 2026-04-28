import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = "", ...props }: AppButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }: AppButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function DangerOutlineButton({ children, className = "", ...props }: AppButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    >
      {children}
    </button>
  );
}
