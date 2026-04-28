"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePenLine, FolderPlus, Trash2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { DangerOutlineButton, PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { CardContainer } from "@/components/ui/card-container";
import { TextInput } from "@/components/ui/form-elements";
import { useMesliteSession } from "../../_lib/session";

type ProductCategory = {
  id: string;
  name: string;
  createdAt: string;
};

type ProductRecord = {
  id: string;
  categoryId: string;
  categoryName: string;
};

const CATEGORIES_KEY = "meslite_product_categories";
const PRODUCTS_KEY = "meslite_products";

const text = {
  zh: {
    title: "产品分类",
    subtitle: "显示已有分类，支持新增、修改与删除分类。",
    existing: "已有的分类",
    empty: "暂无产品分类",
    create: "新增分类",
    input: "分类名称",
    confirm: "确认",
    createOk: "分类保存成功。",
    update: "更新",
    updateOk: "分类更新成功。",
    edit: "修改",
    remove: "删除",
    cancelEdit: "取消修改",
    removeConfirm: "确认删除该分类吗？",
    categoryInUse: "该分类已被产品引用，暂不可删除。",
    backLabel: "返回基础数据",
  },
  en: {
    title: "Product Categories",
    subtitle: "Show categories and support create, edit and delete.",
    existing: "Existing categories",
    empty: "No product categories",
    create: "Add Category",
    input: "Category name",
    confirm: "Confirm",
    createOk: "Category saved.",
    update: "Update",
    updateOk: "Category updated.",
    edit: "Edit",
    remove: "Delete",
    cancelEdit: "Cancel Edit",
    removeConfirm: "Delete this category?",
    categoryInUse: "This category is referenced by products and cannot be deleted.",
    backLabel: "Back to Master Data",
  },
};

export default function ProductCategoriesPage() {
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
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const saveCategories = (next: ProductCategory[]) => {
    setCategories(next);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
  };

  const createCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) {
      return;
    }
    if (editingId) {
      const nextCategories = categories.map((item) => (item.id === editingId ? { ...item, name: value } : item));
      saveCategories(nextCategories);
      const nextProducts = products.map((item) =>
        item.categoryId === editingId ? { ...item, categoryName: value } : item,
      );
      setProducts(nextProducts);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(nextProducts));
      setEditingId(null);
      setName("");
      setMessage(copy.updateOk);
      return;
    }
    const item: ProductCategory = {
      id: `pc_${Date.now()}`,
      name: value,
      createdAt: new Date().toISOString(),
    };
    saveCategories([...categories, item]);
    setName("");
    setMessage(copy.createOk);
  };

  const startEdit = (id: string) => {
    const target = categories.find((item) => item.id === id);
    if (!target) {
      return;
    }
    setEditingId(id);
    setName(target.name);
    setMessage("");
  };

  const removeCategory = (id: string) => {
    if (products.some((item) => item.categoryId === id)) {
      setMessage(copy.categoryInUse);
      return;
    }
    if (!window.confirm(copy.removeConfirm)) {
      return;
    }
    const next = categories.filter((item) => item.id !== id);
    saveCategories(next);
    if (editingId === id) {
      setEditingId(null);
      setName("");
    }
    setMessage("");
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <CardContainer className="p-5">
          <BackButton label={copy.backLabel} fallbackHref="/meslite/master-data" className="mb-3" />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
        </CardContainer>

        <CardContainer className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">{copy.existing}</h2>
          {categories.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{copy.empty}</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {item.name}
                  <SecondaryButton type="button" onClick={() => startEdit(item.id)} className="min-h-8 px-2 py-1 text-xs">
                    <FilePenLine className="h-3.5 w-3.5" />
                    {copy.edit}
                  </SecondaryButton>
                  <DangerOutlineButton type="button" onClick={() => removeCategory(item.id)} className="min-h-8 px-2 py-1 text-xs">
                    <Trash2 className="h-3.5 w-3.5" />
                    {copy.remove}
                  </DangerOutlineButton>
                </span>
              ))}
            </div>
          )}
        </CardContainer>

        <CardContainer className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? copy.edit : copy.create}</h2>
          </div>
          <form className="mt-3 flex flex-wrap items-center gap-2" onSubmit={createCategory}>
            <TextInput
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.input}
              className="min-w-72"
            />
            <PrimaryButton type="submit">
              {editingId ? copy.update : copy.confirm}
            </PrimaryButton>
            {editingId ? (
              <SecondaryButton
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                }}
              >
                {copy.cancelEdit}
              </SecondaryButton>
            ) : null}
          </form>
          {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
        </CardContainer>
      </div>
    </main>
  );
}
