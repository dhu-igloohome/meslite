import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  footnote?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, icon, footnote, className = "" }: StatCardProps) {
  return (
    <article className={`mes-card p-4 sm:p-5 ${className}`.trim()}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="text-2xl font-semibold leading-none tracking-tight text-slate-900 sm:text-3xl">{value}</p>
        </div>
        {icon ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">{icon}</span>
        ) : null}
      </div>
      {footnote ? <div className="mt-3">{footnote}</div> : null}
    </article>
  );
}
