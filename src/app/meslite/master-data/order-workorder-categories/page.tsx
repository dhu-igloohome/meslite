"use client";

import { useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryButton } from "@/components/ui/buttons";
import { SectionCard } from "@/components/ui/section-card";
import { TextInput } from "@/components/ui/form-elements";
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
    <PageShell containerClassName="max-w-4xl">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        pretitle={<BackButton label={copy.backLabel} fallbackHref="/meslite/master-data" className="mb-3" />}
      />

      <SectionCard>
          <h2 className="text-lg font-semibold text-slate-900">{copy.existing}</h2>
          {categories.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{copy.empty}</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                >
                  {item.name}
                </span>
              ))}
            </div>
          )}
      </SectionCard>

      <SectionCard>
          <h2 className="text-lg font-semibold text-slate-900">{copy.create}</h2>
          <form className="mt-3 flex flex-wrap items-center gap-2" onSubmit={createCategory}>
            <TextInput
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.input}
              className="min-w-72"
            />
            <PrimaryButton type="submit">
              {copy.confirm}
            </PrimaryButton>
          </form>
          {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
      </SectionCard>
    </PageShell>
  );
}
