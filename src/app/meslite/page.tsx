"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Blocks,
  ChevronRight,
  ClipboardList,
  Cog,
  Factory,
  Menu,
  QrCode,
  Settings2,
  TrendingDown,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
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
    statTrends: ["+12.4%", "+6.2%", "+18.1%", "-2.7%"],
    statTrendWords: ["较昨日", "较昨日", "较昨日", "较昨日"],
    overviewTitle: "系统概览",
    overviewText: "统一管理订单、任务、报工与主数据，支持移动扫码查询与系统级配置。",
    navSection: "业务导航",
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
    statTrends: ["+12.4%", "+6.2%", "+18.1%", "-2.7%"],
    statTrendWords: ["vs yesterday", "vs yesterday", "vs yesterday", "vs yesterday"],
    overviewTitle: "Platform Overview",
    overviewText:
      "Centralize order, task, reporting and master data operations with mobile scan query and system-level settings.",
    navSection: "Operations",
  },
};

const moduleRoutes = [
  "/meslite/work-orders",
  "/meslite/tasks",
  "/meslite/reporting",
  "/meslite/master-data",
  "/meslite/feature-settings",
  "/meslite/scan-query",
  "/meslite/system-settings",
];

const metricSparklines = [
  [38, 42, 40, 46, 44, 50, 52],
  [22, 25, 23, 28, 30, 31, 33],
  [56, 58, 60, 65, 67, 70, 74],
  [18, 16, 17, 15, 14, 13, 12],
];

const moduleIcons = [ClipboardList, Wrench, Factory, Blocks, Cog, QrCode, Settings2];
const metricIcons = [ClipboardList, Wrench, Factory, AlertTriangle];

function Sparkline({ values, negative = false }: { values: number[]; negative?: boolean }) {
  const width = 100;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-full">
      <polyline
        fill="none"
        stroke={negative ? "#dc2626" : "#16a34a"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function MeslitePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, locale } = useMesliteSession();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const copy = useMemo(() => text[locale], [locale]);
  const navItems = copy.modules.map((moduleName, index) => ({
    label: moduleName,
    route: moduleRoutes[index],
    Icon: moduleIcons[index],
  }));

  const goModule = (route: string) => {
    router.push(route);
    setIsNavOpen(false);
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,.55)] lg:hidden">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{copy.greeting}</p>
            <h1 className="text-lg font-semibold text-zinc-900">{copy.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)] lg:overflow-hidden">
            <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_24px_60px_-38px_rgba(15,23,42,.45)]">
              <p className="text-[11px] tracking-[0.18em] text-zinc-500">{copy.greeting}</p>
              <div className="mt-2 flex items-start justify-between">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
                  Premium
                </span>
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,.45)]">
              <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                {copy.navSection}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {navItems.map(({ label, route, Icon }) => {
                  const isActive = pathname?.startsWith(route);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goModule(route)}
                      className={`group flex min-h-11 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-violet-200 bg-violet-50/80 shadow-[0_10px_30px_-24px_rgba(109,40,217,.8)]"
                          : "border-zinc-100 bg-zinc-50/80 hover:-translate-y-0.5 hover:border-zinc-200 hover:bg-white hover:shadow-md"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-violet-600 text-white"
                            : "border border-zinc-200 bg-white text-zinc-600 group-hover:border-zinc-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-zinc-800">{label}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition ${
                          isActive ? "text-violet-600" : "text-zinc-400 group-hover:translate-x-0.5"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          <section>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {copy.statLabels.map((label, index) => {
              const trend = copy.statTrends[index];
              const isNegative = trend.startsWith("-");
              const StatIcon = metricIcons[index];
              return (
                <article
                  key={label}
                  className="group rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-[0_24px_50px_-40px_rgba(15,23,42,.55)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-40px_rgba(15,23,42,.65)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 sm:text-xs">{label}</p>
                      <p className="text-2xl font-semibold leading-none tracking-tight text-zinc-900 sm:text-3xl">
                        {copy.statValues[index]}
                      </p>
                    </div>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                      <StatIcon className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-3">
                    <Sparkline values={metricSparklines[index]} negative={isNegative} />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isNegative ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isNegative ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                      {trend}
                    </p>
                    <p className="text-xs text-zinc-500">{copy.statTrendWords[index]}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-4 rounded-3xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 shadow-[0_24px_60px_-40px_rgba(15,23,42,.55)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">{copy.overviewTitle}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700">
                Live
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-zinc-600">{copy.overviewText}</p>
          </section>
        </section>
        </div>
      </div>

      {isNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setIsNavOpen(false)}
            className="absolute inset-0 bg-zinc-900/40"
            aria-label="Close navigation"
          />
          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-r border-zinc-200 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{copy.greeting}</p>
                <h2 className="text-xl font-semibold text-zinc-900">{copy.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              {copy.navSection}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {navItems.map(({ label, route, Icon }) => {
                const isActive = pathname?.startsWith(route);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => goModule(route)}
                    className={`group flex min-h-11 items-center gap-3 rounded-2xl border px-3 py-3 text-left ${
                      isActive
                        ? "border-violet-200 bg-violet-50/80"
                        : "border-zinc-100 bg-zinc-50/80 active:bg-zinc-100"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                        isActive ? "bg-violet-600 text-white" : "border border-zinc-200 bg-white text-zinc-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-zinc-800">{label}</span>
                    <ChevronRight className={`h-4 w-4 ${isActive ? "text-violet-600" : "text-zinc-400"}`} />
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
