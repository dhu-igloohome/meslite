"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type Locale = "zh" | "en";

export type MesliteSession = {
  email: string;
  factoryName: string;
  locale: Locale;
};

const SESSION_KEY = "meslite_session";
const LANG_KEY = "meslite_lang";

export function useMesliteSession() {
  const router = useRouter();
  const [session, setSession] = useState<MesliteSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    let nextSession: MesliteSession | null = null;
    try {
      if (raw) {
        const parsed = JSON.parse(raw) as MesliteSession;
        nextSession = parsed?.email ? parsed : null;
      }
    } catch {
      nextSession = null;
    }
    queueMicrotask(() => {
      setSession(nextSession);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!session) {
      router.replace("/");
      return;
    }
    localStorage.setItem(LANG_KEY, session.locale === "en" ? "en" : "zh");
  }, [hydrated, router, session]);

  const locale: Locale = useMemo(
    () => (session?.locale === "en" ? "en" : "zh"),
    [session?.locale],
  );

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.replace("/");
  };

  return { session: hydrated ? session : null, locale, logout };
}
