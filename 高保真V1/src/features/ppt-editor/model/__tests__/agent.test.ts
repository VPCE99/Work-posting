import { describe, expect, it } from "vitest";
import { agentReplyFor } from "../agent";

describe("agentReplyFor", () => {
  it("selects layout reply for 排版 prompts", () => {
    const reply = agentReplyFor("优化当前页排版", "市场规模");
    expect(reply.title).toBe("排版调整方案");
    expect(reply.text).toContain("市场规模");
  });

  it("selects chart reply for 图表 prompts", () => {
    const reply = agentReplyFor("为当前页生成图表", "封面");
    expect(reply.title).toBe("图表生成计划");
  });

  it("falls back to a generic reply", () => {
    const reply = agentReplyFor("加点注释", "总结");
    expect(reply.title).toBe("已理解你的修改意图");
    expect(reply.text).toContain("加点注释");
  });
});
