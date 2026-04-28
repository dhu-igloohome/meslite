"use client";

import { useMemo } from "react";
import { useMesliteSession } from "../_lib/session";

const labels = {
  zh: {
    account: "账号",
    factory: "工厂",
    logout: "退出登录",
    menu: "账户菜单",
    workspace: "工作区",
  },
  en: {
    account: "Account",
    factory: "Factory",
    logout: "Log out",
    menu: "Account menu",
    workspace: "Workspace",
  },
};

export default function MesliteShell({ children }: { children: React.ReactNode }) {
  const { session, locale, logout } = useMesliteSession();
  const copy = useMemo(() => labels[locale], [locale]);

  if (!session) {
    return <>{children}</>;
  }

  const userInitial = session.email.slice(0, 1).toUpperCase();

  return (
    <>
      {children}

      <div className="pointer-events-none fixed bottom-4 left-4 z-50 md:bottom-5 md:left-5">
        <details className="pointer-events-auto relative">
          <summary
            className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-2.5 py-1.5 text-sm text-zinc-700 shadow-[0_16px_36px_-24px_rgba(0,0,0,.85)] backdrop-blur transition hover:border-zinc-300 hover:bg-white"
            aria-label={copy.menu}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
              {userInitial}
            </span>
            <span className="max-w-28 truncate text-xs font-medium text-zinc-800 sm:max-w-40">
              {session.factoryName || "—"}
            </span>
          </summary>

          <div className="absolute bottom-11 left-0 w-72 rounded-2xl border border-black/5 bg-white p-3 shadow-xl">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400">{copy.workspace}</p>
            <div className="space-y-2 border-b border-zinc-100 pb-3 text-xs text-zinc-500">
              <p>
                {copy.account}: <span className="font-medium text-zinc-800">{session.email}</span>
              </p>
              <p>
                {copy.factory}: <span className="font-medium text-zinc-800">{session.factoryName || "—"}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
            >
              {copy.logout}
            </button>
          </div>
        </details>
      </div>
    </>
  );
}
