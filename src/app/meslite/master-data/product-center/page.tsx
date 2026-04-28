"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, PackagePlus } from "lucide-react";
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
type ProcessMode = "sort" | "add" | "copy";

type ProductCategory = {
  id: string;
  name: string;
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
  processMode: ProcessMode;
  note: string;
  createdAt: string;
};

const CATEGORIES_KEY = "meslite_product_categories";
const PRODUCTS_KEY = "meslite_products";

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
    processMode: "工序编制",
    processModes: {
      sort: "排序现有工序",
      add: "添加工序",
      copy: "复制其他产品工序",
    },
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
    processMode: "Process planning",
    processModes: {
      sort: "Sort existing process steps",
      add: "Add process step",
      copy: "Copy process from another product",
    },
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
  const [productType, setProductType] = useState<ProductType>("part");
  const [imagePath, setImagePath] = useState("");
  const [productName, setProductName] = useState("");
  const [productSpec, setProductSpec] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [drawingPath, setDrawingPath] = useState("");
  const [processMode, setProcessMode] = useState<ProcessMode>("sort");
  const [message, setMessage] = useState("");
  const productCode = useMemo(() => nextCode(productType, products), [productType, products]);

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
      processMode,
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
    setProcessMode("sort");
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

            <label className="text-sm text-slate-700 md:col-span-2">
              {copy.processMode}
              <SelectInput value={processMode} onChange={(e) => setProcessMode(e.target.value as ProcessMode)}>
                <option value="sort">{copy.processModes.sort}</option>
                <option value="add">{copy.processModes.add}</option>
                <option value="copy">{copy.processModes.copy}</option>
              </SelectInput>
            </label>

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
                  <DataTableHeaderCell>Process</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {products.map((item, index) => (
                  <DataTableRow key={item.id} striped={index % 2 === 1}>
                    <DataTableCell>{item.productCode}</DataTableCell>
                    <DataTableCell>{item.productName}</DataTableCell>
                    <DataTableCell>{item.productSpec}</DataTableCell>
                    <DataTableCell>{item.categoryName || "-"}</DataTableCell>
                    <DataTableCell>{copy.processModes[item.processMode]}</DataTableCell>
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
