import type { ReactNode } from "react";

type CardContainerProps = {
  children: ReactNode;
  className?: string;
};

export function CardContainer({ children, className = "" }: CardContainerProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}>
      {children}
    </section>
  );
}
