"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, PlusCircle, Trash2, Workflow } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { CardContainer } from "@/components/ui/card-container";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { SelectInput, TextInput } from "@/components/ui/form-elements";
import { PageShell } from "@/components/ui/page-shell";
import { useMesliteSession } from "../../_lib/session";

type ProcessPlan = {
  id: string;
  processName: string;
  reportFactor: number;
  departmentId: string;
  departmentName: string;
  productionMinutes: number;
  defaultWorkers: string[];
};

type RouteTemplateStep = {
  stepNo: number;
  processPlanId: string;
  processPlanName: string;
  reportFactor: number;
  departmentName: string;
  defaultWorkers: string[];
  stdMinutes: number;
};

type RouteTemplate = {
  id: string;
  code: string;
  name: string;
  version: string;
  status: "active" | "draft" | "inactive";
  steps: RouteTemplateStep[];
  createdAt: string;
};

const PROCESS_PLANS_KEY = "meslite_process_plans";
const ROUTE_TEMPLATES_KEY = "meslite_route_templates";

const text = {
  zh: {
    title: "工艺库管理",
    subtitle: "维护可复用的工艺库模板，支持单工序与多工序路线。",
    backLabel: "返回基础数据",
    listTitle: "已有工艺库",
    emptyList: "暂无工艺库模板",
    createTitle: "创建工艺库模板",
    code: "模板编码",
    codePlaceholder: "例如：RT-CNC-ALU",
    name: "模板名称",
    namePlaceholder: "例如：铝壳CNC标准路线",
    version: "版本",
    versionPlaceholder: "例如：v1",
    status: "状态",
    statusOptions: {
      active: "生效",
      draft: "草稿",
      inactive: "停用",
    },
    addStep: "添加工序步骤",
    processPlan: "工艺编制",
    steps: "模板步骤",
    stepEmpty: "请至少添加 1 个工序步骤（单工序模板也合法）。",
    stepNo: "步骤",
    processName: "工序名称",
    reportFactor: "报工系数",
    department: "部门",
    workers: "默认人员",
    stdMinutes: "标准工时(分钟)",
    save: "保存模板",
    saveOk: "工艺库模板保存成功。",
    duplicate: "模板编码+版本已存在，请更换后重试。",
  },
  en: {
    title: "Route Template Library",
    subtitle: "Maintain reusable route templates supporting single-step and multi-step routes.",
    backLabel: "Back to Master Data",
    listTitle: "Existing Route Templates",
    emptyList: "No route templates yet",
    createTitle: "Create Route Template",
    code: "Template Code",
    codePlaceholder: "e.g. RT-CNC-ALU",
    name: "Template Name",
    namePlaceholder: "e.g. Aluminum CNC Standard Route",
    version: "Version",
    versionPlaceholder: "e.g. v1",
    status: "Status",
    statusOptions: {
      active: "Active",
      draft: "Draft",
      inactive: "Inactive",
    },
    addStep: "Add Process Step",
    processPlan: "Process Plan",
    steps: "Template Steps",
    stepEmpty: "Add at least 1 process step (single-step template is valid).",
    stepNo: "Step",
    processName: "Process",
    reportFactor: "Factor",
    department: "Department",
    workers: "Default Workers",
    stdMinutes: "Std Minutes",
    save: "Save Template",
    saveOk: "Route template saved.",
    duplicate: "Code + version already exists. Please change and retry.",
  },
};

