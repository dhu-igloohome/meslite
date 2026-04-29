import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export function PageShell({ children, className = "", containerClassName = "" }: PageShellProps) {
  return (
    <main className={`mes-page ${className}`.trim()}>
      <div className={`mes-container ${containerClassName}`.trim()}>{children}</div>
    </main>
  );
}
