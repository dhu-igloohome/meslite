"use client";

import ModulePage from "../_components/module-page";

const text = {
  zh: {
    title: "扫码查询",
    subtitle: "通过扫码快速查询订单、工单、任务和报工状态。",
    filters: ["扫码类型", "编码规则", "查询范围", "查询状态", "扫码时间", "设备", "人员", "排序"],
    columns: ["扫码编号", "对象类型", "当前状态", "更新时间"],
    emptyTitle: "暂无扫码记录",
    emptyDescription: "启用扫码设备后可实时查询生产流转状态。",
    createLabel: "开始扫码",
    backLabel: "返回首页",
  },
  en: {
    title: "Scan Query",
    subtitle: "Scan to instantly check order, task and report status in production flow.",
    filters: ["Scan Type", "Code Rule", "Scope", "Status", "Scanned At", "Device", "Operator", "Sort"],
    columns: ["Scan Code", "Object Type", "Current Status", "Updated At"],
    emptyTitle: "No scan records",
    emptyDescription: "Enable scanner devices to query execution status in real time.",
    createLabel: "Start Scanning",
    backLabel: "Back to Dashboard",
  },
};

export default function ScanQueryPage() {
  return <ModulePage text={text} />;
}
