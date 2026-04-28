"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, FolderPlus, PackagePlus, PlusCircle, Trash2 } from "lucide-react";
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
import { SelectInput, TextAreaInput, TextInput } from "@/components/ui/form-elements";
import { useMesliteSession } from "../../_lib/session";

type ProductType = "part" | "component" | "auxiliary" | "finished";
type ProductCategory = {
  id: string;
  name: string;
};

type ProcessPlan = {
  id: string;
  processName: string;
  departmentName?: string;
  reportFactor?: number;
};

type ProductRouteStep = {
  stepNo: number;
  processPlanId: string;
  processPlanName: string;
  departmentName: string;
  reportFactor: number;
};

type ProductRecord = {
  id: string;
  productType: ProductType;
  productCode: string;
  productName: string;
  productSpec: string;
  categoryId: string;
  categoryName: string;
  imagePath: string;
  drawingPath: string;
  processPlanId: string;
  processPlanName: string;
  processRouteSteps: ProductRouteStep[];
  note: string;
  createdAt: string;
};

const CATEGORIES_KEY = "meslite_product_categories";
const PRODUCTS_KEY = "meslite_products";
const PROCESS_PLANS_KEY = "meslite_process_plans";

const typePrefix: Record<ProductType, string> = {
  part: "1",
  component: "2",
  auxiliary: "3",
  finished: "4",
};

const text = {
  zh: {
    title: "产品中心",
    subtitle: "创建产品并维护图纸、分类与工序编制方式。",
    backLabel: "返回基础数据",
    createTitle: "创建产品",
    imagePath: "产品图片路径或 URL",
    type: "产品类型",
    code: "产品编号/条码（自动生成）",
    name: "产品名称",
    spec: "产品规格",
    category: "产品分类",
    noCategory: "暂无产品分类，请先创建分类。",
    openCategorySetup: "新增产品分类",
    note: "备注",
    drawingPath: "产品图纸路径或 URL",
    processPlan: "工艺编制",
    noProcessPlan: "暂无工艺编制，请先创建工艺编制。",
    openProcessPlanning: "新增工艺编制",
    addStep: "添加到路线",
    routeSteps: "产品工艺路线",
    routeEmpty: "请至少添加一个工艺步骤。",
    stepNo: "步骤",
    routeProcess: "工艺",
    routeDepartment: "部门",
    routeFactor: "系数",
    save: "保存",
    saveOk: "产品保存成功。",
    typeOptions: {
      part: "零件（1xxxxx）",
      component: "组件（2xxxxx）",
      auxiliary: "辅料（3xxxxx）",
      finished: "成品（4xxxxx）",
    },
    productList: "已保存产品",
    emptyList: "暂无产品记录",
  },
  en: {
    title: "Product Center",
    subtitle: "Create products with drawings, categories and process setup mode.",
    backLabel: "Back to Master Data",
    createTitle: "Create Product",
    imagePath: "Product image path or URL",
    type: "Product type",
    code: "Product code/barcode (auto generated)",
    name: "Product name",
    spec: "Product spec",
    category: "Product category",
    noCategory: "No categories yet. Please create one first.",
    openCategorySetup: "Add Product Category",
    note: "Note",
    drawingPath: "Product drawing path or URL",
    processPlan: "Process plan",
    noProcessPlan: "No process plans yet. Please create one first.",
    openProcessPlanning: "Add Process Plan",
    addStep: "Add to Route",
    routeSteps: "Product Process Route",
    routeEmpty: "Add at least one process step.",
    stepNo: "Step",
    routeProcess: "Process",
    routeDepartment: "Department",
    routeFactor: "Factor",
    save: "Save",
    saveOk: "Product saved successfully.",
    typeOptions: {
      part: "Part (1xxxxx)",
      component: "Component (2xxxxx)",
      auxiliary: "Auxiliary (3xxxxx)",
      finished: "Finished (4xxxxx)",
    },
    productList: "Saved Products",
    emptyList: "No product records",
  },
};

