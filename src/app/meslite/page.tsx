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
const LANG_KEY = "meslite_lang";

const text = {
  zh: {
    title: "MESLite",
    greeting: "欢迎回来",
    modules: ["工单", "任务", "报工", "基础资料", "功能设置", "扫码查工单"],
    statLabels: ["待下发", "生产中", "暂停中", "已超期"],
    taskTitle: "我的任务",
    taskFilter: "只看当前生产",
    navItems: ["首页", "进度", "报表", "我的"],
    account: "账号",
    factory: "工厂",
    logout: "退出登录",
  },
  en: {
    title: "MESLite",
    greeting: "Welcome back",
    modules: [
      "Work Orders",
      "Tasks",
      "Reporting",
      "Base Data",
      "Settings",
      "Scan Order",
    ],
    statLabels: ["Pending", "In Production", "Paused", "Overdue"],
    taskTitle: "My Tasks",
    taskFilter: "Current production only",
    navItems: ["Home", "Progress", "Reports", "Me"],
    account: "Account",
    factory: "Factory",
    logout: "Log out",
  },
};

const moduleIcons = ["WO", "TS", "RP", "BD", "ST", "SC"];
const navIcons = ["H", "P", "R", "M"];

export default function MeslitePage() {
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
      return;
    }
    if (session.locale) {
      localStorage.setItem(LANG_KEY, session.locale);
    }
  }, [router, session]);

  const copy = useMemo(
    () => text[session?.locale === "en" ? "en" : "zh"],
    [session?.locale],
  );

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    router.replace("/");
  };

  const goModule = (index: number) => {
    if (index === 0) {
      router.push("/meslite/work-orders");
    }
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] pb-24 pt-6">
      <div className="mx-auto w-full max-w-md px-4">
        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
          <p className="text-xs tracking-[0.2em] text-zinc-500">{copy.greeting}</p>
          <div className="mt-1 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
              <p className="mt-1 text-xs text-zinc-500">
                {copy.account}: {session.email}
              </p>
            </div>
            <span className="rounded-full border border-zinc-200 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Premium
            </span>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-3 gap-3">
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

        <section className="mt-4 grid grid-cols-2 gap-3">
          {copy.statLabels.map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-black/5 bg-white px-4 py-4 shadow-[0_20px_40px_-35px_rgba(0,0,0,0.55)]"
            >
              <p className="text-3xl font-semibold leading-none text-zinc-900">00</p>
              <p className="mt-2 text-xs tracking-wide text-zinc-500">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {copy.taskTitle}
              <span className="ml-1 text-zinc-500">›</span>
            </h2>
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
              {copy.taskFilter}
            </label>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-4 text-sm text-zinc-700 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
          <p>
            {copy.account}: <span className="font-medium text-zinc-900">{session.email}</span>
          </p>
          <p className="mt-1">
            {copy.factory}:{" "}
            <span className="font-medium text-zinc-900">{session.factoryName || "-"}</span>
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
          >
            {copy.logout}
          </button>
        </section>
      </div>

      <nav className="fixed bottom-3 left-0 right-0">
        <div className="mx-auto grid w-[calc(100%-1.5rem)] max-w-md grid-cols-4 rounded-2xl border border-black/5 bg-white/95 py-2 shadow-lg backdrop-blur">
          {copy.navItems.map((item, index) => (
            <button key={item} type="button" className="flex flex-col items-center">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  index === 0 ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {navIcons[index]}
              </span>
              <span
                className={`mt-1 text-[11px] ${
                  index === 0 ? "font-medium text-zinc-900" : "text-zinc-500"
                }`}
              >
                {item}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
