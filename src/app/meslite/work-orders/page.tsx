"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMesliteSession } from "../_lib/session";

type OrderTypeCategory = {
  id: string;
  name: string;
};

type ProductRecord = {
  id: string;
  productCode: string;
  productName: string;
  productSpec: string;
  categoryName: string;
};

type ProcessPlan = {
  id: string;
  processName: string;
  reportFactor: number;
  departmentName: string;
  productionMinutes: number;
  defaultWorkers: string[];
};

type WorkOrderRecord = {
  id: string;
  workOrderNo: string;
  recordType: "order" | "work_order";
  categoryId: string;
  categoryName: string;
  productId: string;
  productCode: string;
  productName: string;
  productSpec: string;
  productCategoryName: string;
  processPlanId: string;
  processName: string;
  processReportFactor: number;
  processPlannedQty: number;
  plannedQty: number;
  dueDate: string;
  departmentName: string;
  workers: string[];
  note: string;
  createdAt: string;
};

const PRODUCTS_KEY = "meslite_products";
const PROCESS_PLANS_KEY = "meslite_process_plans";
const ORDER_TYPES_KEY = "meslite_order_workorder_categories";
const WORK_ORDERS_KEY = "meslite_work_orders";

const text = {
  zh: {
    title: "订单/工单管理",
    subtitle: "基于基础数据创建订单/工单，并自动带出工艺报工计划。",
    backLabel: "返回首页",
    listTitle: "已有订单/工单",
    empty: "暂无订单/工单记录",
    createTitle: "创建订单/工单",
    recordType: "单据类型",
    recordTypeOptions: { order: "订单", work_order: "工单" },
    category: "订单/工单分类",
    product: "产品",
    productSpec: "产品规格",
    productCategory: "产品分类",
    plannedQty: "计划数量",
    dueDate: "计划交期",
    processPlan: "工艺编制",
    processFactor: "报工系数",
    processPlannedQty: "工序计划数量（自动）",
    department: "生产部门",
    workers: "默认生产人员",
    note: "备注",
    save: "保存",
    saveOk: "订单/工单创建成功。",
    noCategory: "请先在基础数据里创建“订单/工单分类”。",
    noProduct: "请先在基础数据里创建产品。",
    noProcess: "请先在基础数据里创建工艺编制。",
    workOrderNo: "工单号",
    productName: "产品名称",
    processName: "工序名称",
    createdAt: "创建时间",
  },
  en: {
    title: "Order / Work Order Management",
    subtitle: "Create order/work-order records from master data with auto process quantity calculation.",
    backLabel: "Back to Dashboard",
    listTitle: "Existing Orders / Work Orders",
    empty: "No records yet",
    createTitle: "Create Order / Work Order",
    recordType: "Record Type",
    recordTypeOptions: { order: "Order", work_order: "Work Order" },
    category: "Order/Work Order Category",
    product: "Product",
    productSpec: "Product Spec",
    productCategory: "Product Category",
    plannedQty: "Planned Quantity",
    dueDate: "Planned Due Date",
    processPlan: "Process Plan",
    processFactor: "Reporting Factor",
    processPlannedQty: "Process Planned Qty (auto)",
    department: "Production Department",
    workers: "Default Workers",
    note: "Note",
    save: "Save",
    saveOk: "Record created successfully.",
    noCategory: "Create order/work-order categories in master data first.",
    noProduct: "Create products in master data first.",
    noProcess: "Create process plans in master data first.",
    workOrderNo: "Work Order No.",
    productName: "Product Name",
    processName: "Process Name",
    createdAt: "Created At",
  },
};

