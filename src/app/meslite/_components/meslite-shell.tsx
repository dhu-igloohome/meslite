"use client";

import { useMemo } from "react";
import { useMesliteSession } from "../_lib/session";

const labels = {
  zh: {
    account: "账号",
    factory: "工厂",
    logout: "退出登录",
  },
  en: {
    account: "Account",
    factory: "Factory",
    logout: "Log out",
  },
};

export default function MesliteShell({ children }: { children: React.ReactNode }) {
  const { session, locale, logout } = useMesliteSession();
  const copy = useMemo(() => labels[locale], [locale]);

  if (!session) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-600">
            <span className="truncate">
              <span className="text-zinc-400">{copy.account}</span>
              {": "}
              <span className="font-medium text-zinc-900">{session.email}</span>
            </span>
            <span className="truncate">
              <span className="text-zinc-400">{copy.factory}</span>
              {": "}
              <span className="font-medium text-zinc-900">{session.factoryName || "—"}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
          >
            {copy.logout}
          </button>
        </div>
      </header>
      {children}
    </>
  );
}
