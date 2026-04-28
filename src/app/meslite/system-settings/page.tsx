"use client";

import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { useMesliteSession } from "../_lib/session";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  workOrderView: boolean;
  reportView: boolean;
  userOperation: boolean;
};

type PendingUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  method: "invite" | "scan" | "manual";
  createdAt: string;
};

type OperationLog = {
  id: string;
  action: string;
  detail: string;
  operator: string;
  createdAt: string;
};

type Department = {
  id: string;
  name: string;
};

type Worker = {
  id: string;
  name: string;
  departmentId: string;
};

type ProcessPlan = {
  id: string;
  processName: string;
  departmentId: string;
  departmentName?: string;
  defaultWorkers: string[];
};

type DeleteModalState =
  | { kind: "department"; departmentId: string; affectedPlans: ProcessPlan[] }
  | { kind: "worker"; workerId: string; affectedPlans: ProcessPlan[] };

const USERS_KEY = "meslite_users";
const PENDING_USERS_KEY = "meslite_pending_users";
const LOGS_KEY = "meslite_operation_logs";
const DEPARTMENTS_KEY = "meslite_departments";
const WORKERS_KEY = "meslite_workers";
const PROCESS_PLANS_KEY = "meslite_process_plans";

const PRESERVE_KEYS = [
  "meslite_team_settings",
  USERS_KEY,
  PENDING_USERS_KEY,
  "meslite_departments",
  WORKERS_KEY,
  "meslite_process_plans",
  "meslite_defect_categories",
  "meslite_order_workorder_categories",
  "meslite_product_categories",
  "meslite_products",
];

const CLEAR_KEYS = [
  "meslite_work_orders",
  "meslite_tasks",
  "meslite_reports",
  "meslite_report_records",
];

