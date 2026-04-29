import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  pretitle?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, actions, pretitle, className = "" }: PageHeaderProps) {
  return (
    <section className={`mes-card p-5 ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {pretitle}
          <h1 className="mes-title">{title}</h1>
          {subtitle ? <p className="mes-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
