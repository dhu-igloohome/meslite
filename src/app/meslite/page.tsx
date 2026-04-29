"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PageShell } from "@/components/ui/page-shell";
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

const moduleIcons = [ClipboardList, Wrench, Factory, Blocks, Cog, QrCode, Settings2];
const metricIcons = [ClipboardList, Wrench, Factory, AlertTriangle];
const quickActionRoutes = ["/meslite/work-orders", "/meslite/tasks", "/meslite/reporting"];
const WORK_ORDERS_KEY = "meslite_work_orders";
const TASKS_KEY = "meslite_tasks";
const REPORTS_KEY = "meslite_reports";
const REPORT_RECORDS_KEY = "meslite_report_records";
const LOGS_KEY = "meslite_operation_logs";

type WorkOrderRecord = {
  id: string;
  workOrderNo: string;
  dueDate: string;
  processPlannedQty: number;
  processName: string;
  categoryName: string;
  createdAt: string;
};

type GenericTaskRecord = {
  id?: string;
  name?: string;
  taskNo?: string;
  status?: string;
  createdAt?: string;
};

type GenericReportRecord = {
  id?: string;
  qty?: number;
  reportQty?: number;
  createdAt?: string;
  exception?: string;
};

type OperationLog = {
  id?: string;
  action?: string;
  detail?: string;
  createdAt?: string;
};

function toDayKey(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function lastNDayKeys(days: number) {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    keys.push(toDayKey(date.toISOString()));
  }
  return keys;
}

