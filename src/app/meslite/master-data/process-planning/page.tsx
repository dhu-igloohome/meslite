"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMesliteSession } from "../../_lib/session";

type Department = {
  id: string;
  name: string;
};

type ProcessPlan = {
  id: string;
  processName: string;
  note: string;
  standardConfig: boolean;
  reportFactor: number;
  departmentId: string;
  departmentName: string;
  productionMinutes: number;
  defaultWorkers: string[];
  createdAt: string;
};

const DEPARTMENTS_KEY = "meslite_departments";
const PROCESS_PLANS_KEY = "meslite_process_plans";

const text = {
  zh: {
    title: "工艺编制",
    subtitle: "查看已有工艺编制并创建新工艺。",
    backLabel: "返回基础数据",
    existingList: "已有工艺编制",
    empty: "暂无工艺编制",
    createTitle: "创建新的工艺编制",
    processName: "工序名称",
    note: "备注",
    standardConfig: "标准配置",
    standardHint: "若产品使用该工艺编制，则默认使用标准配置，可在编辑产品时更改。",
    reportFactor: "报工系数（%）",
    reportHint: "创建订单/工单时，计划数量 * 报工系数 = 该工序计划数量。",
    department: "生产部门",
    setDepartment: "设置部门",
    newDepartment: "新建部门",
    departmentName: "部门名称",
    confirmDepartment: "确认",
    productionMinutes: "生产工时（分钟）",
    workers: "生产人员",
    addWorker: "+ 添加生产人员",
    workerPlaceholder: "请输入人员名称",
    save: "保存",
    saveOk: "工艺编制保存成功。",
    backLabel: "返回基础数据",
  },
  en: {
    title: "Process Planning",
    subtitle: "Review existing plans and create a new process plan.",
    existingList: "Existing Process Plans",
    empty: "No process plans yet",
    createTitle: "Create New Process Plan",
    processName: "Process Name",
    note: "Note",
    standardConfig: "Standard Configuration",
    standardHint:
      "If a product uses this process, standard configuration is selected by default and can be changed when editing product.",
    reportFactor: "Reporting Factor (%)",
    reportHint:
      "When creating order/work order, planned quantity * reporting factor = this process planned quantity.",
    department: "Production Department",
    setDepartment: "Setup Department",
    newDepartment: "Create Department",
    departmentName: "Department Name",
    confirmDepartment: "Confirm",
    productionMinutes: "Production Time (minutes)",
    workers: "Production Workers",
    addWorker: "+ Add Worker",
    workerPlaceholder: "Enter worker name",
    save: "Save",
    saveOk: "Process plan saved.",
    backLabel: "Back to Master Data",
  },
};

