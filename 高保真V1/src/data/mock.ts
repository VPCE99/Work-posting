import { formatNextRun } from "../app/taskSchedule";
import type {
  ChatProject,
  Conversation,
  Plan,
  PptProject,
  PptProjectDeck,
  PptTemplate,
  ScheduledTask,
  Skill,
  TemplatePreviewSlide,
} from "../types";

export const initialChatProjects: ChatProject[] = [
  { id: "proj-reits", name: "葱花创投研究" },
];

export const conversations: Conversation[] = [
  { id: "industry", title: "产业园 REITs 三年经营趋势", group: "今天", preview: "分析近三年出租率与收入变化" },
  { id: "competitor", title: "竞品分析", group: "今天", preview: "核心产品与商业模式比较", projectId: "proj-reits" },
  { id: "finance", title: "财务数据复盘", group: "昨天", preview: "收入、利润和现金流变化", projectId: "proj-reits" },
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
    nextRun: formatNextRun("每天", "08:00", true),
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
  {
    id: "industry-2026",
    name: "2026 行业报告",
    source: "从现有对话生成",
    pages: 18,
    status: "已保存",
    updatedAt: "10 分钟前",
    favorite: true,
    recentlyViewed: true,
  },
  { id: "monthly", name: "客户月报", source: "空画布", pages: 12, status: "自动保存失败", updatedAt: "昨天", favorite: false, recentlyViewed: true },
  { id: "competition", name: "竞品分析", source: "上传 PPT", pages: 8, status: "解析中", updatedAt: "刚刚", favorite: false, recentlyViewed: false },
];

/**
 * Project decks: first slide is the canonical cover.
 * Library cards derive the theme thumbnail from slide 0 (not a separate coverUrl).
 */
export const pptProjectDecks: Record<string, PptProjectDeck> = {
  "industry-2026": {
    coverLayout: "industry-outlook",
    coverSubtitle: "Industry Outlook · 趋势与机遇",
    slideTitles: [
      "2026 行业报告",
      "核心结论",
      "市场规模",
      "区域表现",
      "重点项目",
      "投资建议",
      "风险提示",
      "附录",
    ],
  },
  monthly: {
    coverLayout: "monthly-report",
    coverSubtitle: "Monthly Brief · 经营回顾",
    slideTitles: [
      "客户月报",
      "本月概览",
      "关键指标",
      "异常追踪",
      "行动项",
      "下月计划",
    ],
  },
  competition: {
    coverLayout: "competition-map",
    coverSubtitle: "Competitive Map · 格局扫描",
    slideTitles: [
      "竞品分析",
      "玩家地图",
      "产品对比",
      "融资动态",
      "机会判断",
      "行动建议",
    ],
  },
};

export function getProjectDeck(projectId: string): PptProjectDeck | null {
  return pptProjectDecks[projectId] ?? null;
}

/** Cover thumbnails for templates (manager + new-PPT picker). */
export const templateCoverUrls: Record<string, string> = {
  "official-finance": "/covers/ppt-cover-finance-template.jpg",
  "official-research": "/covers/ppt-cover-industry-2026.jpg",
  "我的品牌模板": "/covers/ppt-cover-brand-template.jpg",
};

function slides(
  items: Array<Omit<TemplatePreviewSlide, "id"> & { id?: string }>,
): TemplatePreviewSlide[] {
  return items.map((item, index) => {
    const slide: TemplatePreviewSlide = {
      id: item.id ?? `slide-${index + 1}`,
      title: item.title,
      kind: item.kind,
    };
    if (item.imageUrl !== undefined) slide.imageUrl = item.imageUrl;
    if (item.eyebrow !== undefined) slide.eyebrow = item.eyebrow;
    if (item.body !== undefined) slide.body = item.body;
    return slide;
  });
}

function coverOf(key: keyof typeof templateCoverUrls): string {
  const url = templateCoverUrls[key];
  if (!url) throw new Error(`Missing template cover: ${String(key)}`);
  return url;
}

