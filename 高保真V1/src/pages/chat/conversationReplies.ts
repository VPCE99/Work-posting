export type ConversationReply = {
  prompt: string;
  agent: string;
  title: string;
  insights: Array<{ title: string; body: string }>;
  tableLabel: string;
  table: Array<{ cells: string[]; emphasize?: number[] }>;
  chartTitle: string;
  chartRange: string;
  legend: [string, string];
  chartCaption: string;
  labels: [string, string, string];
  /** Suggested follow-up questions shown under the assistant reply. */
  followUps: [string, string, string];
};

const industry: ConversationReply = {
  prompt: "请分析近三年产业园 REITs 的出租率和收入变化，并总结主要结论。",
  agent: "CHOPCHAT · REITs ANALYST",
  title: "产业园 REITs 经营趋势摘要",
  insights: [
    { title: "出租率连续修复", body: "平均出租率由 89.6% 升至 93.8%，运营韧性增强。" },
    { title: "收入保持稳定增长", body: "样本营业收入三年复合增速约 8.6%，达到 31.4 亿元。" },
    { title: "量价改善更为均衡", body: "需求与续租价格共同贡献增长，区域分化仍需持续跟踪。" },
  ],
  tableLabel: "REITs 经营数据",
  table: [
    { cells: ["年度", "平均出租率", "营业收入"] },
    { cells: ["2023", "89.6%", "26.6 亿元"], emphasize: [1] },
    { cells: ["2024", "91.7%", "28.9 亿元"], emphasize: [1] },
    { cells: ["2025", "93.8%", "31.4 亿元"], emphasize: [1] },
  ],
  chartTitle: "出租率与营业收入",
  chartRange: "2023—2025",
  legend: ["出租率", "营业收入"],
  chartCaption: "2023 至 2025 年出租率与营业收入均上升",
  labels: ["2023", "2024", "2025"],
  followUps: ["对比不同园区的出租率差异", "解释收入增长的主要驱动因素", "把结论整理成投资备忘录"],
};

const competitor: ConversationReply = {
  prompt: "请比较核心竞品的产品定位与商业模式。",
  agent: "CHOPCHAT · COMPETITOR",
  title: "竞品分析摘要",
  insights: [
    { title: "定位已经分化", body: "头部产品集中在资产管理，腰部产品更偏资讯与检索。" },
    { title: "收费差距明显", body: "订阅与项目制并存，公开客单价大约相差 3 倍。" },
    { title: "空隙仍在数据", body: "产业园经营数据缺少可复用模板，适合作为差异化入口。" },
  ],
  tableLabel: "竞品对比",
  table: [
    { cells: ["维度", "我方", "竞品 A"] },
    { cells: ["定位", "经营研究", "资讯工具"], emphasize: [1] },
    { cells: ["收费", "订阅", "项目制"], emphasize: [1] },
    { cells: ["数据", "可复用", "分散"], emphasize: [1] },
  ],
  chartTitle: "功能覆盖与客单价",
  chartRange: "当前样本",
  legend: ["功能覆盖", "客单价"],
  chartCaption: "样本竞品的功能覆盖与客单价逐级上升",
  labels: ["我方", "竞品A", "竞品B"],
  followUps: ["细化竞品收费与续约差异", "补充可复用的数据能力清单", "整理成竞品对比一页纸"],
};

const finance: ConversationReply = {
  prompt: "请复盘收入、利润和现金流的近期变化。",
  agent: "CHOPCHAT · FINANCE",
  title: "财务数据复盘摘要",
  insights: [
    { title: "收入保持增长", body: "近三个季度收入连续上升，增速从 6% 回到 11%。" },
    { title: "利润率趋稳", body: "毛利率维持在 42% 附近，费用率没有继续抬升。" },
    { title: "现金流转正", body: "经营现金流由负转正，回款改善是主要原因。" },
  ],
  tableLabel: "财务复盘",
  table: [
    { cells: ["季度", "收入增速", "经营现金流"] },
    { cells: ["Q1", "6.2%", "-0.4 亿"], emphasize: [1] },
    { cells: ["Q2", "8.1%", "0.2 亿"], emphasize: [1] },
    { cells: ["Q3", "11.4%", "0.9 亿"], emphasize: [1] },
  ],
  chartTitle: "收入增速与现金流",
  chartRange: "近三季",
  legend: ["收入增速", "现金流"],
  chartCaption: "近三个季度收入增速与经营现金流同步改善",
  labels: ["Q1", "Q2", "Q3"],
  followUps: ["拆解费用率变化的主要科目", "对比同业利润与现金流质量", "输出下一季度跟踪清单"],
};

