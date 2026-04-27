"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMesliteSession } from "../../_lib/session";

type OrderWorkOrderCategory = {
  id: string;
  name: string;
  createdAt: string;
};

const CATEGORIES_KEY = "meslite_order_workorder_categories";

const text = {
  zh: {
    title: "订单/工单分类",
    subtitle: "查看已有分类并创建新的订单/工单分类。",
    existing: "已有分类名称",
    empty: "暂无分类",
    create: "创建新的订单/工单分类",
    input: "分类名称",
    confirm: "确认",
    createOk: "分类创建成功。",
    backLabel: "返回基础数据",
  },
  en: {
    title: "Order / Work Order Types",
    subtitle: "View existing categories and create a new one.",
    existing: "Existing category names",
    empty: "No categories",
    create: "Create new order/work order category",
    input: "Category name",
    confirm: "Confirm",
    createOk: "Category created.",
    backLabel: "Back to Master Data",
  },
};

export default function OrderWorkOrderCategoriesPage() {
  const router = useRouter();
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);

  const [categories, setCategories] = useState<OrderWorkOrderCategory[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as OrderWorkOrderCategory[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const saveCategories = (next: OrderWorkOrderCategory[]) => {
    setCategories(next);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
  };

  const createCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) {
      return;
    }
    const item: OrderWorkOrderCategory = {
      id: `owc_${Date.now()}`,
      name: value,
      createdAt: new Date().toISOString(),
    };
    saveCategories([...categories, item]);
    setName("");
    setMessage(copy.createOk);
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <button
            type="button"
            onClick={() => router.push("/meslite/master-data")}
            className="mb-3 rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600"
          >
            {copy.backLabel}
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{copy.subtitle}</p>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.existing}</h2>
          {categories.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">{copy.empty}</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
                >
                  {item.name}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.create}</h2>
          <form className="mt-3 flex flex-wrap items-center gap-2" onSubmit={createCategory}>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.input}
              className="min-w-72 rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {copy.confirm}
            </button>
          </form>
          {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
