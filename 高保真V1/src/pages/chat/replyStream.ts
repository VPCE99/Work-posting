import type { ConversationReply } from "./conversationReplies";

/** Incremental answer events. A live agent can yield the same sequence from its token stream. */
export type AssistantStreamEvent =
  | { type: "header"; agent: string; title: string }
  | { type: "insight-start"; title: string }
  | { type: "insight-delta"; text: string }
  | { type: "table" }
  | { type: "chart" }
  | { type: "actions" }
  | { type: "done" };

export type ReplyView = {
  agent: string;
  title: string;
  insights: Array<{ title: string; body: string }>;
  table: boolean;
  chart: boolean;
  actions: boolean;
  done: boolean;
};

export type ReplyStreamer = (input: {
  conversationId: string;
  prompt: string;
  reply: ConversationReply;
  signal?: AbortSignal;
}) => AsyncIterable<AssistantStreamEvent>;

const CHUNK_CHARS = 2;
const CHUNK_MS = 32;
const SECTION_MS = 180;

export function emptyReplyView(): ReplyView {
  return { agent: "", title: "", insights: [], table: false, chart: false, actions: false, done: false };
}

export function replyViewFromMock(reply: ConversationReply): ReplyView {
  return {
    agent: reply.agent,
    title: reply.title,
    insights: reply.insights.map((item) => ({ title: item.title, body: item.body })),
    table: true,
    chart: true,
    actions: true,
    done: true,
  };
}

export function reduceReplyStream(view: ReplyView, event: AssistantStreamEvent): ReplyView {
  switch (event.type) {
    case "header":
      return { ...view, agent: event.agent, title: event.title };
    case "insight-start":
      return { ...view, insights: [...view.insights, { title: event.title, body: "" }] };
    case "insight-delta": {
      const insights = view.insights.slice();
      const last = insights[insights.length - 1];
      if (!last) return view;
      insights[insights.length - 1] = { ...last, body: last.body + event.text };
      return { ...view, insights };
    }
    case "table":
      return { ...view, table: true };
    case "chart":
      return { ...view, chart: true };
    case "actions":
      return { ...view, actions: true };
    case "done":
      return { ...view, done: true };
    default:
      return view;
  }
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The answer stream was aborted.", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("The answer stream was aborted.", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Replays the current mock reply as a stream until a live agent replaces `replyStreamer`. */
export async function* mockReplyStreamer(input: {
  conversationId: string;
  prompt: string;
  reply: ConversationReply;
  signal?: AbortSignal;
}): AsyncGenerator<AssistantStreamEvent> {
  const { reply, signal } = input;
  yield { type: "header", agent: reply.agent, title: reply.title };
  await wait(SECTION_MS, signal);
  for (const insight of reply.insights) {
    yield { type: "insight-start", title: insight.title };
    await wait(CHUNK_MS, signal);
    for (let index = 0; index < insight.body.length; index += CHUNK_CHARS) {
      yield { type: "insight-delta", text: insight.body.slice(index, index + CHUNK_CHARS) };
      await wait(CHUNK_MS, signal);
    }
    await wait(SECTION_MS, signal);
  }
  yield { type: "table" };
  await wait(SECTION_MS, signal);
  yield { type: "chart" };
  await wait(SECTION_MS, signal);
  yield { type: "actions" };
  yield { type: "done" };
}

/** Swap this binding for the live agent stream when the backend is connected. */
export const replyStreamer: ReplyStreamer = mockReplyStreamer;
