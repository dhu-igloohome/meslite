"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
    openCategorySetup: "设置产品分类",
    createCategory: "创建产品分类",
    categoryName: "产品分类名称",
    confirmCategory: "确认创建分类",
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
    openCategorySetup: "Configure Categories",
    createCategory: "Create Product Category",
    categoryName: "Category name",
    confirmCategory: "Create Category",
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
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

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

  const createCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      return;
    }
    const item: ProductCategory = {
      id: `cat_${Date.now()}`,
      name,
    };
    const nextCategories = [...categories, item];
    saveCategories(nextCategories);
    setCategoryId(item.id);
    setNewCategoryName("");
    setShowCategoryEditor(false);
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
          <h2 className="text-xl font-semibold text-zinc-900">{copy.createTitle}</h2>

          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={saveProduct}>
            <label className="text-sm text-zinc-700 md:col-span-2">
              {copy.imagePath}
              <input
                type="text"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.type}
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
              >
                <option value="part">{copy.typeOptions.part}</option>
                <option value="component">{copy.typeOptions.component}</option>
                <option value="auxiliary">{copy.typeOptions.auxiliary}</option>
                <option value="finished">{copy.typeOptions.finished}</option>
              </select>
            </label>

            <label className="text-sm text-zinc-700">
              {copy.code}
              <input
                type="text"
                value={productCode}
                readOnly
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.name}
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <label className="text-sm text-zinc-700">
              {copy.spec}
              <input
                type="text"
                required
                value={productSpec}
                onChange={(e) => setProductSpec(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <div className="text-sm text-zinc-700 md:col-span-2">
              <p>{copy.category}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="min-w-64 rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
                >
                  <option value="">{copy.category}</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryEditor((prev) => !prev)}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs text-zinc-700"
                >
                  {copy.openCategorySetup}
                </button>
              </div>
              {categories.length === 0 ? <p className="mt-2 text-xs text-amber-600">{copy.noCategory}</p> : null}
            </div>

            {showCategoryEditor ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 md:col-span-2">
                <p className="text-sm font-medium text-zinc-800">{copy.createCategory}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={copy.categoryName}
                    className="min-w-64 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={createCategory}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white"
                  >
                    {copy.confirmCategory}
                  </button>
                </div>
              </div>
            ) : null}

            <label className="text-sm text-zinc-700 md:col-span-2">
              {copy.note}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <label className="text-sm text-zinc-700 md:col-span-2">
              {copy.drawingPath}
              <input
                type="text"
                value={drawingPath}
                onChange={(e) => setDrawingPath(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              />
            </label>

            <label className="text-sm text-zinc-700 md:col-span-2">
              {copy.processMode}
              <select
                value={processMode}
                onChange={(e) => setProcessMode(e.target.value as ProcessMode)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
              >
                <option value="sort">{copy.processModes.sort}</option>
                <option value="add">{copy.processModes.add}</option>
                <option value="copy">{copy.processModes.copy}</option>
              </select>
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

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,.35)]">
          <h3 className="text-lg font-semibold text-zinc-900">{copy.productList}</h3>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">{copy.emptyList}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="px-2 py-2">Code</th>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Spec</th>
                    <th className="px-2 py-2">Category</th>
                    <th className="px-2 py-2">Process</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id} className="border-t border-zinc-100 text-zinc-700">
                      <td className="px-2 py-2">{item.productCode}</td>
                      <td className="px-2 py-2">{item.productName}</td>
                      <td className="px-2 py-2">{item.productSpec}</td>
                      <td className="px-2 py-2">{item.categoryName || "-"}</td>
                      <td className="px-2 py-2">{copy.processModes[item.processMode]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
