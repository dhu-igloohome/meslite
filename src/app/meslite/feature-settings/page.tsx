"use client";

import ModulePage from "../_components/module-page";

const text = {
  zh: {
    title: "功能设置",
    subtitle: "配置业务开关、审批策略和流程规则，适配工厂作业方式。",
    filters: ["功能分组", "开关状态", "适用角色", "更新时间", "策略类型", "优先级", "环境", "排序"],
    columns: ["功能项", "当前状态", "适用范围", "最后更新"],
    emptyTitle: "暂无功能配置",
    emptyDescription: "可先配置审批、通知与任务派发策略。",
    createLabel: "新增配置",
    backLabel: "返回首页",
  },
  en: {
    title: "Feature Settings",
    subtitle: "Configure business toggles, approval strategies and workflow rules.",
    filters: ["Feature Group", "Status", "Role Scope", "Updated At", "Policy", "Priority", "Environment", "Sort"],
    columns: ["Feature", "Current Status", "Scope", "Last Updated"],
    emptyTitle: "No feature settings",
    emptyDescription: "Configure approvals, notifications and task dispatch policies here.",
    createLabel: "Add Setting",
    backLabel: "Back to Dashboard",
  },
};

export default function FeatureSettingsPage() {
  return <ModulePage text={text} />;
}
