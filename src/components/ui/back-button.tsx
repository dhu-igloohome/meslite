"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { SecondaryButton } from "./buttons";

type BackButtonProps = {
  label: string;
  fallbackHref: string;
  className?: string;
};

export function BackButton({ label, fallbackHref, className = "" }: BackButtonProps) {
  const router = useRouter();

  const onBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <SecondaryButton type="button" onClick={onBack} className={className}>
      <ChevronLeft className="h-4 w-4" />
      {label}
    </SecondaryButton>
  );
}
