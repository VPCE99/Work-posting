import type { Conversation, Plan, PptProject, ScheduledTask, Skill } from "../types";

export const conversations: Conversation[] = [
  { id: "industry", title: "行业研究报告", group: "今天", preview: "分析行业规模、增速与竞争格局" },
  { id: "competitor", title: "竞品分析", group: "今天", preview: "核心产品与商业模式比较" },
  { id: "finance", title: "财务数据复盘", group: "昨天", preview: "收入、利润和现金流变化" },
  { id: "market", title: "市场规模测算", group: "过去 7 天", preview: "TAM、SAM、SOM 测算" },
  { id: "memo", title: "投资备忘录", group: "更早", preview: "项目亮点、风险与建议" },
];

export const initialTasks: ScheduledTask[] = [
  {
    id: "daily-brief",
    name: "每日行业简报",
    prompt: "整理行业新闻并提炼三条主要变化",
    frequency: "每天",
    time: "08:00",
    email: "demo@example.com",
    enabled: true,
    nextRun: "09/23 08:00",
    result: "已生成报告",
  },
  {
    id: "weekly-track",
    name: "周度竞品跟踪",
    prompt: "跟踪主要竞品的产品和融资动态",
    frequency: "每周一",
    time: "10:00",
    enabled: false,
    nextRun: "已停用",
    result: "等待运行",
  },
];

export const initialProjects: PptProject[] = [
  { id: "industry-2026", name: "2026 行业报告", source: "从现有对话生成", pages: 18, status: "已保存", updatedAt: "10 分钟前", favorite: true, recentlyViewed: true },
  { id: "monthly", name: "客户月报", source: "空画布", pages: 12, status: "自动保存失败", updatedAt: "昨天", favorite: false, recentlyViewed: true },
  { id: "competition", name: "竞品分析", source: "上传 PPT", pages: 8, status: "解析中", updatedAt: "刚刚", favorite: false, recentlyViewed: false },
];

export const initialSkills: Skill[] = [
  { id: "industry-research", name: "行业研究", kind: "公用技能", description: "形成行业规模、趋势和竞争格局的结构化分析。" },
  { id: "financial", name: "财务分析", kind: "公用技能", description: "梳理财务指标、异常变化和经营质量。" },
  { id: "writing", name: "我的写作规范", kind: "我的技能", description: "统一报告结构、标题层级和表达风格。" },
  { id: "interview", name: "访谈纪要", kind: "我的技能", description: "按主题、结论和待办整理访谈内容。" },
  { id: "data-room", name: "数据室分析", kind: "未开通", description: "批量读取项目材料并形成尽调问题清单。" },
];

export const plans: Plan[] = [
  { id: "starter", name: "入门加油包", allowance: "250 万 Token", price: 39, validity: "永久", kind: "加油包" },
  { id: "light", name: "轻量加油包", allowance: "500 万 Token", price: 69, validity: "永久", kind: "加油包" },
  { id: "standard", name: "标准加油包", allowance: "2000 万 Token", price: 259, validity: "永久", kind: "加油包" },
  { id: "flagship", name: "旗舰加油包", allowance: "1 亿 Token", price: 1199, validity: "永久", kind: "加油包" },
  { id: "annual", name: "年费会员", allowance: "每日 50 次 + 每日 1000 万 Token", price: 30000, validity: "一年", kind: "会员" },
];
