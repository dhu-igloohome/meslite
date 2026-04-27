"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Locale = "zh" | "en";
type Mode = "login" | "register";

type Copy = {
  title: string;
  subtitle: string;
  switchLanguage: string;
  loginTab: string;
  registerTab: string;
  email: string;
  password: string;
  factoryName: string;
  submitLogin: string;
  submitRegister: string;
  loginSuccess: string;
  registerSuccess: string;
  accountExists: string;
  accountMissing: string;
  passwordError: string;
  passwordHint: string;
};

const translations: Record<Locale, Copy> = {
  zh: {
    title: "MESLite 微型报工系统",
    subtitle: "邮箱注册或登录后进入主界面",
    switchLanguage: "切换到 English",
    loginTab: "登录",
    registerTab: "注册",
    email: "邮箱",
    password: "密码",
    factoryName: "工厂名称",
    submitLogin: "登录并进入系统",
    submitRegister: "注册并进入系统",
    loginSuccess: "登录成功，正在跳转...",
    registerSuccess: "注册成功，正在跳转...",
    accountExists: "该邮箱已注册，请直接登录。",
    accountMissing: "该邮箱未注册，请先注册。",
    passwordError: "密码错误，请重试。",
    passwordHint: "请设置至少 6 位密码",
  },
  en: {
    title: "MESLite Mini Reporting System",
    subtitle: "Register or sign in with email to continue",
    switchLanguage: "Switch to 中文",
    loginTab: "Login",
    registerTab: "Register",
    email: "Email",
    password: "Password",
    factoryName: "Factory Name",
    submitLogin: "Login and continue",
    submitRegister: "Register and continue",
    loginSuccess: "Login successful, redirecting...",
    registerSuccess: "Registration successful, redirecting...",
    accountExists: "This email already exists. Please log in.",
    accountMissing: "No account found. Please register first.",
    passwordError: "Incorrect password. Please try again.",
    passwordHint: "Use at least 6 characters",
  },
};

type StoredUser = {
  email: string;
  password: string;
  factoryName: string;
  role: "super_admin" | "owner";
  createdAt: string;
};

const USERS_KEY = "meslite_users";
const SESSION_KEY = "meslite_session";
const LANG_KEY = "meslite_lang";
const DEFAULT_SUPER_ADMIN: StoredUser = {
  email: "13928445679@163.com",
  password: "david123",
  factoryName: "igloo公司",
  role: "super_admin",
  createdAt: "2026-04-27T00:00:00.000Z",
};

export default function Home() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "zh";
    }
    const saved = window.localStorage.getItem(LANG_KEY);
    return saved === "zh" || saved === "en" ? saved : "zh";
  });
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factoryName, setFactoryName] = useState("");
  const [message, setMessage] = useState("");

  const copy = useMemo(() => translations[locale], [locale]);

  const getUsers = (): StoredUser[] => {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as StoredUser[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const ensureSuperAdmin = () => {
    const users = getUsers();
    const exists = users.some(
      (user) => user.email.toLowerCase() === DEFAULT_SUPER_ADMIN.email.toLowerCase(),
    );
    if (exists) {
      return;
    }
    saveUsers([...users, DEFAULT_SUPER_ADMIN]);
  };

  useEffect(() => {
    ensureSuperAdmin();
    // only needs to run once on client startup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistLanguage = (nextLocale: Locale) => {
    setLocale(nextLocale);
    localStorage.setItem(LANG_KEY, nextLocale);
  };

  const gotoMain = (nextLocale: Locale, user: StoredUser) => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        email: user.email,
        factoryName: user.factoryName,
        locale: nextLocale,
      }),
    );
    router.push("/meslite");
  };

  const handleRegister = () => {
    const users = getUsers();
    const exists = users.find((user) => user.email === email.trim().toLowerCase());
    if (exists) {
      setMessage(copy.accountExists);
      return;
    }
    const newUser: StoredUser = {
      email: email.trim().toLowerCase(),
      password,
      factoryName: factoryName.trim(),
      role: "owner",
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    setMessage(copy.registerSuccess);
    gotoMain(locale, newUser);
  };

  const handleLogin = () => {
    const users = getUsers();
    const user = users.find((item) => item.email === email.trim().toLowerCase());
    if (!user) {
      setMessage(copy.accountMissing);
      return;
    }
    if (user.password !== password) {
      setMessage(copy.passwordError);
      return;
    }
    setMessage(copy.loginSuccess);
    gotoMain(locale, user);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage(copy.passwordHint);
      return;
    }
    if (mode === "register" && !factoryName.trim()) {
      return;
    }
    if (mode === "register") {
      handleRegister();
      return;
    }
    handleLogin();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 p-6 sm:p-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/85 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              MESLite
            </p>
            <h1 className="text-xl font-semibold text-slate-900">{copy.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => persistLanguage(locale === "zh" ? "en" : "zh")}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            {copy.switchLanguage}
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md py-2 ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-indigo-200"
                : "text-slate-600"
            }`}
          >
            {copy.loginTab}
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-md py-2 ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-indigo-200"
                : "text-slate-600"
            }`}
          >
            {copy.registerTab}
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <label className="block text-sm text-slate-700">
            {copy.email}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="block text-sm text-slate-700">
            {copy.password}
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          {mode === "register" && (
            <label className="block text-sm text-slate-700">
              {copy.factoryName}
              <input
                type="text"
                required
                value={factoryName}
                onChange={(e) => setFactoryName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            {mode === "login" ? copy.submitLogin : copy.submitRegister}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{message}</p>
        ) : null}
      </div>
    </main>
  );
}