export default function RouteTemplatesPage() {
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);

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

  const [templates, setTemplates] = useState<RouteTemplate[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(ROUTE_TEMPLATES_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as RouteTemplate[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("v1");
  const [status, setStatus] = useState<RouteTemplate["status"]>("active");
  const [processPlanId, setProcessPlanId] = useState("");
  const [steps, setSteps] = useState<RouteTemplateStep[]>([]);
  const [message, setMessage] = useState("");

  const selectedPlan = processPlans.find((item) => item.id === processPlanId);

  const saveTemplates = (next: RouteTemplate[]) => {
    setTemplates(next);
    localStorage.setItem(ROUTE_TEMPLATES_KEY, JSON.stringify(next));
  };

  const addStep = () => {
    if (!selectedPlan) {
      return;
    }
    setSteps((prev) => [
      ...prev,
      {
        stepNo: prev.length + 1,
        processPlanId: selectedPlan.id,
        processPlanName: selectedPlan.processName,
        reportFactor: selectedPlan.reportFactor ?? 100,
        departmentName: selectedPlan.departmentName || "",
        defaultWorkers: selectedPlan.defaultWorkers || [],
        stdMinutes: selectedPlan.productionMinutes ?? 0,
      },
    ]);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    setSteps((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, idx) => ({ ...item, stepNo: idx + 1 }));
    });
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index).map((item, idx) => ({ ...item, stepNo: idx + 1 })));
  };

  const saveTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const normalizedVersion = version.trim();
    const normalizedName = name.trim();
    if (!normalizedCode || !normalizedName || !normalizedVersion || steps.length === 0) {
      return;
    }
    const duplicated = templates.some(
      (item) => item.code === normalizedCode && item.version.toLowerCase() === normalizedVersion.toLowerCase(),
    );
    if (duplicated) {
      setMessage(copy.duplicate);
      return;
    }
    const nextItem: RouteTemplate = {
      id: `rt_${Date.now()}`,
      code: normalizedCode,
      name: normalizedName,
      version: normalizedVersion,
      status,
      steps,
      createdAt: new Date().toISOString(),
    };
    saveTemplates([...templates, nextItem]);
    setCode("");
    setName("");
    setVersion("v1");
    setStatus("active");
    setSteps([]);
    setProcessPlanId("");
    setMessage(copy.saveOk);
  };

  if (!session) {
    return null;
  }

  return (
    <PageShell containerClassName="max-w-7xl space-y-4">
      <CardContainer className="p-5">
        <BackButton label={copy.backLabel} fallbackHref="/meslite/master-data" className="mb-3" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{copy.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
      </CardContainer>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <CardContainer className="p-4 xl:col-span-3">
          <h2 className="text-lg font-semibold text-slate-900">{copy.listTitle}</h2>
          {templates.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{copy.emptyList}</p>
          ) : (
            <DataTable className="mt-3">
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>{copy.code}</DataTableHeaderCell>
                  <DataTableHeaderCell>{copy.name}</DataTableHeaderCell>
                  <DataTableHeaderCell>{copy.version}</DataTableHeaderCell>
                  <DataTableHeaderCell>{copy.status}</DataTableHeaderCell>
                  <DataTableHeaderCell>{copy.steps}</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {templates.map((item, index) => (
                  <DataTableRow key={item.id} striped={index % 2 === 1}>
                    <DataTableCell>{item.code}</DataTableCell>
                    <DataTableCell>{item.name}</DataTableCell>
                    <DataTableCell>{item.version}</DataTableCell>
                    <DataTableCell>{copy.statusOptions[item.status]}</DataTableCell>
                    <DataTableCell>{item.steps.length}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </CardContainer>

        <CardContainer className="p-4 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">{copy.createTitle}</h2>
          </div>

          <form className="grid grid-cols-1 gap-3" onSubmit={saveTemplate}>
            <label className="text-sm text-slate-700">
              {copy.code}
              <TextInput required value={code} onChange={(e) => setCode(e.target.value)} placeholder={copy.codePlaceholder} />
            </label>

            <label className="text-sm text-slate-700">
              {copy.name}
              <TextInput required value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.namePlaceholder} />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                {copy.version}
                <TextInput required value={version} onChange={(e) => setVersion(e.target.value)} placeholder={copy.versionPlaceholder} />
              </label>
              <label className="text-sm text-slate-700">
                {copy.status}
                <SelectInput value={status} onChange={(e) => setStatus(e.target.value as RouteTemplate["status"])}>
                  <option value="active">{copy.statusOptions.active}</option>
                  <option value="draft">{copy.statusOptions.draft}</option>
                  <option value="inactive">{copy.statusOptions.inactive}</option>
                </SelectInput>
              </label>
            </div>

            <div className="text-sm text-slate-700">
              <p>{copy.processPlan}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <SelectInput value={processPlanId} onChange={(e) => setProcessPlanId(e.target.value)} className="min-w-64">
                  <option value="">{copy.processPlan}</option>
                  {processPlans.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.processName}
                    </option>
                  ))}
                </SelectInput>
                <PrimaryButton type="button" onClick={addStep} disabled={!processPlanId} className="text-xs">
                  <PlusCircle className="h-4 w-4" />
                  {copy.addStep}
                </PrimaryButton>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">{copy.steps}</p>
              {steps.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">{copy.stepEmpty}</p>
              ) : (
                <DataTable className="mt-2">
                  <DataTableHead>
                    <tr>
                      <DataTableHeaderCell>{copy.stepNo}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.processName}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.reportFactor}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.department}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.workers}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.stdMinutes}</DataTableHeaderCell>
                      <DataTableHeaderCell>Actions</DataTableHeaderCell>
                    </tr>
                  </DataTableHead>
                  <DataTableBody>
                    {steps.map((step, index) => (
                      <DataTableRow key={`${step.processPlanId}_${index}`} striped={index % 2 === 1}>
                        <DataTableCell>{step.stepNo}</DataTableCell>
                        <DataTableCell>{step.processPlanName}</DataTableCell>
                        <DataTableCell>{step.reportFactor}%</DataTableCell>
                        <DataTableCell>{step.departmentName || "-"}</DataTableCell>
                        <DataTableCell>{step.defaultWorkers.join(", ") || "-"}</DataTableCell>
                        <DataTableCell>{step.stdMinutes}</DataTableCell>
                        <DataTableCell>
                          <div className="flex flex-wrap gap-1">
                            <SecondaryButton
                              type="button"
                              onClick={() => moveStep(index, "up")}
                              className="min-h-8 px-2 py-1 text-xs"
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </SecondaryButton>
                            <SecondaryButton
                              type="button"
                              onClick={() => moveStep(index, "down")}
                              className="min-h-8 px-2 py-1 text-xs"
                              disabled={index === steps.length - 1}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </SecondaryButton>
                            <SecondaryButton type="button" onClick={() => removeStep(index)} className="min-h-8 px-2 py-1 text-xs text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </SecondaryButton>
                          </div>
                        </DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTable>
              )}
            </div>

            <div>
              <PrimaryButton type="submit">{copy.save}</PrimaryButton>
              {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
            </div>
          </form>
        </CardContainer>
      </div>
    </PageShell>
  );
}
