import type { AgentAssetPreview, AgentChatMessage, ChartType } from "./types";

export const AGENT_COLLAPSE_MS = 580;
export const AGENT_THINK_MS = 900;

export const agentQuickActions = [
  { label: "优化排版", prompt: "优化当前页排版" },
  { label: "改写文案", prompt: "改写当前页文案" },
  { label: "生成图表", prompt: "为当前页生成图表" },
  { label: "生成图片", prompt: "为当前页生成配图" },
  { label: "提取结论", prompt: "提取当前页核心结论" },
] as const;

export const initialAgentMessages: AgentChatMessage[] = [
  {
    id: "agent-welcome",
    role: "assistant",
    title: "AI 建议",
    text: "建议突出 2025 年出租率改善，并将规模增长作为主视觉。你可以直接追问，或点下方快捷指令开始修改。",
  },
];

function detectAssetKind(prompt: string): AgentAssetPreview["kind"] | null {
  if (/图表|柱状|折线|饼图|条形|面积图|散点/.test(prompt)) return "chart";
  if (/图片|配图|插图|封面图|示意图/.test(prompt)) return "image";
  return null;
}

function chartTypeFor(prompt: string): ChartType {
  if (prompt.includes("折线")) return "line";
  if (prompt.includes("饼")) return "pie";
  if (prompt.includes("条形")) return "bar";
  if (prompt.includes("面积")) return "area";
  if (prompt.includes("散点")) return "scatter";
  return "column";
}

export function agentReplyFor(
  prompt: string,
  slideLabel: string,
): Pick<AgentChatMessage, "title" | "text" | "preview" | "previewStatus"> {
  const normalized = prompt.trim();
  const assetKind = detectAssetKind(normalized);

  if (assetKind === "chart") {
    const chartType = chartTypeFor(normalized);
    return {
      title: "图表已生成，请确认",
      text: `已为「${slideLabel}」准备出租率与规模对比图。预览确认后即可插入当前页；也可放弃本次结果。`,
      preview: {
        kind: "chart",
        chartType,
        caption: "出租率与规模 · 近五年",
      },
      previewStatus: "pending",
    };
  }

  if (assetKind === "image") {
    return {
      title: "配图已生成，请确认",
      text: `已为「${slideLabel}」生成一张配套示意图。预览确认后即可插入当前页；也可放弃本次结果。`,
      preview: {
        kind: "image",
        caption: "园区运营示意图",
      },
      previewStatus: "pending",
    };
  }

  if (normalized.includes("排版")) {
    return {
      title: "排版调整方案",
      text: `已为「${slideLabel}」梳理层级：主标题上移，关键指标并排强调，图表区留白加大。可继续说「再紧凑一点」或指定要突出的模块。`,
    };
  }
  if (normalized.includes("文案") || normalized.includes("改写")) {
    return {
      title: "文案改写建议",
      text: `已重写「${slideLabel}」说明文字，语气更偏投资结论导向。若要更短或更正式，直接补充偏好即可。`,
    };
  }
  if (normalized.includes("结论")) {
    return {
      title: "核心结论",
      text: `「${slideLabel}」可提炼为：规模扩张与出租率双升，2025 改善最明显。需要我直接写进页面标题或要点列表吗？`,
    };
  }
  return {
    title: "已理解你的修改意图",
    text: `针对「${slideLabel}」：${normalized}。我可以继续微调版式、文案或数据强调点，请接着说下一步。`,
  };
}