function nextCode(type: ProductType, products: ProductRecord[]) {
  const prefix = typePrefix[type];
  const maxNumber = products
    .filter((p) => p.productCode.startsWith(prefix))
    .map((p) => Number.parseInt(p.productCode.slice(1), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((acc, curr) => Math.max(acc, curr), 0);

  const nextSerial = String(maxNumber + 1).padStart(5, "0");
  return `${prefix}${nextSerial}`;
}

export default function ProductCenterPage() {
  const router = useRouter();
  const { session, locale } = useMesliteSession();
  const copy = useMemo(() => text[locale], [locale]);

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as ProductCategory[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState<ProductRecord[]>(() => {
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
  const [productType, setProductType] = useState<ProductType>("part");
  const [imagePath, setImagePath] = useState("");
  const [productName, setProductName] = useState("");
  const [productSpec, setProductSpec] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [processPlanId, setProcessPlanId] = useState("");
  const [note, setNote] = useState("");
  const [drawingPath, setDrawingPath] = useState("");
  const [message, setMessage] = useState("");
  const [routeSteps, setRouteSteps] = useState<ProductRouteStep[]>([]);
  const productCode = useMemo(() => nextCode(productType, products), [productType, products]);

  const selectedProcessPlan = processPlans.find((item) => item.id === processPlanId);

  const saveCategories = (nextCategories: ProductCategory[]) => {
    setCategories(nextCategories);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(nextCategories));
  };

  const saveProducts = (nextProducts: ProductRecord[]) => {
    setProducts(nextProducts);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(nextProducts));
  };

  const saveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (routeSteps.length === 0) {
      setMessage(copy.routeEmpty);
      return;
    }
    const categoryName = categories.find((c) => c.id === categoryId)?.name || "";
    const item: ProductRecord = {
      id: `prod_${Date.now()}`,
      productType,
      productCode,
      productName: productName.trim(),
      productSpec: productSpec.trim(),
      categoryId,
      categoryName,
      imagePath: imagePath.trim(),
      drawingPath: drawingPath.trim(),
      processPlanId: routeSteps[0].processPlanId,
      processPlanName: routeSteps[0].processPlanName,
      processRouteSteps: routeSteps,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextProducts = [...products, item];
    saveProducts(nextProducts);
    setMessage(copy.saveOk);
    setProductName("");
    setProductSpec("");
    setImagePath("");
    setDrawingPath("");
    setNote("");
    setCategoryId("");
    setProcessPlanId("");
    setRouteSteps([]);
  };

  const addRouteStep = () => {
    if (!selectedProcessPlan) {
      return;
    }
    setRouteSteps((prev) => [
      ...prev,
      {
        stepNo: prev.length + 1,
        processPlanId: selectedProcessPlan.id,
        processPlanName: selectedProcessPlan.processName,
        departmentName: selectedProcessPlan.departmentName || "",
        reportFactor: selectedProcessPlan.reportFactor ?? 100,
      },
    ]);
  };

  const moveRouteStep = (index: number, direction: "up" | "down") => {
    setRouteSteps((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, idx) => ({ ...item, stepNo: idx + 1 }));
    });
  };

  const removeRouteStep = (index: number) => {
    setRouteSteps((prev) => prev.filter((_, i) => i !== index).map((item, idx) => ({ ...item, stepNo: idx + 1 })));
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <CardContainer className="p-5">
          <SecondaryButton onClick={() => router.push("/meslite/master-data")} className="mb-3">
            {copy.backLabel}
          </SecondaryButton>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
        </CardContainer>

        <CardContainer className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">{copy.createTitle}</h2>
          </div>

          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={saveProduct}>
            <label className="text-sm text-slate-700 md:col-span-2">
              {copy.imagePath}
              <TextInput type="text" value={imagePath} onChange={(e) => setImagePath(e.target.value)} />
            </label>

            <label className="text-sm text-slate-700">
              {copy.type}
              <SelectInput value={productType} onChange={(e) => setProductType(e.target.value as ProductType)}>
                <option value="part">{copy.typeOptions.part}</option>
                <option value="component">{copy.typeOptions.component}</option>
                <option value="auxiliary">{copy.typeOptions.auxiliary}</option>
                <option value="finished">{copy.typeOptions.finished}</option>
              </SelectInput>
            </label>

            <label className="text-sm text-slate-700">
              {copy.code}
              <TextInput type="text" value={productCode} readOnly className="bg-slate-50 text-slate-700" />
            </label>

            <label className="text-sm text-slate-700">
              {copy.name}
              <TextInput type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} />
            </label>

            <label className="text-sm text-slate-700">
              {copy.spec}
              <TextInput type="text" required value={productSpec} onChange={(e) => setProductSpec(e.target.value)} />
            </label>

            <div className="text-sm text-slate-700 md:col-span-2">
              <p>{copy.category}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <SelectInput
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  aria-label={copy.category}
                  className="min-w-64"
                >
                  <option value="">{copy.category}</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </SelectInput>
                <SecondaryButton
                  type="button"
                  onClick={() => router.push("/meslite/master-data/product-categories")}
                  className="text-xs"
                >
                  <FolderPlus className="h-4 w-4" />
                  {copy.openCategorySetup}
                </SecondaryButton>
              </div>
              {categories.length === 0 ? <p className="mt-2 text-xs text-amber-600">{copy.noCategory}</p> : null}
            </div>

            <label className="text-sm text-slate-700 md:col-span-2">
              {copy.note}
              <TextAreaInput value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </label>

            <label className="text-sm text-slate-700 md:col-span-2">
              {copy.drawingPath}
              <TextInput type="text" value={drawingPath} onChange={(e) => setDrawingPath(e.target.value)} />
            </label>

            <div className="text-sm text-slate-700 md:col-span-2">
              <p>{copy.processPlan}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <SelectInput
                  value={processPlanId}
                  onChange={(e) => setProcessPlanId(e.target.value)}
                  aria-label={copy.processPlan}
                  className="min-w-64"
                >
                  <option value="">{copy.processPlan}</option>
                  {processPlans.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.processName}
                    </option>
                  ))}
                </SelectInput>
                <SecondaryButton
                  type="button"
                  onClick={() => router.push("/meslite/master-data/process-planning")}
                  className="text-xs"
                >
                  <FolderPlus className="h-4 w-4" />
                  {copy.openProcessPlanning}
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  onClick={addRouteStep}
                  className="text-xs"
                  disabled={!processPlanId}
                >
                  <PlusCircle className="h-4 w-4" />
                  {copy.addStep}
                </PrimaryButton>
              </div>
              {processPlans.length === 0 ? (
                <p className="mt-2 text-xs text-amber-600">{copy.noProcessPlan}</p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-700">{copy.routeSteps}</p>
              {routeSteps.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">{copy.routeEmpty}</p>
              ) : (
                <DataTable className="mt-2">
                  <DataTableHead>
                    <tr>
                      <DataTableHeaderCell>{copy.stepNo}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.routeProcess}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.routeDepartment}</DataTableHeaderCell>
                      <DataTableHeaderCell>{copy.routeFactor}</DataTableHeaderCell>
                      <DataTableHeaderCell>Actions</DataTableHeaderCell>
                    </tr>
                  </DataTableHead>
                  <DataTableBody>
                    {routeSteps.map((step, index) => (
                      <DataTableRow key={`${step.processPlanId}_${index}`} striped={index % 2 === 1}>
                        <DataTableCell>{step.stepNo}</DataTableCell>
                        <DataTableCell>{step.processPlanName}</DataTableCell>
                        <DataTableCell>{step.departmentName || "-"}</DataTableCell>
                        <DataTableCell>{step.reportFactor}%</DataTableCell>
                        <DataTableCell>
                          <div className="flex flex-wrap gap-1">
                            <SecondaryButton
                              type="button"
                              onClick={() => moveRouteStep(index, "up")}
                              className="min-h-8 px-2 py-1 text-xs"
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </SecondaryButton>
                            <SecondaryButton
                              type="button"
                              onClick={() => moveRouteStep(index, "down")}
                              className="min-h-8 px-2 py-1 text-xs"
                              disabled={index === routeSteps.length - 1}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </SecondaryButton>
                            <SecondaryButton
                              type="button"
                              onClick={() => removeRouteStep(index)}
                              className="min-h-8 px-2 py-1 text-xs text-red-600"
                            >
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

            <div className="md:col-span-2">
              <PrimaryButton type="submit">
                {copy.save}
              </PrimaryButton>
              {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
            </div>
          </form>
        </CardContainer>

        <CardContainer className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">{copy.productList}</h3>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{copy.emptyList}</p>
          ) : (
            <DataTable className="mt-3">
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Code</DataTableHeaderCell>
                  <DataTableHeaderCell>Name</DataTableHeaderCell>
                  <DataTableHeaderCell>Spec</DataTableHeaderCell>
                  <DataTableHeaderCell>Category</DataTableHeaderCell>
                  <DataTableHeaderCell>{copy.processPlan}</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {products.map((item, index) => (
                  <DataTableRow key={item.id} striped={index % 2 === 1}>
                    <DataTableCell>{item.productCode}</DataTableCell>
                    <DataTableCell>{item.productName}</DataTableCell>
                    <DataTableCell>{item.productSpec}</DataTableCell>
                    <DataTableCell>{item.categoryName || "-"}</DataTableCell>
                    <DataTableCell>{item.processRouteSteps?.map((s) => s.processPlanName).join(" -> ") || item.processPlanName || "-"}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </CardContainer>
      </div>
    </main>
  );
}
