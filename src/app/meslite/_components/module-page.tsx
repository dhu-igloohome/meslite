"use client";

import { BackButton } from "@/components/ui/back-button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { SectionCard } from "@/components/ui/section-card";
import { useMesliteSession } from "../_lib/session";

type LocaleText = {
  title: string;
  subtitle: string;
  filters: string[];
  columns: string[];
  emptyTitle: string;
  emptyDescription: string;
  createLabel: string;
  backLabel: string;
};

type ModulePageProps = {
  text: Record<"zh" | "en", LocaleText>;
};

export default function ModulePage({ text }: ModulePageProps) {
  const { session, locale } = useMesliteSession();

  if (!session) {
    return null;
  }

  const copy = text[locale];

  return (
    <PageShell>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        pretitle={<BackButton label={copy.backLabel} fallbackHref="/meslite" className="mb-3" />}
        actions={<PrimaryButton type="button">{copy.createLabel}</PrimaryButton>}
      />

      <SectionCard className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {copy.filters.map((item) => (
            <SecondaryButton
              key={item}
              type="button"
              className="justify-start rounded-xl px-3 py-2 text-left text-sm text-slate-600"
            >
              {item}
            </SecondaryButton>
          ))}
      </SectionCard>

      <SectionCard className="overflow-hidden p-0">
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 md:grid-cols-4">
            {copy.columns.map((item) => (
              <div key={item} className="px-4 py-3 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-slate-300 text-slate-500">
              ···
            </div>
            <h2 className="text-xl font-semibold text-slate-800">{copy.emptyTitle}</h2>
            <p className="mt-2 max-w-lg text-sm text-slate-500">{copy.emptyDescription}</p>
          </div>
      </SectionCard>
    </PageShell>
  );
}
