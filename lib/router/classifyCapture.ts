import { askClaudeJson } from "@/lib/ai/anthropic";
import { askOpenAiJson } from "@/lib/ai/openai";
import type { Classification } from "@/lib/types";

const SYSTEM =
  "You classify a captured voice/text note. " +
  'Return {"kind": "task"|"journal"|"note"|"decision", "urgency": "today"|"this_week"|"this_month"|"someday", ' +
  '"entity_id": string|null, "tags": string[], "summary": string}. ' +
  "entity_id must be one of the given known entity ids, or null if none clearly match — never invent one. " +
  "tags are short lowercase keywords. summary is a one-sentence paraphrase.";

function validate(raw: Partial<Classification>, knownEntityIds: string[]): Classification {
  const entityId = typeof raw.entity_id === "string" ? raw.entity_id : null;
  return {
    kind: raw.kind === "task" || raw.kind === "note" || raw.kind === "decision" ? raw.kind : "journal",
    urgency:
      raw.urgency === "today" || raw.urgency === "this_week" || raw.urgency === "this_month"
        ? raw.urgency
        : "someday",
    entity_id: entityId && knownEntityIds.includes(entityId) ? entityId : null,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : [],
    summary: typeof raw.summary === "string" ? raw.summary : "",
  };
}

/** Last resort when both LLMs are unavailable — crude, but keeps the pipeline alive. */
function regexClassify(text: string): Classification {
  const lower = text.toLowerCase();
  const urgency = /\b(today|asap|now)\b/.test(lower)
    ? "today"
    : /\bthis week\b/.test(lower)
      ? "this_week"
      : "someday";
  const kind = /\b(remind|todo|task|need to|have to|don't forget)\b/.test(lower) ? "task" : "journal";
  return { kind, urgency, entity_id: null, tags: [], summary: text.slice(0, 140) };
}

export async function classifyCapture(
  text: string,
  knownEntityIds: string[],
): Promise<{ classification: Classification; llm_source: "anthropic" | "openai" | "regex" }> {
  const prompt = `Known entity ids: ${JSON.stringify(knownEntityIds)}\n\nCapture: "${text}"`;

  try {
    const raw = await askClaudeJson<Partial<Classification>>(SYSTEM, prompt);
    return { classification: validate(raw, knownEntityIds), llm_source: "anthropic" };
  } catch (err) {
    console.error("classifyCapture: anthropic failed, falling back to openai", err);
  }

  try {
    const raw = await askOpenAiJson<Partial<Classification>>(SYSTEM, prompt);
    return { classification: validate(raw, knownEntityIds), llm_source: "openai" };
  } catch (err) {
    console.error("classifyCapture: openai failed, falling back to regex", err);
  }

  return { classification: regexClassify(text), llm_source: "regex" };
}
