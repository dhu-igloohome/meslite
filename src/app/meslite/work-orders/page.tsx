"use client";

import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Download, Printer, QrCode, X } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
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
  processRouteSteps?: {
    stepNo: number;
    processPlanId: string;
    processPlanName: string;
    departmentName: string;
    reportFactor: number;
  }[];
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
  processRouteSteps?: {
    stepNo: number;
    processPlanId: string;
    processPlanName: string;
    reportFactor: number;
    processPlannedQty: number;
    departmentName: string;
  }[];
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
    processRoute: "工艺路线",
    routeStep: "步骤",
    processFactor: "报工系数",
    processPlannedQty: "工序计划数量（自动）",
    routePlannedQty: "路线工序计划数量",
    department: "生产部门",
    workers: "默认生产人员",
    note: "备注",
    save: "保存",
    saveOk: "订单/工单创建成功。",
    noCategory: "请先在基础数据里创建“订单/工单分类”。",
    noProduct: "请先在基础数据里创建产品。",
    noProcess: "请先在基础数据里创建工艺编制。",
    noRoute: "该产品未配置工艺路线，请先在产品中心配置。",
    workOrderNo: "工单号",
    productName: "产品名称",
    processName: "工序名称",
    createdAt: "创建时间",
    qrCol: "二维码",
    qrPreviewTitle: "订单/工单二维码",
    qrGenerating: "生成二维码中...",
    qrPrint: "打印",
    qrDownload: "下载PNG",
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
    processRoute: "Process Route",
    routeStep: "Step",
    processFactor: "Reporting Factor",
    processPlannedQty: "Process Planned Qty (auto)",
    routePlannedQty: "Route Process Planned Qty",
    department: "Production Department",
    workers: "Default Workers",
    note: "Note",
    save: "Save",
    saveOk: "Record created successfully.",
    noCategory: "Create order/work-order categories in master data first.",
    noProduct: "Create products in master data first.",
    noProcess: "Create process plans in master data first.",
    noRoute: "This product has no process route. Configure it in Product Center first.",
    workOrderNo: "Work Order No.",
    productName: "Product Name",
    processName: "Process Name",
    createdAt: "Created At",
    qrCol: "QR",
    qrPreviewTitle: "Order/Work-Order QR",
    qrGenerating: "Generating QR...",
    qrPrint: "Print",
    qrDownload: "Download PNG",
  },
};