function nextId(prefix: string, ids: string[]) {
  const max = ids
    .map((id) => Number.parseInt(id.replace(`${prefix}_`, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((acc, curr) => Math.max(acc, curr), 0);
  return `${prefix}_${String(max + 1).padStart(6, "0")}`;
}

const text = {
  zh: {
    title: "系统设置",
    subtitle: "用户与权限管理、审批加入、操作日志与初始化。",
    backLabel: "返回首页",
    addUser: "添加用户",
    departmentSettings: "部门管理",
    addDepartment: "新增部门",
    departmentNamePlaceholder: "输入部门名称",
    workerSettings: "生产人员管理",
    workerNamePlaceholder: "输入人员名称",
    workerDepartmentPlaceholder: "选择所属部门",
    addWorker: "新增人员",
    updateWorker: "更新人员",
    cancelEditWorker: "取消编辑",
    editWorker: "编辑",
    departmentForceDeleteConfirm: "该部门已被 {count} 条工艺编制引用，确认删除并清理关联吗？",
    workerForceDeleteConfirm: "该人员已被 {count} 条工艺编制引用，确认删除并从工艺编制中移除吗？",
    affectedPlansPrefix: "受影响工艺：",
    deleteDialogTitleDepartment: "删除部门",
    deleteDialogTitleWorker: "删除生产人员",
    confirmDestructiveDelete: "确认删除并清理",
    cancelDelete: "取消",
    unnamedPlan: "（未命名工艺）",
    invite: "转发邀请好友",
    scanJoin: "扫码加入",
    manualAdd: "手动添加",
    name: "姓名",
    email: "邮箱",
    department: "部门",
    confirmAdd: "确认添加",
    pending: "审批加入（待审批用户）",
    approve: "通过",
    reject: "拒绝",
    userManagement: "用户管理",
    workOrderPermission: "工单查看权限",
    reportPermission: "报工查看权限",
    operationPermission: "用户操作权限",
    logs: "操作日志",
    initData: "初始化数据",
    initHint:
      "初始化后将保留团队设置与用户数据，并保留基础资料（工序、不良品分类、工单分类、产品分类、产品）。",
    doInit: "执行初始化",
    initDone: "初始化完成。",
  },
  en: {
    title: "System Settings",
    subtitle: "User permissions, join approval, operation logs and data initialization.",
    backLabel: "Back to Dashboard",
    addUser: "Add User",
    departmentSettings: "Department Management",
    addDepartment: "Add Department",
    departmentNamePlaceholder: "Enter department name",
    workerSettings: "Production Worker Management",
    workerNamePlaceholder: "Enter worker name",
    workerDepartmentPlaceholder: "Select department",
    addWorker: "Add Worker",
    updateWorker: "Update Worker",
    cancelEditWorker: "Cancel Edit",
    editWorker: "Edit",
    departmentForceDeleteConfirm:
      "This department is referenced by {count} process plans. Delete anyway and clean references?",
    workerForceDeleteConfirm:
      "This worker is referenced by {count} process plans. Delete anyway and remove from plans?",
    affectedPlansPrefix: "Affected plans:",
    deleteDialogTitleDepartment: "Delete department",
    deleteDialogTitleWorker: "Delete worker",
    confirmDestructiveDelete: "Delete and clean up",
    cancelDelete: "Cancel",
    unnamedPlan: "(Unnamed plan)",
    invite: "Forward Invite",
    scanJoin: "Join by Scan",
    manualAdd: "Manual Add",
    name: "Name",
    email: "Email",
    department: "Department",
    confirmAdd: "Confirm Add",
    pending: "Join Approval (Pending Users)",
    approve: "Approve",
    reject: "Reject",
    userManagement: "User Management",
    workOrderPermission: "Work Order View",
    reportPermission: "Report View",
    operationPermission: "User Operation",
    logs: "Operation Logs",
    initData: "Initialize Data",
    initHint:
      "Initialization keeps team settings, user data, and master data (processes, defect categories, work-order categories, product categories, products).",
    doInit: "Run Initialization",
    initDone: "Initialization completed.",
  },
};

function normalizeUsers(raw: unknown): ManagedUser[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter((item) => typeof item === "object" && item !== null)
    .map((item, index) => {
      const user = item as Record<string, unknown>;
      const email = String(user.email || `user${index + 1}@local`);
      const username = String(user.username || email.split("@")[0] || `user${index + 1}`);
      return {
        id: String(user.id || `usr_${index + 1}`),
        name: String(user.name || username),
        email,
        department: String(user.department || ""),
        workOrderView: Boolean(user.workOrderView ?? true),
        reportView: Boolean(user.reportView ?? true),
        userOperation: Boolean(user.userOperation ?? false),
      };
    });
}

function toStoredUsers(users: ManagedUser[]) {
  return users.map((user) => ({
    id: user.id,
    username: user.name,
    email: user.email,
    password: "temp123456",
    factoryName: "",
    role: user.userOperation ? "super_admin" : "owner",
    department: user.department,
    workOrderView: user.workOrderView,
    reportView: user.reportView,
    userOperation: user.userOperation,
    createdAt: new Date().toISOString(),
  }));
}

export default function SystemSettingsPage() {
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);

  const [users, setUsers] = useState<ManagedUser[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      return normalizeUsers(JSON.parse(raw));
    } catch {
      return [];
    }
  });

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = localStorage.getItem(PENDING_USERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as PendingUser[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [logs, setLogs] = useState<OperationLog[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as OperationLog[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = localStorage.getItem(DEPARTMENTS_KEY);
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
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [workers, setWorkers] = useState<Worker[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = localStorage.getItem(WORKERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as Worker[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [workerName, setWorkerName] = useState("");
  const [workerDepartmentId, setWorkerDepartmentId] = useState("");
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);

  useEffect(() => {
    if (!deleteModal) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeleteModal(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteModal]);

  const readProcessPlans = (): ProcessPlan[] => {
    const raw = localStorage.getItem(PROCESS_PLANS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as ProcessPlan[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const appendLog = (action: string, detail: string) => {
    const entry: OperationLog = {
      id: nextId(
        "log",
        logs.map((item) => item.id),
      ),
      action,
      detail,
      operator: session?.email || "system",
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...logs].slice(0, 100);
    setLogs(next);
    localStorage.setItem(LOGS_KEY, JSON.stringify(next));
  };

  const saveUsers = (next: ManagedUser[]) => {
    setUsers(next);
    localStorage.setItem(USERS_KEY, JSON.stringify(toStoredUsers(next)));
  };

  const savePendingUsers = (next: PendingUser[]) => {
    setPendingUsers(next);
    localStorage.setItem(PENDING_USERS_KEY, JSON.stringify(next));
  };

  const saveDepartments = (next: Department[]) => {
    setDepartments(next);
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(next));
  };

  const saveWorkers = (next: Worker[]) => {
    setWorkers(next);
    localStorage.setItem(WORKERS_KEY, JSON.stringify(next));
  };

  const saveProcessPlans = (next: ProcessPlan[]) => {
    localStorage.setItem(PROCESS_PLANS_KEY, JSON.stringify(next));
  };

  const addDepartment = () => {
    const name = newDepartmentName.trim();
    if (!name) {
      return;
    }
    if (departments.some((item) => item.name === name)) {
      return;
    }
    const next = [...departments, { id: `dept_${Date.now()}`, name }];
    saveDepartments(next);
    setNewDepartmentName("");
    appendLog("add_department", name);
  };

  const executeRemoveDepartment = (id: string) => {
    const plans = readProcessPlans();
    const affectedPlans = plans.filter((item) => item.departmentId === id);
    const target = departments.find((item) => item.id === id);
    const removedWorkerNames = workers.filter((item) => item.departmentId === id).map((item) => item.name);
    const next = departments.filter((item) => item.id !== id);
    saveDepartments(next);
    if (target) {
      appendLog("remove_department", target.name);
    }
    const filteredWorkers = workers.filter((item) => item.departmentId !== id);
    if (filteredWorkers.length !== workers.length) {
      saveWorkers(filteredWorkers);
    }
    if (affectedPlans.length > 0) {
      const nextPlans = plans.map((item) =>
        item.departmentId === id
          ? {
              ...item,
              departmentId: "",
              departmentName: "",
              defaultWorkers: item.defaultWorkers.filter((name) => !removedWorkerNames.includes(name)),
            }
          : item,
      );
      saveProcessPlans(nextPlans);
      appendLog("clean_department_refs", `${target?.name || id} (${affectedPlans.length})`);
    }
    setMessage("");
  };

  const requestRemoveDepartment = (id: string) => {
    const plans = readProcessPlans();
    const affectedPlans = plans.filter((item) => item.departmentId === id);
    if (affectedPlans.length > 0) {
      setDeleteModal({ kind: "department", departmentId: id, affectedPlans });
      return;
    }
    executeRemoveDepartment(id);
  };

  const upsertWorker = () => {
    const name = workerName.trim();
    if (!name || !workerDepartmentId) {
      return;
    }
    if (editingWorkerId) {
      const next = workers.map((item) =>
        item.id === editingWorkerId ? { ...item, name, departmentId: workerDepartmentId } : item,
      );
      saveWorkers(next);
      appendLog("update_worker", name);
    } else {
      const next = [...workers, { id: `worker_${Date.now()}`, name, departmentId: workerDepartmentId }];
      saveWorkers(next);
      appendLog("add_worker", name);
    }
    setWorkerName("");
    setWorkerDepartmentId("");
    setEditingWorkerId(null);
  };

  const startEditWorker = (id: string) => {
    const target = workers.find((item) => item.id === id);
    if (!target) {
      return;
    }
    setEditingWorkerId(target.id);
    setWorkerName(target.name);
    setWorkerDepartmentId(target.departmentId);
  };

  const executeRemoveWorker = (id: string) => {
    const target = workers.find((item) => item.id === id);
    if (!target) {
      return;
    }
    const plans = readProcessPlans();
    const affectedPlans = plans.filter((item) => item.defaultWorkers.includes(target.name));
    const next = workers.filter((item) => item.id !== id);
    saveWorkers(next);
    appendLog("remove_worker", target.name);
    if (affectedPlans.length > 0) {
      const nextPlans = plans.map((item) =>
        item.defaultWorkers.includes(target.name)
          ? { ...item, defaultWorkers: item.defaultWorkers.filter((name) => name !== target.name) }
          : item,
      );
      saveProcessPlans(nextPlans);
      appendLog("clean_worker_refs", `${target.name} (${affectedPlans.length})`);
    }
    if (editingWorkerId === id) {
      setEditingWorkerId(null);
      setWorkerName("");
      setWorkerDepartmentId("");
    }
    setMessage("");
  };

  const requestRemoveWorker = (id: string) => {
    const target = workers.find((item) => item.id === id);
    if (!target) {
      return;
    }
    const plans = readProcessPlans();
    const affectedPlans = plans.filter((item) => item.defaultWorkers.includes(target.name));
    if (affectedPlans.length > 0) {
      setDeleteModal({ kind: "worker", workerId: id, affectedPlans });
      return;
    }
    executeRemoveWorker(id);
  };

  const confirmDeleteModal = () => {
    if (!deleteModal) {
      return;
    }
    if (deleteModal.kind === "department") {
      executeRemoveDepartment(deleteModal.departmentId);
    } else {
      executeRemoveWorker(deleteModal.workerId);
    }
    setDeleteModal(null);
  };

  const addPendingUser = (method: PendingUser["method"], manualName?: string) => {
    const pending: PendingUser = {
      id: nextId(
        "pending",
        pendingUsers.map((item) => item.id),
      ),
      name: manualName?.trim() || `${copy.manualAdd}_${pendingUsers.length + 1}`,
      email: email.trim() || `pending${pendingUsers.length + 1}@local`,
      department: department.trim(),
      method,
      createdAt: new Date().toISOString(),
    };
    savePendingUsers([pending, ...pendingUsers]);
    appendLog("add_pending_user", `${pending.name} (${method})`);
  };

  const approvePending = (pendingId: string) => {
    const target = pendingUsers.find((item) => item.id === pendingId);
    if (!target) {
      return;
    }
    const nextUsers = [
      ...users,
      {
        id: nextId(
          "usr",
          users.map((item) => item.id),
        ),
        name: target.name,
        email: target.email,
        department: target.department,
        workOrderView: true,
        reportView: true,
        userOperation: false,
      },
    ];
    saveUsers(nextUsers);
    savePendingUsers(pendingUsers.filter((item) => item.id !== pendingId));
    appendLog("approve_user", target.name);
  };

  const rejectPending = (pendingId: string) => {
    const target = pendingUsers.find((item) => item.id === pendingId);
    savePendingUsers(pendingUsers.filter((item) => item.id !== pendingId));
    if (target) {
      appendLog("reject_user", target.name);
    }
  };

  const updatePermission = (
    id: string,
    field: "workOrderView" | "reportView" | "userOperation",
    value: boolean,
  ) => {
    const next = users.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    saveUsers(next);
  };

  const manualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    addPendingUser("manual", name);
    setName("");
    setEmail("");
    setDepartment("");
  };

  const initializeData = () => {
    CLEAR_KEYS.forEach((key) => localStorage.removeItem(key));
    PRESERVE_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        localStorage.setItem(key, value);
      }
    });
    setMessage(copy.initDone);
    appendLog("initialize_data", "preserve team/user/master data");
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

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.departmentSettings}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder={copy.departmentNamePlaceholder}
              className="min-w-64 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addDepartment}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              {copy.addDepartment}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {departments.length === 0 ? (
              <p className="text-sm text-zinc-500">-</p>
            ) : (
              departments.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
                >
                  {item.name}
                  <button
                    type="button"
                    onClick={() => requestRemoveDepartment(item.id)}
                    className="text-xs text-zinc-500 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.workerSettings}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder={copy.workerNamePlaceholder}
              className="min-w-56 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            />
            <select
              value={workerDepartmentId}
              onChange={(e) => setWorkerDepartmentId(e.target.value)}
              aria-label={copy.workerDepartmentPlaceholder}
              className="min-w-56 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">{copy.workerDepartmentPlaceholder}</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={upsertWorker}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              {editingWorkerId ? copy.updateWorker : copy.addWorker}
            </button>
            {editingWorkerId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingWorkerId(null);
                  setWorkerName("");
                  setWorkerDepartmentId("");
                }}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
              >
                {copy.cancelEditWorker}
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {workers.length === 0 ? (
              <p className="text-sm text-zinc-500">-</p>
            ) : (
              workers.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
                >
                  {item.name} · {departments.find((dep) => dep.id === item.departmentId)?.name || "-"}
                  <button
                    type="button"
                    onClick={() => startEditWorker(item.id)}
                    className="text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    {copy.editWorker}
                  </button>
                  <button
                    type="button"
                    onClick={() => requestRemoveWorker(item.id)}
                    className="text-xs text-zinc-500 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.addUser}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addPendingUser("invite")}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
            >
              {copy.invite}
            </button>
            <button
              type="button"
              onClick={() => addPendingUser("scan")}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
            >
              {copy.scanJoin}
            </button>
          </div>

          <form className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4" onSubmit={manualAdd}>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.name}
              className="rounded-xl border border-zinc-300 px-3 py-2"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.email}
              className="rounded-xl border border-zinc-300 px-3 py-2"
            />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder={copy.department}
              className="rounded-xl border border-zinc-300 px-3 py-2"
            />
            <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
              {copy.confirmAdd}
            </button>
          </form>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.pending}</h2>
          <div className="mt-3 space-y-2">
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">-</p>
            ) : (
              pendingUsers.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between rounded-xl border border-zinc-200 px-3 py-2"
                >
                  <p className="text-sm text-zinc-700">
                    {item.name} / {item.department || "-"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => approvePending(item.id)}
                      className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-white"
                    >
                      {copy.approve}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectPending(item.id)}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700"
                    >
                      {copy.reject}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.userManagement}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="px-2 py-2">{copy.name}</th>
                  <th className="px-2 py-2">{copy.department}</th>
                  <th className="px-2 py-2">{copy.workOrderPermission}</th>
                  <th className="px-2 py-2">{copy.reportPermission}</th>
                  <th className="px-2 py-2">{copy.operationPermission}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-100 text-zinc-700">
                    <td className="px-2 py-2">{user.name}</td>
                    <td className="px-2 py-2">{user.department || "-"}</td>
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={user.workOrderView}
                        onChange={(e) => updatePermission(user.id, "workOrderView", e.target.checked)}
                        aria-label={`${copy.workOrderPermission}-${user.name}`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={user.reportView}
                        onChange={(e) => updatePermission(user.id, "reportView", e.target.checked)}
                        aria-label={`${copy.reportPermission}-${user.name}`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={user.userOperation}
                        onChange={(e) => updatePermission(user.id, "userOperation", e.target.checked)}
                        aria-label={`${copy.operationPermission}-${user.name}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.logs}</h2>
          <div className="mt-3 space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-zinc-500">-</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
                  [{new Date(log.createdAt).toLocaleString()}] {log.operator} - {log.action}:{" "}
                  {log.detail}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">{copy.initData}</h2>
          <p className="mt-2 text-sm text-zinc-600">{copy.initHint}</p>
          <button
            type="button"
            onClick={initializeData}
            className="mt-3 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white"
          >
            {copy.doInit}
          </button>
          {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
        </section>
      </div>

      {deleteModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="meslite-delete-dialog-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={copy.cancelDelete}
            onClick={() => setDeleteModal(null)}
          />
          <div className="relative z-[101] flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 id="meslite-delete-dialog-title" className="text-lg font-semibold text-zinc-900">
                {deleteModal.kind === "department"
                  ? copy.deleteDialogTitleDepartment
                  : copy.deleteDialogTitleWorker}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                {deleteModal.kind === "department"
                  ? copy.departmentForceDeleteConfirm.replace("{count}", String(deleteModal.affectedPlans.length))
                  : copy.workerForceDeleteConfirm.replace("{count}", String(deleteModal.affectedPlans.length))}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{copy.affectedPlansPrefix}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-800">
                {deleteModal.affectedPlans.map((plan) => (
                  <li key={plan.id}>{plan.processName?.trim() || copy.unnamedPlan}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
              >
                {copy.cancelDelete}
              </button>
              <button
                type="button"
                onClick={confirmDeleteModal}
                className="rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
              >
                {copy.confirmDestructiveDelete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
