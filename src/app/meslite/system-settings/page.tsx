"use client";

import ModulePage from "../_components/module-page";

const text = {
  zh: {
    title: "系统设置",
    subtitle: "管理组织、角色权限、账号策略、日志与系统参数。",
    filters: ["设置分类", "作用范围", "启用状态", "修改人", "更新时间", "风险等级", "版本", "排序"],
    columns: ["设置项", "当前值", "生效范围", "最后修改"],
    emptyTitle: "暂无系统配置变更",
    emptyDescription: "建议先配置角色权限、账号安全策略与审计日志保留周期。",
    createLabel: "新增系统项",
    backLabel: "返回首页",
  },
  en: {
    title: "System Settings",
    subtitle: "Manage roles, permissions, account policies, logs and system parameters.",
    filters: ["Category", "Scope", "Status", "Updated By", "Updated At", "Risk Level", "Version", "Sort"],
    columns: ["Setting Item", "Current Value", "Effective Scope", "Last Modified"],
    emptyTitle: "No system changes",
    emptyDescription: "Configure role permissions, account policies and audit retention first.",
    createLabel: "Add System Item",
    backLabel: "Back to Dashboard",
  },
};

export default function SystemSettingsPage() {
  return <ModulePage text={text} />;
}
