"use client";

import ModulePage from "../../_components/module-page";

const text = {
  zh: {
    title: "产品分类",
    subtitle: "维护产品分类树和映射规则，支持成本核算与报表分组。",
    filters: ["分类层级", "分类编码", "分类名称", "上级分类", "状态", "创建人", "更新时间", "排序"],
    columns: ["分类编码", "分类名称", "上级分类", "状态"],
    emptyTitle: "暂无产品分类",
    emptyDescription: "建立产品分类后，可在产品中心快速归档并用于分析。",
    createLabel: "新增产品分类",
    backLabel: "返回基础数据",
  },
  en: {
    title: "Product Categories",
    subtitle: "Maintain category hierarchy and mapping rules for costing and reporting.",
    filters: ["Level", "Category Code", "Category Name", "Parent Category", "Status", "Created By", "Updated At", "Sort"],
    columns: ["Category Code", "Category Name", "Parent Category", "Status"],
    emptyTitle: "No product categories",
    emptyDescription: "Create categories to organize products and improve reporting views.",
    createLabel: "Create Category",
    backLabel: "Back to Master Data",
  },
};

export default function ProductCategoriesPage() {
  return <ModulePage text={text} />;
}
