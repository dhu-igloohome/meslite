"use client";

import ModulePage from "../_components/module-page";

const text = {
  zh: {
    title: "报工管理",
    subtitle: "记录员工报工、工时与产量，形成实时生产执行数据。",
    filters: ["报工状态", "员工", "工序", "班次", "日期", "工单号", "异常类型", "排序"],
    columns: ["报工单号", "员工", "报工数量", "报工时间"],
    emptyTitle: "暂无报工记录",
    emptyDescription: "员工提交报工后，将在此处显示工时、产量与异常信息。",
    createLabel: "新增报工",
    backLabel: "返回首页",
  },
  en: {
    title: "Reporting Management",
    subtitle: "Capture labor time, output and process completion from employee reports.",
    filters: ["Report Status", "Employee", "Process", "Shift", "Date", "Work Order No.", "Exception", "Sort"],
    columns: ["Report No.", "Employee", "Reported Qty", "Reported At"],
    emptyTitle: "No reports submitted",
    emptyDescription: "Submitted reports will show production quantity, work hours and exceptions here.",
    createLabel: "Add Report",
    backLabel: "Back to Dashboard",
  },
};

export default function ReportingPage() {
  return <ModulePage text={text} />;
}
