"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMesliteSession } from "../_lib/session";

const text = {
  zh: {
    title: "基础数据",
    subtitle: "请选择子模块进入基础资料维护流程。",
    modules: ["产品中心", "工艺编制", "订单/工单分类", "产品分类"],
    enterHint: "点击进入模块",
    backLabel: "返回首页",
  },
  en: {
    title: "Master Data",
    subtitle: "Choose a submodule to maintain master data.",
    modules: ["Product Center", "Process Planning", "Order/Work Order Types", "Product Categories"],
    enterHint: "Enter module",
    backLabel: "Back to Dashboard",
  },
};

const moduleRoutes = [
  "/meslite/master-data/product-center",
  "/meslite/master-data/process-planning",
  "/meslite/master-data/order-workorder-categories",
  "/meslite/master-data/product-categories",
];

export default function MasterDataPage() {
  const router = useRouter();
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <button
            type="button"
            onClick={() => router.push("/meslite")}
            className="mb-3 rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600"
          >
            {copy.backLabel}
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{copy.subtitle}</p>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {copy.modules.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => router.push(moduleRoutes[index])}
              className="rounded-2xl border border-black/5 bg-white p-5 text-left shadow-[0_12px_30px_-28px_rgba(0,0,0,.8)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-lg font-semibold text-zinc-900">{item}</p>
              <p className="mt-1 text-sm text-zinc-500">{copy.enterHint}</p>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
