"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMesliteSession } from "./_lib/session";

const text = {
  zh: {
    title: "MESLite",
    greeting: "企业制造执行平台",
    modules: [
      "订单/工单管理",
      "任务管理",
      "报工管理",
      "基础数据",
      "功能设置",
      "扫码查询",
      "系统设置",
    ],
    statLabels: ["待处理订单", "进行中任务", "今日报工", "异常提醒"],
    statValues: ["128", "46", "214", "3"],
    overviewTitle: "系统概览",
    overviewText: "统一管理订单、任务、报工与主数据，支持移动扫码查询与系统级配置。",
  },
  en: {
    title: "MESLite",
    greeting: "Manufacturing Execution Platform",
    modules: [
      "Order / Work Orders",
      "Tasks",
      "Production Reporting",
      "Master Data",
      "Feature Settings",
      "Scan Query",
      "System Settings",
    ],
    statLabels: ["Pending Orders", "Running Tasks", "Reports Today", "Alerts"],
    statValues: ["128", "46", "214", "3"],
    overviewTitle: "Platform Overview",
    overviewText:
      "Centralize order, task, reporting and master data operations with mobile scan query and system-level settings.",
  },
};

const moduleIcons = ["OM", "TM", "RM", "MD", "FS", "SQ", "SS"];
const moduleRoutes = [
  "/meslite/work-orders",
  "/meslite/tasks",
  "/meslite/reporting",
  "/meslite/master-data",
  "/meslite/feature-settings",
  "/meslite/scan-query",
  "/meslite/system-settings",
];

export default function MeslitePage() {
  const router = useRouter();
  const { session, locale } = useMesliteSession();

  const copy = useMemo(() => text[locale], [locale]);

  const goModule = (index: number) => {
    router.push(moduleRoutes[index]);
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-auto">
          <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
            <p className="text-xs tracking-[0.2em] text-zinc-500">{copy.greeting}</p>
            <div className="mt-1 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
              </div>
              <span className="rounded-full border border-zinc-200 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Premium
              </span>
            </div>
          </section>

          <section className="mt-4 rounded-3xl border border-black/5 bg-white p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
            <div className="grid grid-cols-1 gap-3">
              {copy.modules.map((moduleName, index) => (
                <button
                  key={moduleName}
                  type="button"
                  onClick={() => goModule(index)}
                  className="group rounded-2xl border border-zinc-100 bg-zinc-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-[10px] font-semibold tracking-wider text-zinc-600">
                    {moduleIcons[index]}
                  </div>
                  <p className="mt-3 text-xs font-medium leading-4 text-zinc-800">{moduleName}</p>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {copy.statLabels.map((label, index) => (
            <div
              key={label}
              className="rounded-2xl border border-black/5 bg-white px-4 py-4 shadow-[0_20px_40px_-35px_rgba(0,0,0,0.55)]"
            >
              <p className="text-3xl font-semibold leading-none text-zinc-900">{copy.statValues[index]}</p>
              <p className="mt-2 text-xs tracking-wide text-zinc-500">{label}</p>
            </div>
          ))}
          </section>

          <section className="mt-4 rounded-3xl border border-black/5 bg-white p-4 text-sm text-zinc-700 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{copy.overviewTitle}</h2>
            <p className="mt-2 text-zinc-600">{copy.overviewText}</p>
          </section>
        </section>
      </div>
    </main>
  );
}