function nextWorkOrderNo(records: WorkOrderRecord[]) {
  const maxNumber = records
    .map((item) => Number.parseInt(item.workOrderNo.replace(/^WO-/, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((acc, curr) => Math.max(acc, curr), 0);
  return `WO-${String(maxNumber + 1).padStart(6, "0")}`;
}

function nextRecordId(records: WorkOrderRecord[]) {
  const maxNumber = records
    .map((item) => Number.parseInt(item.id.replace(/^wo_/, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((acc, curr) => Math.max(acc, curr), 0);
  return `wo_${String(maxNumber + 1).padStart(6, "0")}`;
}

export default function WorkOrdersPage() {
  const router = useRouter();
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);

  const [categories] = useState<OrderTypeCategory[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(ORDER_TYPES_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as OrderTypeCategory[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [products] = useState<ProductRecord[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as ProductRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [processPlans] = useState<ProcessPlan[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(PROCESS_PLANS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as ProcessPlan[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [records, setRecords] = useState<WorkOrderRecord[]>(() => {
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

  const [recordType, setRecordType] = useState<"order" | "work_order">("order");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [plannedQty, setPlannedQty] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [processPlanId, setProcessPlanId] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const selectedProduct = products.find((item) => item.id === productId);
  const selectedProcess = processPlans.find((item) => item.id === processPlanId);

  const processFactor = selectedProcess?.reportFactor ?? 100;
  const processPlannedQty = Math.round(plannedQty * (processFactor / 100));

  const saveRecords = (next: WorkOrderRecord[]) => {
    setRecords(next);
    localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  };

  const createRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const categoryName = categories.find((item) => item.id === categoryId)?.name || "";
    const item: WorkOrderRecord = {
      id: nextRecordId(records),
      workOrderNo: nextWorkOrderNo(records),
      recordType,
      categoryId,
      categoryName,
      productId,
      productCode: selectedProduct?.productCode || "",
      productName: selectedProduct?.productName || "",
      productSpec: selectedProduct?.productSpec || "",
      productCategoryName: selectedProduct?.categoryName || "",
      processPlanId,
      processName: selectedProcess?.processName || "",
      processReportFactor: processFactor,
      processPlannedQty,
      plannedQty,
      dueDate,
      departmentName: selectedProcess?.departmentName || "",
      workers: selectedProcess?.defaultWorkers || [],
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [...records, item];
    saveRecords(next);
    setMessage(copy.saveOk);
    setRecordType("order");
    setCategoryId("");
    setProductId("");
    setPlannedQty(0);
    setDueDate("");
    setProcessPlanId("");
    setNote("");
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
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

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.listTitle}</h2>
          {records.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">{copy.empty}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="px-2 py-2">{copy.workOrderNo}</th>
                    <th className="px-2 py-2">{copy.category}</th>
                    <th className="px-2 py-2">{copy.productName}</th>
                    <th className="px-2 py-2">{copy.processName}</th>
                    <th className="px-2 py-2">{copy.processPlannedQty}</th>
                    <th className="px-2 py-2">{copy.createdAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((item) => (
                    <tr key={item.id} className="border-t border-zinc-100 text-zinc-700">
                      <td className="px-2 py-2">{item.workOrderNo}</td>
                      <td className="px-2 py-2">{item.categoryName || "-"}</td>
                      <td className="px-2 py-2">{item.productName || "-"}</td>
                      <td className="px-2 py-2">{item.processName || "-"}</td>
                      <td className="px-2 py-2">{item.processPlannedQty}</td>
                      <td className="px-2 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h2 className="text-xl font-semibold text-zinc-900">{copy.createTitle}</h2>
          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={createRecord}>
            <label className="text-sm text-zinc-700">
              {copy.recordType}
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as "order" | "work_order")}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
              >
                <option value="order">{copy.recordTypeOptions.order}</option>
                <option value="work_order">{copy.recordTypeOptions.work_order}</option>
              </select>
            </label>

            <label className="text-sm text-zinc-700">
              {copy.category}
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
              >
                <option value="">{copy.category}</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            {categories.length === 0 ? <p className="text-xs text-amber-600 md:col-span-2">{copy.noCategory}</p> : null}

            <label className="text-sm text-zinc-700">
              {copy.product}
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
              >
                <option value="">{copy.product}</option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.productCode} - {item.productName}
                  </option>
                ))}
              </select>
            </label>
            {products.length === 0 ? <p className="text-xs text-amber-600 md:col-span-2">{copy.noProduct}</p> : null}

            <label className="text-sm text-zinc-700">
              {copy.productSpec}
              <input
                type="text"
                value={selectedProduct?.productSpec || ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.productCategory}
              <input
                type="text"
                value={selectedProduct?.categoryName || ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.plannedQty}
              <input
                type="number"
                min={0}
                required
                value={plannedQty}
                onChange={(e) => setPlannedQty(Number(e.target.value || 0))}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.dueDate}
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.processPlan}
              <select
                required
                value={processPlanId}
                onChange={(e) => setProcessPlanId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
              >
                <option value="">{copy.processPlan}</option>
                {processPlans.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.processName}
                  </option>
                ))}
              </select>
            </label>
            {processPlans.length === 0 ? <p className="text-xs text-amber-600 md:col-span-2">{copy.noProcess}</p> : null}

            <label className="text-sm text-zinc-700">
              {copy.processFactor}
              <input
                type="text"
                value={`${processFactor}%`}
                readOnly
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.processPlannedQty}
              <input
                type="text"
                value={processPlannedQty}
                readOnly
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.department}
              <input
                type="text"
                value={selectedProcess?.departmentName || ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.workers}
              <input
                type="text"
                value={(selectedProcess?.defaultWorkers || []).join(", ")}
                readOnly
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </label>

            <label className="text-sm text-zinc-700 md:col-span-2">
              {copy.note}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                {copy.save}
              </button>
              {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
