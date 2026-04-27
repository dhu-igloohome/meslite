"use client";

import ModulePage from "../_components/module-page";

const text = {
  zh: {
    title: "订单/工单管理",
    subtitle: "统一管理销售订单、生产工单与工序状态，追踪交付进度与异常。",
    filters: ["订单状态", "工单类型", "生产车间", "交期预警", "客户", "负责人", "优先级", "排序"],
    columns: ["工单号", "订单号", "生产状态", "计划交期"],
    emptyTitle: "暂无工单数据",
    emptyDescription: "可通过“新建工单”或“订单下发”进入生产流程。",
    createLabel: "新建工单",
    backLabel: "返回首页",
  },
  en: {
    title: "Order / Work Order Management",
    subtitle:
      "Manage sales orders, work orders and operation status in one place with delivery tracking.",
    filters: ["Status", "Order Type", "Workshop", "Due Alert", "Customer", "Owner", "Priority", "Sort"],
    columns: ["Work Order No.", "Sales Order No.", "Production Status", "Planned Due Date"],
    emptyTitle: "No work orders yet",
    emptyDescription: "Create a work order or release one from the order pipeline to get started.",
    createLabel: "Create Work Order",
    backLabel: "Back to Dashboard",
  },
};

export default function WorkOrdersPage() {
  return <ModulePage text={text} />;
}