function formatTrend(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? "+100.0%" : "0.0%";
  }
  const percent = ((current - previous) / previous) * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

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
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>([]);
  const [tasks, setTasks] = useState<GenericTaskRecord[]>([]);
  const [reports, setReports] = useState<GenericReportRecord[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);

  useEffect(() => {
    const safeParseArray = <T,>(value: string | null): T[] => {
      if (!value) {
        return [];
      }
      try {
        const parsed = JSON.parse(value) as T[];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const loadDashboardData = () => {
      setWorkOrders(safeParseArray<WorkOrderRecord>(localStorage.getItem(WORK_ORDERS_KEY)));
      setTasks(safeParseArray<GenericTaskRecord>(localStorage.getItem(TASKS_KEY)));
      const reportsA = safeParseArray<GenericReportRecord>(localStorage.getItem(REPORTS_KEY));
      const reportsB = safeParseArray<GenericReportRecord>(localStorage.getItem(REPORT_RECORDS_KEY));
      setReports(reportsA.length > 0 ? reportsA : reportsB);
      setLogs(safeParseArray<OperationLog>(localStorage.getItem(LOGS_KEY)));
    };

    loadDashboardData();
    window.addEventListener("focus", loadDashboardData);
    window.addEventListener("storage", loadDashboardData);
    document.addEventListener("visibilitychange", loadDashboardData);
    return () => {
      window.removeEventListener("focus", loadDashboardData);
      window.removeEventListener("storage", loadDashboardData);
      document.removeEventListener("visibilitychange", loadDashboardData);
    };
  }, []);

  const copy = useMemo(() => text[locale], [locale]);
  const navItems = copy.modules.map((moduleName, index) => ({
    label: moduleName,
    route: moduleRoutes[index],
    Icon: moduleIcons[index],
  }));
  const quickActions = locale === "zh" ? ["新建工单", "创建任务", "新增报工"] : ["New Work Order", "Create Task", "New Report"];

  const dayKeys = lastNDayKeys(7);
  const todayKey = dayKeys[dayKeys.length - 1];

  const reportQtyByDay = dayKeys.map((key) =>
    reports
      .filter((item) => toDayKey(item.createdAt) === key)
      .reduce((acc, item) => acc + Number(item.qty ?? item.reportQty ?? 0), 0),
  );
  const workOrderByDay = dayKeys.map(
    (key) => workOrders.filter((item) => toDayKey(item.createdAt) === key).length,
  );
  const taskByDay = dayKeys.map((key) => tasks.filter((item) => toDayKey(item.createdAt) === key).length);
  const alertsByDay = dayKeys.map((key) => {
    const dueAlerts = workOrders.filter((item) => item.dueDate && new Date(item.dueDate) < new Date() && toDayKey(item.createdAt) === key).length;
    const reportAlerts = reports.filter((item) => Boolean(item.exception) && toDayKey(item.createdAt) === key).length;
    return dueAlerts + reportAlerts;
  });

  const todayReportQty = reports
    .filter((item) => toDayKey(item.createdAt) === todayKey)
    .reduce((acc, item) => acc + Number(item.qty ?? item.reportQty ?? 0), 0);
  const activeTasks = tasks.filter((item) => (item.status || "").toLowerCase() !== "done").length;
  const pendingOrders = workOrders.length;
  const totalAlerts =
    workOrders.filter((item) => item.dueDate && new Date(item.dueDate) < new Date()).length +
    reports.filter((item) => Boolean(item.exception)).length;

  const statValues = [String(pendingOrders), String(activeTasks), String(todayReportQty), String(totalAlerts)];
  const metricSparklines = [workOrderByDay, taskByDay, reportQtyByDay, alertsByDay];
  const statTrends = [
    formatTrend(workOrderByDay[6] ?? 0, workOrderByDay[5] ?? 0),
    formatTrend(taskByDay[6] ?? 0, taskByDay[5] ?? 0),
    formatTrend(reportQtyByDay[6] ?? 0, reportQtyByDay[5] ?? 0),
    formatTrend(alertsByDay[6] ?? 0, alertsByDay[5] ?? 0),
  ];

  const pendingList =
    workOrders.length > 0
      ? workOrders
          .slice(-4)
          .reverse()
          .map((item) =>
            locale === "zh"
              ? `${item.workOrderNo || item.id} ${item.processName || "-"}`
              : `${item.workOrderNo || item.id} ${item.processName || "-"}`,
          )
      : locale === "zh"
        ? ["暂无待处理工单"]
        : ["No pending work orders"];

  const alertList = [
    ...workOrders
      .filter((item) => item.dueDate && new Date(item.dueDate) < new Date())
      .slice(0, 2)
      .map((item) =>
        locale === "zh"
          ? `工单 ${item.workOrderNo || item.id} 已超交期`
          : `Work order ${item.workOrderNo || item.id} is overdue`,
      ),
    ...reports
      .filter((item) => Boolean(item.exception))
      .slice(0, 2)
      .map((item) => (locale === "zh" ? `报工异常：${item.exception}` : `Report exception: ${item.exception}`)),
  ];
  const normalizedAlertList =
    alertList.length > 0 ? alertList : locale === "zh" ? ["暂无异常预警"] : ["No active alerts"];

  const recentActivity =
    logs.length > 0
      ? logs
          .slice(0, 4)
          .map((item) =>
            locale === "zh"
              ? `${item.action || "操作"}：${item.detail || "-"}`
              : `${item.action || "Action"}: ${item.detail || "-"}`,
          )
      : locale === "zh"
        ? ["暂无最近活动"]
        : ["No recent activity"];

  const goModule = (route: string) => {
    router.push(route);
    setIsNavOpen(false);
  };

  if (!session) {
    return null;
  }

  return (
    <PageShell className="md:p-6 lg:p-8" containerClassName="max-w-7xl">
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
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
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
                          ? "border-blue-200 bg-blue-50/80 shadow-[0_10px_30px_-24px_rgba(37,99,235,.45)]"
                          : "border-zinc-100 bg-zinc-50/80 hover:-translate-y-0.5 hover:border-zinc-200 hover:bg-white hover:shadow-md"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "border border-zinc-200 bg-white text-zinc-600 group-hover:border-zinc-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-zinc-800">{label}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition ${
                          isActive ? "text-blue-600" : "text-zinc-400 group-hover:translate-x-0.5"
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
              const trend = statTrends[index] || copy.statTrends[index];
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
                        {statValues[index] || copy.statValues[index]}
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

          <section className="mt-3 rounded-3xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 shadow-[0_24px_60px_-40px_rgba(15,23,42,.55)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">{copy.overviewTitle}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                Live
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-zinc-600">{copy.overviewText}</p>
          </section>

          <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
            <article className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,.45)] xl:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">{locale === "zh" ? "待处理清单" : "Pending Queue"}</h3>
                <span className="text-xs text-zinc-500">{pendingList.length}</span>
              </div>
              <ul className="space-y-2">
                {pendingList.map((item) => (
                  <li key={item} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,.45)] xl:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">{locale === "zh" ? "异常预警" : "Alerts"}</h3>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </div>
              <ul className="space-y-2">
                {normalizedAlertList.map((item) => (
                  <li key={item} className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-xs text-rose-700">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,.45)] xl:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">{locale === "zh" ? "快速操作" : "Quick Actions"}</h3>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => goModule(quickActionRoutes[index])}
                    className="flex min-h-11 items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm font-medium text-zinc-800 transition hover:bg-white"
                  >
                    <span>{action}</span>
                    <ArrowUpRight className="h-4 w-4 text-zinc-500" />
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,.45)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">{locale === "zh" ? "最近活动" : "Recent Activity"}</h3>
              <span className="text-xs text-zinc-500">{locale === "zh" ? "实时更新" : "Live feed"}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {recentActivity.map((item) => (
                <div key={item} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>
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
                        ? "border-blue-200 bg-blue-50/80"
                        : "border-zinc-100 bg-zinc-50/80 active:bg-zinc-100"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                        isActive ? "bg-blue-600 text-white" : "border border-zinc-200 bg-white text-zinc-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-zinc-800">{label}</span>
                    <ChevronRight className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-zinc-400"}`} />
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      ) : null}
    </PageShell>
  );
}