/** Official + custom PPT template mocks with multi-page preview decks. */
export const officialTemplates: PptTemplate[] = [
  {
    id: "official-finance",
    name: "专业财务汇报",
    category: "财务分析",
    ratio: "16:9",
    source: "official",
    coverUrl: coverOf("official-finance"),
    slides: slides([
      { title: "专业财务汇报", kind: "cover", imageUrl: coverOf("official-finance"), eyebrow: "财务分析", body: "收入、利润与现金流一页看清" },
      { title: "核心财务指标", kind: "chart", eyebrow: "经营概览", body: "营收同比增长 18%，毛利率稳定在 42%。" },
      { title: "损益结构拆解", kind: "content", eyebrow: "P&L", body: "费用率可控，研发投入占比提升至 11%。" },
      { title: "下季度关注点", kind: "section", eyebrow: "行动建议", body: "聚焦回款节奏与高毛利产品组合。" },
    ]),
  },
  {
    id: "official-research",
    name: "行业研究报告",
    category: "行业研究",
    ratio: "16:9",
    source: "official",
    coverUrl: coverOf("official-research"),
    slides: slides([
      { title: "行业研究报告", kind: "cover", imageUrl: coverOf("official-research"), eyebrow: "行业研究", body: "市场规模、竞争格局与投资线索" },
      { title: "市场空间测算", kind: "chart", eyebrow: "TAM / SAM / SOM", body: "目标市场未来三年复合增速约 14%。" },
      { title: "竞争格局", kind: "content", eyebrow: "玩家地图", body: "头部集中度提升，区域玩家差异化生存。" },
      { title: "研究结论", kind: "section", eyebrow: "总结", body: "优先关注具备资产运营能力的标的。" },
    ]),
  },
  {
    id: "official-minimal",
    name: "极简商务提案",
    category: "商业提案",
    ratio: "16:9",
    source: "official",
    slides: slides([
      { title: "极简商务提案", kind: "cover", eyebrow: "商业提案", body: "用最少页面讲清价值主张" },
      { title: "客户痛点", kind: "content", eyebrow: "问题定义", body: "决策链路长、材料分散、结论难对齐。" },
      { title: "解决方案", kind: "section", eyebrow: "我们的方法", body: "结构化研究 + 可复用模板 + 即时协作。" },
      { title: "合作路径", kind: "chart", eyebrow: "试点到规模化", body: "两周试点，四周沉淀标准作业流程。" },
    ]),
  },
  {
    id: "official-data",
    name: "数据可视化月报",
    category: "数据报告",
    ratio: "16:9",
    source: "official",
    slides: slides([
      { title: "数据可视化月报", kind: "cover", eyebrow: "数据报告", body: "指标、趋势与异常一目了然" },
      { title: "本月关键指标", kind: "chart", eyebrow: "仪表盘", body: "活跃、转化、留存三项均优于目标。" },
      { title: "异常归因", kind: "content", eyebrow: "下钻分析", body: "区域 A 转化下滑由渠道组合变化引起。" },
      { title: "下月计划", kind: "section", eyebrow: "行动项", body: "补齐内容供给，并复盘投放预算分配。" },
    ]),
  },
  {
    id: "official-investment",
    name: "投资委员会汇报",
    category: "投资决策",
    ratio: "16:9",
    source: "official",
    slides: slides([
      { title: "投资委员会汇报", kind: "cover", eyebrow: "投资决策", body: "机会、风险与建议一页对齐" },
      { title: "交易摘要", kind: "content", eyebrow: "Deal Snapshot", body: "轮次、估值、用途与关键条款概览。" },
      { title: "风险与缓释", kind: "chart", eyebrow: "Risk Matrix", body: "经营波动可控，合规与退出路径清晰。" },
      { title: "投资建议", kind: "section", eyebrow: "IC 结论", body: "建议推进，设置分阶段跟投条件。" },
    ]),
  },
  {
    id: "official-dark",
    name: "深色科技发布",
    category: "产品发布",
    ratio: "16:9",
    source: "official",
    slides: slides([
      { title: "深色科技发布", kind: "cover", eyebrow: "产品发布", body: "适合发布会与路演的深色视觉" },
      { title: "产品亮点", kind: "content", eyebrow: "What's New", body: "更快、更稳，并支持多端协同。" },
      { title: "演示路径", kind: "chart", eyebrow: "Demo Flow", body: "三分钟走完核心场景与关键指标。" },
      { title: "发布时间线", kind: "section", eyebrow: "Roadmap", body: "本季公测，下季开放生态接入。" },
    ]),
  },
];

