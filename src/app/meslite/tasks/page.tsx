"use client";

import ModulePage from "../_components/module-page";

const text = {
  zh: {
    title: "任务管理",
    subtitle: "按工序和人员分配生产任务，支持优先级、工时和产能跟踪。",
    filters: ["任务状态", "工序", "班组", "负责人", "工位", "开始日期", "结束日期", "排序"],
    columns: ["任务号", "所属工单", "负责人", "进度"],
    emptyTitle: "暂无任务",
    emptyDescription: "创建任务后可分配到员工账号并进入报工流程。",
    createLabel: "创建任务",
    backLabel: "返回首页",
  },
  en: {
    title: "Task Management",
    subtitle: "Assign production tasks by process and operator with workload visibility.",
    filters: ["Task Status", "Process", "Team", "Owner", "Station", "Start Date", "End Date", "Sort"],
    columns: ["Task No.", "Work Order", "Assignee", "Progress"],
    emptyTitle: "No tasks available",
    emptyDescription: "Create tasks and assign them to employees for reporting execution.",
    createLabel: "Create Task",
    backLabel: "Back to Dashboard",
  },
};

export default function TasksPage() {
  return <ModulePage text={text} />;
}
