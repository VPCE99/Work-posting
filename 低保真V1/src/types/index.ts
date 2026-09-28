export type Conversation = {
  id: string;
  title: string;
  group: "今天" | "昨天" | "过去 7 天" | "更早";
  preview: string;
};

export type ScheduledTask = {
  id: string;
  name: string;
  prompt: string;
  frequency: string;
  time: string;
  email?: string;
  enabled: boolean;
  nextRun: string;
  result: "已生成报告" | "等待运行" | "运行失败";
};

export type PptProject = {
  id: string;
  name: string;
  source: "空画布" | "从现有对话生成" | "导入文件" | "上传 PPT";
  pages: number;
  status: "已保存" | "自动保存失败" | "解析中";
  updatedAt: string;
  favorite: boolean;
  recentlyViewed: boolean;
};

export type Skill = {
  id: string;
  name: string;
  kind: "公用技能" | "我的技能" | "未开通";
  description: string;
};

export type Plan = {
  id: string;
  name: string;
  allowance: string;
  price: number;
  validity: string;
  kind: "会员" | "加油包";
};

export type ToastMessage = {
  id: number;
  text: string;
  tone?: "neutral" | "success" | "danger";
};
