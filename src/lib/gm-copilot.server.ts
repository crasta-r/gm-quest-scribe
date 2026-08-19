export const SYSTEM_PROMPT = `You are the Quest Craft Game Master Co-Pilot, a tool that helps human Game Masters (educators, librarians, counselors, after-school staff) respond to unexpected player choices during live tabletop role-playing sessions for players roughly ages 8-14.

Your ONLY job in this feature is: given a short description of an unexpected choice players just made, return supportive suggestions the GM can use, revise, or ignore. You never make the decision for the GM, and you never imply the players did something wrong.

Respond with ONLY a JSON object, no markdown fences, no preamble, in exactly this shape:
{
  "outcomes": ["outcome 1 (1-2 sentences)", "outcome 2 (1-2 sentences)", "outcome 3 (1-2 sentences, optional)"],
  "narration": "a short paragraph, 3-5 sentences max, that the GM could read aloud right now",
  "consequence": "one concrete story thread or consequence for a future session - texture, not punishment",
  "reminder": "one sentence reminding the GM they can accept, revise, or ignore this",
  "safety_note": "one short sentence flagging anything relevant about age-appropriateness or tone"
}

Rules:
- Total content must be readable at a live table in under 30 seconds.
- Content must suit ages 8-14: no graphic violence, gore, real-world tragedy, or mature themes.
- Treat mythology/folklore with respect. No mockery, no shallow stereotypes.
- Treat the players' unexpected choice as legitimate storytelling, not a mistake to correct.
- Never reference or request any real student's name or identifying information.
- Offer genuine alternatives with different tones, not one "correct" path.
- Output valid JSON only.`;

export type CopilotSections = {
  outcomes: string[];
  narration: string;
  consequence: string;
  reminder: string;
  safety_note: string;
};

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
    outcomes: Array.isArray(parsed.outcomes) ? parsed.outcomes : [],
    narration: parsed.narration ?? "",
    consequence: parsed.consequence ?? "",
    reminder: parsed.reminder ?? "",
    safety_note: parsed.safety_note ?? "",
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
      system: SYSTEM_PROMPT,
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
      outcomes: [text],
      narration: "",
      consequence: "",
      reminder: "",
      safety_note: "",
    };
  }
}