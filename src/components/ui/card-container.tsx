import type { ReactNode } from "react";

type CardContainerProps = {
  children: ReactNode;
  className?: string;
};

export function CardContainer({ children, className = "" }: CardContainerProps) {
  return <section className={`mes-card ${className}`.trim()}>{children}</section>;
}
