"use client";

import { BackButton } from "@/components/ui/back-button";
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
    <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <BackButton label={copy.backLabel} fallbackHref="/meslite" className="mb-3" />
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
              <p className="mt-1 text-sm text-zinc-500">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {copy.createLabel}
            </button>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {copy.filters.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-2xl border border-black/5 bg-white px-3 py-2 text-left text-sm text-zinc-600 shadow-[0_12px_30px_-28px_rgba(0,0,0,.8)]"
            >
              {item}
            </button>
          ))}
        </section>

        <section className="mt-4 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <div className="grid grid-cols-2 border-b border-zinc-100 bg-zinc-50 md:grid-cols-4">
            {copy.columns.map((item) => (
              <div key={item} className="px-4 py-3 text-sm font-medium text-zinc-700">
                {item}
              </div>
            ))}
          </div>
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-zinc-300 text-zinc-500">
              ···
            </div>
            <h2 className="text-xl font-semibold text-zinc-800">{copy.emptyTitle}</h2>
            <p className="mt-2 max-w-lg text-sm text-zinc-500">{copy.emptyDescription}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
