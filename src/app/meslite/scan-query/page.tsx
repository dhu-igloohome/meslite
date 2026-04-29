"use client";

import { useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Search } from "lucide-react";
import { useMesliteSession } from "../_lib/session";

type WorkOrderRecord = {
  id: string;
  workOrderNo: string;
  recordType: "order" | "work_order";
  productCode: string;
  productName: string;
  processName: string;
  plannedQty: number;
  processPlannedQty: number;
  dueDate: string;
  createdAt: string;
};

const WORK_ORDERS_KEY = "meslite_work_orders";

const text = {
  zh: {
    title: "扫码查询",
    subtitle: "扫描二维码或输入订单/工单号，快速查询流转信息。",
    inputLabel: "订单/工单号",
    inputPlaceholder: "例如：PO20260428001",
    query: "查询",
    emptyTitle: "未查询到记录",
    emptyDescription: "请检查扫码内容或工单号是否正确。",
    resultTitle: "查询结果",
    workOrderNo: "工单号",
    recordType: "单据类型",
    product: "产品",
    process: "工艺路线",
    plannedQty: "计划数量",
    processPlannedQty: "工序计划数量",
    dueDate: "计划交期",
    createdAt: "创建时间",
    typeOrder: "订单",
    typeWorkOrder: "工单",
    backLabel: "返回首页",
  },
  en: {
    title: "Scan Query",
    subtitle: "Scan QR or input order/work-order number to query execution details.",
    inputLabel: "Order / Work Order No.",
    inputPlaceholder: "e.g. PO20260428001",
    query: "Search",
    emptyTitle: "No record found",
    emptyDescription: "Check whether scan content or number is correct.",
    resultTitle: "Result",
    workOrderNo: "Work Order No.",
    recordType: "Record Type",
    product: "Product",
    process: "Process Route",
    plannedQty: "Planned Qty",
    processPlannedQty: "Process Planned Qty",
    dueDate: "Due Date",
    createdAt: "Created At",
    typeOrder: "Order",
    typeWorkOrder: "Work Order",
    backLabel: "Back to Dashboard",
  },
};

export default function ScanQueryPage() {
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);
  const [records] = useState<WorkOrderRecord[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(WORK_ORDERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as WorkOrderRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [queryNo, setQueryNo] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return (new URLSearchParams(window.location.search).get("workOrderNo") || "").trim();
  });
  const [searchedNo, setSearchedNo] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return (new URLSearchParams(window.location.search).get("workOrderNo") || "").trim();
  });

  const matched = useMemo(
    () => records.find((item) => item.workOrderNo === searchedNo) || null,
    [records, searchedNo]
  );

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = queryNo.trim();
    setSearchedNo(keyword);
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <BackButton label={copy.backLabel} fallbackHref="/meslite" className="mb-3" />
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{copy.subtitle}</p>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]" onSubmit={onSearch}>
            <label className="text-sm text-zinc-700">
              {copy.inputLabel}
              <input
                type="text"
                value={queryNo}
                onChange={(e) => setQueryNo(e.target.value)}
                placeholder={copy.inputPlaceholder}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <Search className="h-4 w-4" />
              {copy.query}
            </button>
          </form>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.resultTitle}</h2>
          {!matched ? (
            <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">{copy.emptyTitle}</p>
              <p className="mt-1 text-xs text-zinc-500">{copy.emptyDescription}</p>
            </div>
          ) : (
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.workOrderNo}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">{matched.workOrderNo}</dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.recordType}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">
                  {matched.recordType === "order" ? copy.typeOrder : copy.typeWorkOrder}
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.product}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">
                  {matched.productCode} - {matched.productName}
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.process}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">{matched.processName || "-"}</dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.plannedQty}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">{matched.plannedQty}</dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.processPlannedQty}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">{matched.processPlannedQty}</dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.dueDate}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">{matched.dueDate || "-"}</dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs text-zinc-500">{copy.createdAt}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">{new Date(matched.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          )}
        </section>
      </div>
    </main>
  );
}