const customTemplateCatalog: Record<string, PptTemplate> = {
  我的品牌模板: {
    id: "custom-brand",
    name: "我的品牌模板",
    category: "自定义模板",
    ratio: "16:9",
    source: "custom",
    coverUrl: coverOf("我的品牌模板"),
    slides: slides([
      { title: "我的品牌模板", kind: "cover", imageUrl: coverOf("我的品牌模板"), eyebrow: "Brand Guidelines", body: "自定义视觉规范与版式节奏" },
      { title: "品牌色与字体", kind: "content", eyebrow: "视觉系统", body: "主色、辅色与标题层级已固化。" },
      { title: "页面母版", kind: "section", eyebrow: "版式", body: "封面、目录、内容页与结尾页齐备。" },
      { title: "应用示例", kind: "chart", eyebrow: "示例页", body: "可用于对外汇报与客户提案。" },
    ]),
  },
  公司标准模板: {
    id: "custom-company",
    name: "公司标准模板",
    category: "自定义模板",
    ratio: "16:9",
    source: "custom",
    slides: slides([
      { title: "公司标准模板", kind: "cover", eyebrow: "16:9 自定义", body: "统一对内汇报与对外材料的版式" },
      { title: "目录结构", kind: "section", eyebrow: "标准章节", body: "背景、进展、风险、下一步。" },
      { title: "内容页示例", kind: "content", eyebrow: "正文", body: "左文右图，适合过程同步与决策材料。" },
      { title: "数据页示例", kind: "chart", eyebrow: "图表", body: "预留图表区与脚注说明位。" },
    ]),
  },
};

function buildFallbackCustomTemplate(name: string): PptTemplate {
  return {
    id: `custom-${name}`,
    name,
    category: "自定义模板",
    ratio: "16:9",
    source: "custom",
    slides: slides([
      { title: name, kind: "cover", eyebrow: "自定义模板", body: "上传解析后的模板预览" },
      { title: "内容页", kind: "content", eyebrow: "正文", body: "标题、要点与说明文字的基础排版。" },
      { title: "图表页", kind: "chart", eyebrow: "数据", body: "预留图表与关键结论位置。" },
    ]),
  };
}

function getOfficialTemplate(id: string) {
  return officialTemplates.find((item) => item.id === id) ?? null;
}

function getCustomTemplate(name: string) {
  return customTemplateCatalog[name] ?? buildFallbackCustomTemplate(name);
}

export function getTemplateForPreview(
  target: { kind: "official"; id: string } | { kind: "custom"; name: string },
): PptTemplate | null {
  if (target.kind === "official") return getOfficialTemplate(target.id);
  return getCustomTemplate(target.name);
}

export const initialSkills: Skill[] = [
  { id: "industry-research", name: "行业研究", kind: "公用技能", description: "形成行业规模、趋势和竞争格局的结构化分析。" },
  { id: "financial", name: "财务分析", kind: "公用技能", description: "梳理财务指标、异常变化和经营质量。" },
  { id: "writing", name: "我的写作规范", kind: "我的技能", description: "统一报告结构、标题层级和表达风格。", prompt: "请按统一标题层级与简洁书面语输出。" },
  { id: "interview", name: "访谈纪要", kind: "我的技能", description: "按主题、结论和待办整理访谈内容。", prompt: "请按主题 / 结论 / 待办整理访谈内容。" },
  { id: "data-room", name: "数据室分析", kind: "未开通", description: "批量读取项目材料并形成尽调问题清单。" },
];

export const plans: Plan[] = [
  { id: "starter", name: "入门加油包", allowance: "250 万 Token", price: 39, validity: "永久", kind: "加油包" },
  { id: "light", name: "轻量加油包", allowance: "500 万 Token", price: 69, validity: "永久", kind: "加油包" },
  { id: "standard", name: "标准加油包", allowance: "2000 万 Token", price: 259, validity: "永久", kind: "加油包" },
  { id: "flagship", name: "旗舰加油包", allowance: "1 亿 Token", price: 1199, validity: "永久", kind: "加油包" },
  { id: "annual", name: "年费会员", allowance: "每日 50 次 + 每日 1000 万 Token", price: 30000, validity: "一年", kind: "会员" },
];

/** Daily suite Token allowance for membership (1000 万). Unit: K Token. Shared by account chart / usage chips. */
export const DAILY_PLAN_TOKEN_CAP_K = 10_000;
/** Mock “today” consumption shown in topbar / account / plans. Unit: K Token. */
const TODAY_TOKEN_USED_K = 128;

export function formatTokenK(valueK: number) {
  if (valueK >= 1000) {
    const millions = valueK / 1000;
    return `${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  return `${valueK}K`;
}

export const todayTokenUsageLabel = `${formatTokenK(TODAY_TOKEN_USED_K)} / ${formatTokenK(DAILY_PLAN_TOKEN_CAP_K)}`;
