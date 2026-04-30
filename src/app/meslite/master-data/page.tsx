"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { useMesliteSession } from "../_lib/session";

const text = {
  zh: {
    title: "基础数据",
    subtitle: "请选择子模块进入基础资料维护流程。",
    modules: ["产品中心", "工艺编制", "工艺库管理", "订单/工单分类", "产品分类"],
    enterHint: "点击进入模块",
    backLabel: "返回首页",
  },
  en: {
    title: "Master Data",
    subtitle: "Choose a submodule to maintain master data.",
    modules: ["Product Center", "Process Planning", "Route Template Library", "Order/Work Order Types", "Product Categories"],
    enterHint: "Enter module",
    backLabel: "Back to Dashboard",
  },
};

const moduleRoutes = [
  "/meslite/master-data/product-center",
  "/meslite/master-data/process-planning",
  "/meslite/master-data/route-templates",
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
    <PageShell containerClassName="max-w-4xl">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        pretitle={<BackButton label={copy.backLabel} fallbackHref="/meslite" className="mb-3" />}
      />

      <SectionCard className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {copy.modules.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => router.push(moduleRoutes[index])}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
            >
              <p className="text-lg font-semibold text-slate-900">{item}</p>
              <p className="mt-1 text-sm text-slate-500">{copy.enterHint}</p>
            </button>
          ))}
      </SectionCard>
    </PageShell>
  );
}