const market: ConversationReply = {
  prompt: "请测算目标市场的 TAM、SAM 与 SOM。",
  agent: "CHOPCHAT · MARKET",
  title: "市场规模测算摘要",
  insights: [
    { title: "TAM 约 860 亿", body: "按全国产业园运营服务支出估算，总市场约 860 亿元。" },
    { title: "SAM 约 140 亿", body: "可服务的核心城市与机构客户约占 16%。" },
    { title: "SOM 约 9 亿", body: "三年内可触达份额按 6% 估算，约 9 亿元。" },
  ],
  tableLabel: "市场规模",
  table: [
    { cells: ["口径", "规模", "占比"] },
    { cells: ["TAM", "860 亿", "100%"], emphasize: [1] },
    { cells: ["SAM", "140 亿", "16%"], emphasize: [1] },
    { cells: ["SOM", "9 亿", "6%"], emphasize: [1] },
  ],
  chartTitle: "市场口径对比",
  chartRange: "三年视角",
  legend: ["可服务规模", "可触达份额"],
  chartCaption: "从 TAM 收到 SOM，可服务规模逐级收敛",
  labels: ["TAM", "SAM", "SOM"],
  followUps: ["说明 SAM 与 SOM 的测算假设", "按城市层级拆分可服务市场", "把测算结果整理成简报"],
};

const memo: ConversationReply = {
  prompt: "请整理项目亮点、主要风险和投资建议。",
  agent: "CHOPCHAT · MEMO",
  title: "投资备忘录摘要",
  insights: [
    { title: "亮点在运营", body: "出租率与续租价格同步改善，收入质量好于同业。" },
    { title: "风险在区域", body: "个别园区去化偏慢，短期可能拖累整体出租率。" },
    { title: "建议先跟踪", body: "维持观察，并按季度复核现金流与重点园区去化。" },
  ],
  tableLabel: "投资备忘要点",
  table: [
    { cells: ["项目", "判断", "动作"] },
    { cells: ["运营", "改善", "继续跟踪"], emphasize: [1] },
    { cells: ["区域", "分化", "单独复核"], emphasize: [1] },
    { cells: ["建议", "观察", "季度更新"], emphasize: [1] },
  ],
  chartTitle: "关注度与完整度",
  chartRange: "本次备忘",
  legend: ["关注度", "信息完整度"],
  chartCaption: "亮点、风险与建议的信息完整度逐项提高",
  labels: ["亮点", "风险", "建议"],
  followUps: ["补充重点园区去化细节", "量化区域风险对估值的影响", "改写成投委会发言提纲"],
};

const replies: Record<string, ConversationReply> = {
  industry,
  competitor,
  finance,
  market,
  memo,
};

export function replyForConversation(id: string, prompt?: string): ConversationReply {
  if (!prompt || replies[id]) return replies[id] ?? replyFromPrompt(prompt ?? "新的研究问题");
  return replyFromPrompt(prompt);
}

function replyFromPrompt(prompt: string): ConversationReply {
  const topic = prompt.replace(/^请使用「[^」]+」：/, "").trim().slice(0, 18);
  return {
    prompt,
    agent: "CHOPCHAT",
    title: `${topic || "本次问题"}摘要`,
    insights: [
      { title: "问题已确认", body: `围绕「${topic || "本次问题"}」整理范围、依据和下一步。` },
      { title: "依据仍需补齐", body: "当前以公开信息作初步判断，关键数据可以继续补充。" },
      { title: "可以继续追问", body: "下一步适合收窄对象、时间范围或输出格式。" },
    ],
    tableLabel: "初步判断",
    table: [
      { cells: ["项目", "判断", "下一步"] },
      { cells: ["范围", "已确认", "可收窄"], emphasize: [1] },
      { cells: ["依据", "初步", "待补充"], emphasize: [1] },
      { cells: ["输出", "摘要", "可导出"], emphasize: [1] },
    ],
    chartTitle: "判断完整度",
    chartRange: "本次回答",
    legend: ["完整度", "可执行性"],
    followUps: ["对比不同园区的出租率差异", "解释收入增长的主要驱动因素", "把结论整理成投资备忘录"],
    chartCaption: "范围、依据与输出的完整度逐项提高",
    labels: ["范围", "依据", "输出"],
  };
}
