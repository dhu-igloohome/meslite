"use client";

import { useEffect, useMemo, useState } from "react";
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

type WorkerOption = {
  id: string;
  name: string;
  departmentId: string;
};

const DEPARTMENTS_KEY = "meslite_departments";
const PROCESS_PLANS_KEY = "meslite_process_plans";
const WORKERS_KEY = "meslite_workers";

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
    addDepartmentInSettings: "去系统设置新增部门",
    productionMinutes: "生产工时（分钟）",
    workers: "生产人员",
    selectWorkersHint: "点击选择系统设置中的生产人员；选错可点击已选项删除。",
    noWorkers: "当前部门暂无可选人员，请先去系统设置维护。",
    selectedWorkers: "已选择人员",
    save: "保存",
    update: "更新",
    edit: "编辑",
    remove: "删除",
    actions: "操作",
    cancelEdit: "取消编辑",
    deleteConfirm: "确认删除该工艺编制吗？",
    saveOk: "工艺编制保存成功。",
    updateOk: "工艺编制更新成功。",
  },
  en: {
    title: "Process Planning",
    subtitle: "Review existing plans and create a new process plan.",
    backLabel: "Back to Master Data",
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
    addDepartmentInSettings: "Add departments in System Settings",
    productionMinutes: "Production Time (minutes)",
    workers: "Production Workers",
    selectWorkersHint: "Select workers from System Settings. Click selected item to remove.",
    noWorkers: "No workers available for this department. Configure in System Settings first.",
    selectedWorkers: "Selected Workers",
    save: "Save",
    update: "Update",
    edit: "Edit",
    remove: "Delete",
    actions: "Actions",
    cancelEdit: "Cancel Edit",
    deleteConfirm: "Delete this process plan?",
    saveOk: "Process plan saved.",
    updateOk: "Process plan updated.",
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
  const [workerOptions, setWorkerOptions] = useState<WorkerOption[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(WORKERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as WorkerOption[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [processName, setProcessName] = useState("");
  const [note, setNote] = useState("");
  const [standardConfig, setStandardConfig] = useState(true);
  const [reportFactor, setReportFactor] = useState(100);
  const [departmentId, setDepartmentId] = useState("");
  const [productionMinutes, setProductionMinutes] = useState(0);
  const [workers, setWorkers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const syncFromSystemSettings = () => {
      const rawDepartments = window.localStorage.getItem(DEPARTMENTS_KEY);
      const rawWorkers = window.localStorage.getItem(WORKERS_KEY);

      let nextDepartments: Department[] = [];
      let nextWorkers: WorkerOption[] = [];

      try {
        const parsed = rawDepartments ? (JSON.parse(rawDepartments) as Department[]) : [];
        nextDepartments = Array.isArray(parsed) ? parsed : [];
      } catch {
        nextDepartments = [];
      }

      try {
        const parsed = rawWorkers ? (JSON.parse(rawWorkers) as WorkerOption[]) : [];
        nextWorkers = Array.isArray(parsed) ? parsed : [];
      } catch {
        nextWorkers = [];
      }

      setDepartments(nextDepartments);
      setWorkers((prev) =>
        prev.filter((name) =>
          nextWorkers.some((worker) => worker.name === name && (!departmentId || worker.departmentId === departmentId)),
        ),
      );
      setWorkerOptions(nextWorkers);
    };

    syncFromSystemSettings();
    window.addEventListener("storage", syncFromSystemSettings);
    window.addEventListener("focus", syncFromSystemSettings);
    document.addEventListener("visibilitychange", syncFromSystemSettings);
    return () => {
      window.removeEventListener("storage", syncFromSystemSettings);
      window.removeEventListener("focus", syncFromSystemSettings);
      document.removeEventListener("visibilitychange", syncFromSystemSettings);
    };
  }, [departmentId]);

  const savePlans = (next: ProcessPlan[]) => {
    setPlans(next);
    localStorage.setItem(PROCESS_PLANS_KEY, JSON.stringify(next));
  };

  const toggleWorker = (name: string) => {
    setWorkers((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  const resetForm = () => {
    setProcessName("");
    setNote("");
    setStandardConfig(true);
    setReportFactor(100);
    setDepartmentId("");
    setProductionMinutes(0);
    setWorkers([]);
    setEditingPlanId(null);
  };

  const editPlan = (plan: ProcessPlan) => {
    setProcessName(plan.processName);
    setNote(plan.note);
    setStandardConfig(plan.standardConfig);
    setReportFactor(plan.reportFactor);
    setDepartmentId(plan.departmentId);
    setProductionMinutes(plan.productionMinutes);
    setWorkers(plan.defaultWorkers);
    setEditingPlanId(plan.id);
    setMessage("");
  };

  const removePlan = (id: string) => {
    if (!window.confirm(copy.deleteConfirm)) {
      return;
    }
    const next = plans.filter((item) => item.id !== id);
    savePlans(next);
    if (editingPlanId === id) {
      resetForm();
    }
    setMessage("");
  };

  const savePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const departmentName = departments.find((d) => d.id === departmentId)?.name || "";
    const validWorkers = workers.map((w) => w.trim()).filter(Boolean);
    const item: ProcessPlan = {
      id: editingPlanId ?? `proc_${Date.now()}`,
      processName: processName.trim(),
      note: note.trim(),
      standardConfig,
      reportFactor,
      departmentId,
      departmentName,
      productionMinutes,
      defaultWorkers: validWorkers,
      createdAt: editingPlanId
        ? plans.find((plan) => plan.id === editingPlanId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };
    const next = editingPlanId
      ? plans.map((plan) => (plan.id === editingPlanId ? item : plan))
      : [...plans, item];
    savePlans(next);
    setMessage(editingPlanId ? copy.updateOk : copy.saveOk);
    resetForm();
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
                    <th className="px-2 py-2">{copy.actions}</th>
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
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => editPlan(item)}
                            className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700"
                          >
                            {copy.edit}
                          </button>
                          <button
                            type="button"
                            onClick={() => removePlan(item.id)}
                            className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-700"
                          >
                            {copy.remove}
                          </button>
                        </div>
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
                  onChange={(e) => {
                    const nextDepartmentId = e.target.value;
                    setDepartmentId(nextDepartmentId);
                    setWorkers((prev) =>
                      prev.filter((name) =>
                        workerOptions.some(
                          (option) =>
                            option.name === name && (!nextDepartmentId || option.departmentId === nextDepartmentId),
                        ),
                      ),
                    );
                  }}
                  aria-label={copy.department}
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
                  onClick={() => router.push("/meslite/system-settings")}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs text-zinc-700"
                >
                  {copy.addDepartmentInSettings}
                </button>
              </div>
            </div>

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
              <p className="mt-1 text-xs text-zinc-500">{copy.selectWorkersHint}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {workerOptions
                  .filter((item) => !departmentId || item.departmentId === departmentId)
                  .map((item) => {
                    const selected = workers.includes(item.name);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleWorker(item.name)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
              </div>
              {workerOptions.filter((item) => !departmentId || item.departmentId === departmentId).length === 0 ? (
                <p className="mt-2 text-xs text-amber-700">{copy.noWorkers}</p>
              ) : null}

              {workers.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-500">{copy.selectedWorkers}:</span>
                  {workers.map((worker) => (
                    <button
                      key={worker}
                      type="button"
                      onClick={() => toggleWorker(worker)}
                      className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs text-zinc-700"
                    >
                      {worker} ×
                    </button>
                  ))}
                </div>
              ) : null}
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  {editingPlanId ? copy.update : copy.save}
                </button>
                {editingPlanId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
                  >
                    {copy.cancelEdit}
                  </button>
                ) : null}
              </div>
              {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
