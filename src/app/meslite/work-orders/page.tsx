"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Locale = "zh" | "en";

type Session = {
  email: string;
  factoryName: string;
  locale: Locale;
};

const SESSION_KEY = "meslite_session";

const text = {
  zh: {
    title: "工单",
    tabs: ["全部", "待下发", "生产中", "暂停中", "已完工"],
    selectedTab: "暂停中",
    filters: ["工单分类", "关键词", "超期状态", "排序", "工单日期", "完工日期", "生产部门", "紧急程度"],
    empty: "没有发现数据",
    planCount: "计划数量",
    more: "更多...",
    create: "新建",
  },
  en: {
    title: "Work Orders",
    tabs: ["All", "Pending", "In Production", "Paused", "Completed"],
    selectedTab: "Paused",
    filters: [
      "Order Type",
      "Keyword",
      "Overdue State",
      "Sort",
      "Order Date",
      "Finish Date",
      "Department",
      "Urgency",
    ],
    empty: "No data found",
    planCount: "Planned Qty",
    more: "More...",
    create: "Create",
  },
};

export default function WorkOrdersPage() {
  const router = useRouter();
  const [session] = useState<Session | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Session;
      return parsed?.email ? parsed : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [router, session]);

  const copy = useMemo(
    () => text[session?.locale === "en" ? "en" : "zh"],
    [session?.locale],
  );

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="px-4 pt-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/meslite")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-2xl leading-none text-zinc-800"
            >
              ‹
            </button>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
            <div className="rounded-full border border-zinc-300 px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-700">
              Menu
            </div>
          </div>

          <div className="mt-5 grid grid-cols-5 rounded-2xl border border-black/5 bg-white p-1 text-center text-sm text-zinc-700 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)]">
            {copy.tabs.map((tab) => {
              const isSelected = tab === copy.selectedTab;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-xl px-2 py-2 ${
                    isSelected ? "bg-zinc-900 font-medium text-white" : "text-zinc-600"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {copy.filters.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-xl border border-black/5 bg-white px-2 py-2 text-center text-xs text-zinc-600 shadow-[0_15px_30px_-28px_rgba(0,0,0,0.95)]"
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border border-zinc-300 bg-white text-5xl text-zinc-400">
            ···
          </div>
          <p className="mt-8 text-3xl tracking-wide text-zinc-400">{copy.empty}</p>
        </section>

        <button
          type="button"
          className="fixed bottom-24 right-6 flex h-14 items-center gap-2 rounded-full bg-zinc-900 px-5 text-xs font-medium uppercase tracking-wider text-white shadow-lg"
          aria-label="add"
        >
          <span className="text-xl leading-none">+</span>
          <span>{copy.create}</span>
        </button>

        <footer className="sticky bottom-0 flex items-center justify-between border-t border-black/5 bg-white px-4 py-3">
          <p className="text-sm text-zinc-800">
            {copy.planCount}: <span className="font-medium">0</span>
          </p>
          <button
            type="button"
            className="rounded-full border border-zinc-300 bg-zinc-50 px-5 py-1.5 text-sm text-zinc-700"
          >
            {copy.more}
          </button>
        </footer>
      </div>
    </main>
  );
}
