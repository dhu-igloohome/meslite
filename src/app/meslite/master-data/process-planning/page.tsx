"use client";

import ModulePage from "../../_components/module-page";

const text = {
  zh: {
    title: "工艺编制",
    subtitle: "管理工艺路线、工序标准与工时参数，支持版本化维护。",
    filters: ["工艺类型", "工艺编码", "产品", "版本", "状态", "负责人", "更新时间", "排序"],
    columns: ["工艺编码", "关联产品", "工序数量", "状态"],
    emptyTitle: "暂无工艺路线",
    emptyDescription: "建议先在产品中心建立产品后，再进行工艺编制。",
    createLabel: "新增工艺",
    backLabel: "返回基础数据",
  },
  en: {
    title: "Process Planning",
    subtitle: "Maintain routing, operation standards and labor parameters with versioning.",
    filters: ["Type", "Process Code", "Product", "Version", "Status", "Owner", "Updated At", "Sort"],
    columns: ["Process Code", "Linked Product", "Operation Count", "Status"],
    emptyTitle: "No process routes yet",
    emptyDescription: "Create products first, then define process routes and operation standards.",
    createLabel: "Create Process",
    backLabel: "Back to Master Data",
  },
};

export default function ProcessPlanningPage() {
  return <ModulePage text={text} />;
}