function nextWorkOrderNo(records: WorkOrderRecord[]) {
  const now = new Date();
  const day =
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const prefix = `PO${day}`;
  const maxNumber = records
    .filter((item) => item.workOrderNo.startsWith(prefix))
    .map((item) => Number.parseInt(item.workOrderNo.slice(prefix.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((acc, curr) => Math.max(acc, curr), 0);
  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
}

function nextRecordId(records: WorkOrderRecord[]) {
  const maxNumber = records
    .map((item) => Number.parseInt(item.id.replace(/^wo_/, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((acc, curr) => Math.max(acc, curr), 0);
  return `wo_${String(maxNumber + 1).padStart(6, "0")}`;
}

export default function WorkOrdersPage() {
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
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [qrPreviewRecord, setQrPreviewRecord] = useState<WorkOrderRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const selectedProduct = products.find((item) => item.id === productId);
  const selectedRoute =
    selectedProduct?.processRouteSteps?.map((step) => ({
      ...step,
      processPlannedQty: Math.round(plannedQty * ((step.reportFactor ?? 100) / 100)),
    })) || [];
  const fallbackProcess = processPlans[0];
  const selectedProcess = selectedRoute.length > 0 ? null : fallbackProcess;

  const processFactor = selectedProcess?.reportFactor ?? 100;
  const processPlannedQty =
    selectedRoute.length > 0 ? selectedRoute.reduce((acc, item) => acc + item.processPlannedQty, 0) : Math.round(plannedQty * (processFactor / 100));

  const saveRecords = (next: WorkOrderRecord[]) => {
    setRecords(next);
    localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    let isCancelled = false;
    const generateQr = async () => {
      if (!qrPreviewRecord) {
        setQrDataUrl("");
        return;
      }
      try {
        const origin = window.location.origin;
        const payload = `${origin}/meslite/scan-query?workOrderNo=${encodeURIComponent(qrPreviewRecord.workOrderNo)}`;
        const dataUrl = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 260,
        });
        if (!isCancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        if (!isCancelled) {
          setQrDataUrl("");
        }
      }
    };
    generateQr();
    return () => {
      isCancelled = true;
    };
  }, [qrPreviewRecord]);

  const printQr = () => {
    if (!qrPreviewRecord || !qrDataUrl) {
      return;
    }
    const win = window.open("", "_blank", "width=420,height=520");
    if (!win) {
      return;
    }
    win.document.write(`<!doctype html>
      <html>
      <head>
        <title>${qrPreviewRecord.workOrderNo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; text-align: center; }
          img { width: 260px; height: 260px; }
          .no { margin-top: 12px; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <img src="${qrDataUrl}" alt="QR code" />
        <div class="no">${qrPreviewRecord.workOrderNo}</div>
      </body>
      </html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const downloadQr = () => {
    if (!qrPreviewRecord || !qrDataUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${qrPreviewRecord.workOrderNo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct?.processRouteSteps || selectedProduct.processRouteSteps.length === 0) {
      setMessage(copy.noRoute);
      return;
    }
    const categoryName = categories.find((item) => item.id === categoryId)?.name || "";
    const mainRouteStep = selectedRoute[0];
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
      processPlanId: mainRouteStep?.processPlanId || selectedProcess?.id || "",
      processName:
        selectedRoute.length > 0
          ? selectedRoute.map((step) => step.processPlanName).join(" -> ")
          : selectedProcess?.processName || "",
      processReportFactor: mainRouteStep?.reportFactor ?? processFactor,
      processPlannedQty,
      plannedQty,
      dueDate,
      departmentName: mainRouteStep?.departmentName || selectedProcess?.departmentName || "",
      workers: selectedProcess?.defaultWorkers || [],
      processRouteSteps:
        selectedRoute.length > 0
          ? selectedRoute.map((step) => ({
              stepNo: step.stepNo,
              processPlanId: step.processPlanId,
              processPlanName: step.processPlanName,
              reportFactor: step.reportFactor,
              processPlannedQty: step.processPlannedQty,
              departmentName: step.departmentName || "",
            }))
          : undefined,
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
    setNote("");
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <BackButton label={copy.backLabel} fallbackHref="/meslite" className="mb-3" />
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
                    <th className="px-2 py-2">{copy.qrCol}</th>
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
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setQrPreviewRecord(item)}
                          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 transition hover:bg-zinc-50"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          {copy.qrCol}
                        </button>
                      </td>
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

            {selectedRoute.length > 0 ? (
              <div className="text-sm text-zinc-700 md:col-span-2">
                <p>{copy.processRoute}</p>
                <div className="mt-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50">
                  <table className="w-full text-left text-xs">
                    <thead className="text-zinc-500">
                      <tr>
                        <th className="px-3 py-2">{copy.routeStep}</th>
                        <th className="px-3 py-2">{copy.processName}</th>
                        <th className="px-3 py-2">{copy.processFactor}</th>
                        <th className="px-3 py-2">{copy.routePlannedQty}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRoute.map((step) => (
                        <tr key={`${step.processPlanId}_${step.stepNo}`} className="border-t border-zinc-200 text-zinc-700">
                          <td className="px-3 py-2">{step.stepNo}</td>
                          <td className="px-3 py-2">{step.processPlanName}</td>
                          <td className="px-3 py-2">{step.reportFactor}%</td>
                          <td className="px-3 py-2">{step.processPlannedQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-600 md:col-span-2">
                {selectedProduct ? copy.noRoute : copy.noProduct}
              </p>
            )}

            <label className="text-sm text-zinc-700">
              {copy.processFactor}
              <input
                type="text"
                value={selectedRoute.length > 0 ? "-" : `${processFactor}%`}
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

      {qrPreviewRecord ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">{copy.qrPreviewTitle}</h3>
              <button
                type="button"
                onClick={() => setQrPreviewRecord(null)}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600"
                aria-label="Close QR Preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-zinc-600">{qrPreviewRecord.workOrderNo}</p>
            <div className="flex justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={`QR ${qrPreviewRecord.workOrderNo}`}
                  width={224}
                  height={224}
                  unoptimized
                  className="h-56 w-56"
                />
              ) : (
                <div className="flex h-56 w-56 items-center justify-center text-xs text-zinc-500">{copy.qrGenerating}</div>
              )}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={downloadQr}
                disabled={!qrDataUrl}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                {copy.qrDownload}
              </button>
              <button
                type="button"
                onClick={printQr}
                disabled={!qrDataUrl}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
              >
                <Printer className="h-3.5 w-3.5" />
                {copy.qrPrint}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
