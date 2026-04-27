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

const moduleIcons = ["🗒️", "🌀", "📋", "📦", "⚙️", "🔲"];
const navIcons = ["🏠", "◔", "📊", "👤"];

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
    <main className="min-h-screen bg-[#efefef] pb-24 pt-4">
      <div className="mx-auto w-full max-w-md px-3">
        <h1 className="mb-3 text-center text-xl font-semibold text-slate-800">{copy.title}</h1>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-y-6">
            {copy.modules.map((moduleName, index) => (
              <button
                key={moduleName}
                type="button"
                onClick={() => goModule(index)}
                className="col-span-2 flex flex-col items-center sm:col-span-1"
              >
                <div className="text-3xl">{moduleIcons[index]}</div>
                <p className="mt-2 text-center text-sm text-slate-800">{moduleName}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-3 grid grid-cols-4 gap-2">
          {copy.statLabels.map((label) => (
            <div key={label} className="rounded-xl bg-white px-2 py-3 text-center shadow-sm">
              <p className="text-4xl leading-none text-slate-900">0</p>
              <p className="mt-2 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-slate-900">
              {copy.taskTitle}
              <span className="ml-1 text-slate-600">›</span>
            </h2>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-5 w-5 rounded border-slate-300" />
              {copy.taskFilter}
            </label>
          </div>
        </section>

        <section className="mt-3 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
          <p>
            {copy.account}: <span className="font-medium text-slate-900">{session.email}</span>
          </p>
          <p className="mt-1">
            {copy.factory}:{" "}
            <span className="font-medium text-slate-900">{session.factoryName || "-"}</span>
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            {copy.logout}
          </button>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-md grid-cols-4 py-2">
          {copy.navItems.map((item, index) => (
            <button key={item} type="button" className="flex flex-col items-center">
              <span className={`text-xl ${index === 0 ? "text-amber-500" : "text-slate-400"}`}>
                {navIcons[index]}
              </span>
              <span
                className={`text-sm ${index === 0 ? "font-medium text-amber-500" : "text-slate-500"}`}
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
