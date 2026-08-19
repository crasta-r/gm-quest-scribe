import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Compass, Dices, Loader2, ScrollText, Shield, Sparkles, Timer } from "lucide-react";

import { askCoPilot } from "@/lib/gm-copilot.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GM Co-Pilot — Improv Help for Quest Craft Game Masters" },
      {
        name: "description",
        content:
          "Describe an unexpected player choice and get outcomes, read-aloud narration, later consequences, GM reminders, and a safety note in seconds.",
      },
      { property: "og:title", content: "GM Co-Pilot — Quest Craft" },
      {
        property: "og:description",
        content:
          "Turn any surprise at the table into branching outcomes, narration, and follow-up threads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SECTIONS = [
  { key: "possibleOutcomes", label: "Possible Outcomes", icon: Dices, tone: "ember" },
  { key: "narration", label: "Narration to Read Aloud", icon: ScrollText, tone: "tide" },
  { key: "consequence", label: "Consequence for Later", icon: Timer, tone: "ember" },
  { key: "gmReminder", label: "GM Reminder", icon: Compass, tone: "tide" },
  { key: "safetyNote", label: "Safety Note", icon: Shield, tone: "tide" },
] as const;

function Index() {
  const [situation, setSituation] = useState("");
  const ask = useServerFn(askCoPilot);
  const mutation = useMutation({
    mutationFn: (text: string) => ask({ data: { situation: text } }),
  });

  const result = mutation.data;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-14">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
          Quest Craft
        </p>
        <h1 className="mt-3 text-5xl font-semibold text-foreground sm:text-6xl">GM Co-Pilot</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          The party did something you never planned for. Describe it, and get outcomes, narration,
          and a thread to pull on later — before the silence gets awkward.
        </p>
      </header>

      <form
        className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-hearth)]"
        onSubmit={(e) => {
          e.preventDefault();
          if (situation.trim().length < 5) return;
          mutation.mutate(situation.trim());
        }}
      >
        <label
          htmlFor="situation"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          What just happened at the table?
        </label>
        <textarea
          id="situation"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={6}
          placeholder="The rogue skipped the heist entirely and proposed marriage to the duchess in front of the whole court..."
          className="mt-3 w-full resize-y rounded-xl border border-input bg-background/60 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Powered by Claude Sonnet · your key stays server-side
          </span>
          <button
            type="submit"
            disabled={mutation.isPending || situation.trim().length < 5}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {mutation.isPending ? "Consulting the oracle…" : "Improvise for me"}
          </button>
        </div>
      </form>

      {mutation.isError ? (
        <p className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-foreground">
          {(mutation.error as Error).message}
        </p>
      ) : null}

      {result ? (
        <section className="mt-10 space-y-4">
          {SECTIONS.map(({ key, label, icon: Icon, tone }) => (
            <article
              key={key}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-hearth)]"
            >
              <h2
                className={`flex items-center gap-2 text-xl font-semibold ${
                  tone === "ember" ? "text-ember" : "text-tide"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {result[key] || "—"}
              </p>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
