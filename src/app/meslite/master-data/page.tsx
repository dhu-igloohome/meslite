"use client";

import ModulePage from "../_components/module-page";

const text = {
  zh: {
    title: "基础数据",
    subtitle: "维护产品、工艺、物料、客户与组织等主数据。",
    filters: ["数据类别", "编码", "名称", "启用状态", "更新时间", "创建人", "来源", "排序"],
    columns: ["数据编码", "数据名称", "类别", "状态"],
    emptyTitle: "暂无基础数据",
    emptyDescription: "建议先维护产品、工序和物料，便于后续工单与任务流转。",
    createLabel: "新增数据",
    backLabel: "返回首页",
  },
  en: {
    title: "Master Data",
    subtitle: "Manage products, process routes, materials, customers and organization data.",
    filters: ["Category", "Code", "Name", "Status", "Updated At", "Owner", "Source", "Sort"],
    columns: ["Code", "Name", "Category", "Status"],
    emptyTitle: "No master data yet",
    emptyDescription: "Start with products, process and materials to enable order execution.",
    createLabel: "Add Data",
    backLabel: "Back to Dashboard",
  },
};

export default function MasterDataPage() {
  return <ModulePage text={text} />;
}
