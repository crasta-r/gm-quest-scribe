// System prompt for GM Co-Pilot. Replace the body of DEFAULT_SYSTEM_PROMPT
// with your own prompt at any time — nothing else needs to change.
export const DEFAULT_SYSTEM_PROMPT = `You are GM Co-Pilot for Quest Craft, an assistant for tabletop RPG Game Masters.
A Game Master will describe an unexpected choice their players made mid-session.
Respond fast, concretely, and in the GM's voice — no preamble, no meta commentary.

Always return five parts:
1. Possible Outcomes — 3 short branching options, each with a likely consequence.
2. Narration to Read Aloud — 2-4 sentences of evocative second-person narration the GM can read verbatim.
3. Consequence for Later — one thread this choice should pay off in a future session.
4. GM Reminder — one practical table-running tip for this moment (pacing, spotlight, rules call).
5. Safety Note — a brief note on tone, content, or a check-in if the scene could touch sensitive ground; if nothing is risky, say so plainly.

Keep each section tight. No markdown headers inside the section text.`;

export type CopilotSections = {
  possibleOutcomes: string;
  narration: string;
  consequence: string;
  gmReminder: string;
  safetyNote: string;
};

const SCHEMA_INSTRUCTION = `Return ONLY a JSON object, no code fences, with exactly these string keys:
"possibleOutcomes", "narration", "consequence", "gmReminder", "safetyNote".`;

function extractJson(text: string): CopilotSections {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const parsed = JSON.parse(slice) as Partial<CopilotSections>;
  return {
    possibleOutcomes: parsed.possibleOutcomes ?? "",
    narration: parsed.narration ?? "",
    consequence: parsed.consequence ?? "",
    gmReminder: parsed.gmReminder ?? "",
    safetyNote: parsed.safetyNote ?? "",
  };
}

export async function askAnthropic(situation: string): Promise<CopilotSections> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    throw new Error("The Anthropic API key is not configured yet.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1600,
      system: `${DEFAULT_SYSTEM_PROMPT}\n\n${SCHEMA_INSTRUCTION}`,
      messages: [{ role: "user", content: situation }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Anthropic error", res.status, detail);
    if (res.status === 401) throw new Error("The Anthropic API key was rejected.");
    if (res.status === 429) throw new Error("Rate limited by Anthropic. Try again in a moment.");
    throw new Error("The oracle is silent — the AI request failed.");
  }

  const json = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = (json.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("\n")
    .trim();

  try {
    return extractJson(text);
  } catch {
    return {
      possibleOutcomes: text,
      narration: "",
      consequence: "",
      gmReminder: "",
      safetyNote: "",
    };
  }
}