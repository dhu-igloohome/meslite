"use client";

import ModulePage from "../../_components/module-page";

const text = {
  zh: {
    title: "订单/工单分类",
    subtitle: "定义订单与工单分类体系，支撑下发规则、审批和统计口径。",
    filters: ["分类层级", "分类编码", "分类名称", "适用范围", "状态", "更新人", "更新时间", "排序"],
    columns: ["分类编码", "分类名称", "适用对象", "状态"],
    emptyTitle: "暂无分类定义",
    emptyDescription: "建立分类后，可在订单/工单管理中直接引用。",
    createLabel: "新增分类",
    backLabel: "返回基础数据",
  },
  en: {
    title: "Order / Work Order Types",
    subtitle: "Define order and work-order taxonomy for dispatch, approvals and analytics.",
    filters: ["Level", "Type Code", "Type Name", "Scope", "Status", "Updated By", "Updated At", "Sort"],
    columns: ["Type Code", "Type Name", "Applies To", "Status"],
    emptyTitle: "No type definitions",
    emptyDescription: "Defined types can be reused in order and work-order management.",
    createLabel: "Create Type",
    backLabel: "Back to Master Data",
  },
};

export default function OrderWorkOrderCategoriesPage() {
  return <ModulePage text={text} />;
}
