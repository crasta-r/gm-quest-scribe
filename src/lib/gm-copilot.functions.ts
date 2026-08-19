import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({ situation: z.string().min(5).max(4000) });

export const askCoPilot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const { askAnthropic } = await import("./gm-copilot.server");
    return await askAnthropic(data.situation);
  });
