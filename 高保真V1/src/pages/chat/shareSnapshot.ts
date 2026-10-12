/** Frozen view of a conversation, ready for a future share host to publish as a page. */

export type ShareTurn =
  | { role: "user"; text: string }
  | { role: "choice"; question: string; answer: string | null }
  | {
      role: "assistant";
      agent: string;
      title: string;
      insights: Array<{ title: string; body: string }>;
      table: { label: string; rows: string[][] } | null;
      chart: { title: string; range: string; caption: string } | null;
    };

export type ConversationShareSnapshot = {
  id: string;
  conversationId: string;
  title: string;
  capturedAt: string;
  turns: ShareTurn[];
};

export type SharePublication = {
  snapshot: ConversationShareSnapshot;
  /** Preview address. Stays unreachable until a share host replaces `sharePublisher`. */
  url: string;
  reachable: boolean;
};

/** Swap this for a server call that stores the snapshot and returns a public URL. */
export type SharePublisher = (snapshot: ConversationShareSnapshot) => SharePublication;

type SharePlan = { anchorId: string; question: string; answer: string | null };

type ShareAnswer = {
  agent: string;
  title: string;
  insights: Array<{ title: string; body: string }>;
  table: { label: string; rows: string[][] } | null;
  chart: { title: string; range: string; caption: string } | null;
};

function shareId(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
}

function plansFor(plans: SharePlan[], anchorId: string): ShareTurn[] {
  return plans
    .filter((plan) => plan.anchorId === anchorId)
    .map((plan) => ({ role: "choice", question: plan.question, answer: plan.answer }));
}

export function buildConversationShareSnapshot(input: {
  conversationId: string;
  title: string;
  prompt: string;
  followUps: Array<{ id: number; text: string }>;
  plans: SharePlan[];
  answer: ShareAnswer | null;
}): ConversationShareSnapshot {
  const turns: ShareTurn[] = [
    { role: "user", text: input.prompt },
    ...plansFor(input.plans, "initial"),
  ];
  if (input.answer && (input.answer.title || input.answer.insights.length || input.answer.table || input.answer.chart)) {
    turns.push({ role: "assistant", ...input.answer });
  }
  input.followUps.forEach((message) => {
    turns.push({ role: "user", text: message.text });
    turns.push(...plansFor(input.plans, `followup-${message.id}`));
  });

  const body = JSON.stringify({
    conversationId: input.conversationId,
    title: input.title,
    turns,
  });
  return {
    id: `${input.conversationId}-${shareId(body)}`,
    conversationId: input.conversationId,
    title: input.title,
    capturedAt: new Date().toISOString(),
    turns,
  };
}

function mockSharePublisher(snapshot: ConversationShareSnapshot): SharePublication {
  return {
    snapshot,
    url: `https://share.chopchat.example/s/${snapshot.id}`,
    reachable: false,
  };
}

export const sharePublisher: SharePublisher = mockSharePublisher;
