import type { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
  className?: string;
};

export function DataTable({ children, className = "" }: DataTableProps) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200 ${className}`.trim()}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 text-slate-600">{children}</thead>;
}

export function DataTableHeaderCell({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{children}</th>;
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({ children, striped }: { children: ReactNode; striped?: boolean }) {
  return <tr className={`${striped ? "bg-slate-50/40" : "bg-white"} border-t border-slate-100 text-slate-700`}>{children}</tr>;
}

export function DataTableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`.trim()}>{children}</td>;
}
