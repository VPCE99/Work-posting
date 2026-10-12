/** A choice the agent cannot make on its own. */
export type PlanConfirmation = {
  id: string;
  question: string;
  options: Array<{ id: string; label: string }>;
};

/**
 * Future agent entry. Return a confirmation to pause the current turn, or null to finish it.
 * `turnIndex` counts agent runs started in this visit, beginning at 1.
 */
export type PlanConfirmationProvider = (input: {
  conversationId: string;
  turnIndex: number;
  prompt: string;
}) => PlanConfirmation | null;

/** Mock cadence until a live agent supplies `PlanConfirmationProvider`. */
export const PLAN_CONFIRMATION_EVERY = 4;

const financialReportConfirmation: PlanConfirmation = {
  id: "financial-report",
  question: "你选择的是哪一份财报",
  options: [
    { id: "2024-annual", label: "2024 年年度报告" },
    { id: "2025-interim", label: "2025 年半年度报告" },
    { id: "2025-q3", label: "2025 年第三季度报告" },
  ],
};

export function mockPlanConfirmationProvider(input: {
  conversationId: string;
  turnIndex: number;
  prompt: string;
}): PlanConfirmation | null {
  if (input.turnIndex % PLAN_CONFIRMATION_EVERY !== 0) return null;
  return {
    ...financialReportConfirmation,
    id: `${financialReportConfirmation.id}-${input.turnIndex}`,
  };
}

/** Swap this binding for the live agent when the backend is connected. */
export const planConfirmationProvider: PlanConfirmationProvider = mockPlanConfirmationProvider;