export default function ProcessPlanningPage() {
  const router = useRouter();
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);

  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(DEPARTMENTS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as Department[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [plans, setPlans] = useState<ProcessPlan[]>(() => {
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

  const [showDepartmentEditor, setShowDepartmentEditor] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");

  const [processName, setProcessName] = useState("");
  const [note, setNote] = useState("");
  const [standardConfig, setStandardConfig] = useState(true);
  const [reportFactor, setReportFactor] = useState(100);
  const [departmentId, setDepartmentId] = useState("");
  const [productionMinutes, setProductionMinutes] = useState(0);
  const [workers, setWorkers] = useState<string[]>([""]);
  const [message, setMessage] = useState("");

  const saveDepartments = (next: Department[]) => {
    setDepartments(next);
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(next));
  };

  const savePlans = (next: ProcessPlan[]) => {
    setPlans(next);
    localStorage.setItem(PROCESS_PLANS_KEY, JSON.stringify(next));
  };

  const createDepartment = () => {
    const name = newDepartmentName.trim();
    if (!name) {
      return;
    }
    const item: Department = { id: `dept_${Date.now()}`, name };
    const next = [...departments, item];
    saveDepartments(next);
    setDepartmentId(item.id);
    setNewDepartmentName("");
    setShowDepartmentEditor(false);
  };

  const updateWorker = (index: number, value: string) => {
    setWorkers((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addWorker = () => {
    setWorkers((prev) => [...prev, ""]);
  };

  const savePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const departmentName = departments.find((d) => d.id === departmentId)?.name || "";
    const validWorkers = workers.map((w) => w.trim()).filter(Boolean);
    const item: ProcessPlan = {
      id: `proc_${Date.now()}`,
      processName: processName.trim(),
      note: note.trim(),
      standardConfig,
      reportFactor,
      departmentId,
      departmentName,
      productionMinutes,
      defaultWorkers: validWorkers,
      createdAt: new Date().toISOString(),
    };
    const next = [...plans, item];
    savePlans(next);
    setMessage(copy.saveOk);
    setProcessName("");
    setNote("");
    setStandardConfig(true);
    setReportFactor(100);
    setDepartmentId("");
    setProductionMinutes(0);
    setWorkers([""]);
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
            onClick={() => router.push("/meslite/master-data")}
            className="mb-3 rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600"
          >
            {copy.backLabel}
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{copy.subtitle}</p>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.existingList}</h2>
          {plans.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">{copy.empty}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="px-2 py-2">{copy.processName}</th>
                    <th className="px-2 py-2">{copy.department}</th>
                    <th className="px-2 py-2">{copy.reportFactor}</th>
                    <th className="px-2 py-2">{copy.productionMinutes}</th>
                    <th className="px-2 py-2">{copy.workers}</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((item) => (
                    <tr key={item.id} className="border-t border-zinc-100 text-zinc-700">
                      <td className="px-2 py-2">{item.processName}</td>
                      <td className="px-2 py-2">{item.departmentName || "-"}</td>
                      <td className="px-2 py-2">{item.reportFactor}%</td>
                      <td className="px-2 py-2">{item.productionMinutes}</td>
                      <td className="px-2 py-2">{item.defaultWorkers.join(", ") || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h2 className="text-xl font-semibold text-zinc-900">{copy.createTitle}</h2>
          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={savePlan}>
            <label className="text-sm text-zinc-700">
              {copy.processName}
              <input
                type="text"
                required
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.reportFactor}
              <input
                type="number"
                min={1}
                value={reportFactor}
                onChange={(e) => setReportFactor(Number(e.target.value || 100))}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>
            <p className="text-xs text-zinc-500 md:col-span-2">{copy.reportHint}</p>

            <div className="text-sm text-zinc-700 md:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  id="standardConfig"
                  type="checkbox"
                  checked={standardConfig}
                  onChange={(e) => setStandardConfig(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <label htmlFor="standardConfig">{copy.standardConfig}</label>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{copy.standardHint}</p>
            </div>

            <div className="text-sm text-zinc-700 md:col-span-2">
              <p>{copy.department}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="min-w-64 rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
                >
                  <option value="">{copy.department}</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowDepartmentEditor((prev) => !prev)}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs text-zinc-700"
                >
                  {copy.setDepartment}
                </button>
              </div>
            </div>

            {showDepartmentEditor ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 md:col-span-2">
                <p className="text-sm font-medium text-zinc-800">{copy.newDepartment}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    placeholder={copy.departmentName}
                    className="min-w-64 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={createDepartment}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white"
                  >
                    {copy.confirmDepartment}
                  </button>
                </div>
              </div>
            ) : null}

            <label className="text-sm text-zinc-700">
              {copy.productionMinutes}
              <input
                type="number"
                min={0}
                required
                value={productionMinutes}
                onChange={(e) => setProductionMinutes(Number(e.target.value || 0))}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <div className="text-sm text-zinc-700 md:col-span-2">
              <p>{copy.workers}</p>
              <div className="mt-1 grid gap-2">
                {workers.map((worker, index) => (
                  <input
                    key={`${index}_${worker}`}
                    type="text"
                    value={worker}
                    onChange={(e) => updateWorker(index, e.target.value)}
                    placeholder={copy.workerPlaceholder}
                    className="rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addWorker}
                className="mt-2 rounded-full border border-zinc-300 px-4 py-1.5 text-xs text-zinc-700"
              >
                {copy.addWorker}
              </button>
            </div>

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
