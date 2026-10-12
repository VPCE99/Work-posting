export type Conversation = {
  id: string;
  title: string;
  group: "今天" | "昨天" | "过去 7 天" | "更早";
  preview: string;
  /** Chat-folder project id; null/undefined = unfiled (shows under 历史聊天). */
  projectId?: string | null;
  /** Session-only question text for chats started in this visit. Not written to storage. */
  prompt?: string;
};

/** Sidebar folder for grouping conversations (not PPT projects). */
export type ChatProject = {
  id: string;
  name: string;
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
  result: "已生成报告" | "等待运行" | "运行失败" | "刚刚完成";
};

/** First-slide cover layout used both in the editor and as the project card theme. */
export type PptCoverLayout = "industry-outlook" | "monthly-report" | "competition-map";

export type PptProject = {
  id: string;
  name: string;
  source: "空画布" | "从现有对话生成" | "导入文件" | "上传 PPT";
  pages: number;
  status: "已保存" | "自动保存失败" | "解析中";
  updatedAt: string;
  favorite: boolean;
  recentlyViewed: boolean;
  /** Created without a preset template — editor opens a blank deck. */
  blankTemplate?: boolean;
};

/** Mock deck seed: cover layout + slide titles. Card theme is derived from slide 0. */
export type PptProjectDeck = {
  coverLayout: PptCoverLayout;
  slideTitles: string[];
  coverSubtitle: string;
};

/** One page inside a template mock preview. */
export type TemplatePreviewSlide = {
  id: string;
  title: string;
  kind: "cover" | "section" | "content" | "chart";
  /** Full-bleed cover/photo when available; otherwise a styled mock layout is used. */
  imageUrl?: string;
  eyebrow?: string;
  body?: string;
};

export type PptTemplate = {
  id: string;
  name: string;
  category: string;
  ratio: "16:9";
  source: "official" | "custom";
  coverUrl?: string;
  slides: TemplatePreviewSlide[];
};

export type Skill = {
  id: string;
  name: string;
  kind: "公用技能" | "我的技能" | "未开通";
  description: string;
  prompt?: string;
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
