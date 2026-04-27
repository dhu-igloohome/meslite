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
    <main className="min-h-screen bg-[#efefef]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="px-4 pt-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/meslite")}
              className="text-3xl leading-none text-slate-800"
            >
              ‹
            </button>
            <h1 className="text-3xl font-medium text-slate-900">{copy.title}</h1>
            <div className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">•••</div>
          </div>

          <div className="mt-4 grid grid-cols-5 text-center text-xl text-slate-900">
            {copy.tabs.map((tab) => {
              const isSelected = tab === copy.selectedTab;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`pb-2 ${isSelected ? "font-semibold text-orange-500" : ""}`}
                >
                  {tab}
                  {isSelected ? <div className="mx-auto mt-1 h-1 w-10 rounded bg-orange-500" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {copy.filters.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-2xl bg-white px-2 py-2 text-center text-lg text-slate-600"
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="h-40 w-40 rounded-full bg-orange-100" />
          <p className="mt-8 text-5xl text-slate-400">{copy.empty}</p>
        </section>

        <button
          type="button"
          className="fixed bottom-24 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-5xl text-white shadow-lg"
          aria-label="add"
        >
          +
        </button>

        <footer className="sticky bottom-0 flex items-center justify-between bg-white px-4 py-3">
          <p className="text-2xl text-slate-800">
            {copy.planCount}: <span className="font-medium">0</span>
          </p>
          <button type="button" className="rounded-full bg-slate-100 px-6 py-2 text-2xl text-slate-800">
            {copy.more}
          </button>
        </footer>
      </div>
    </main>
  );
}
