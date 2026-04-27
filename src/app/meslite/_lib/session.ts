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
  const [session, setSession] = useState<MesliteSession | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as MesliteSession;
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
    localStorage.setItem(LANG_KEY, session.locale === "en" ? "en" : "zh");
  }, [router, session]);

  const locale: Locale = useMemo(
    () => (session?.locale === "en" ? "en" : "zh"),
    [session?.locale],
  );

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.replace("/");
  };

  return { session, locale, logout };
}
