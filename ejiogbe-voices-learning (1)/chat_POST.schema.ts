import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  query: z.string().min(1).max(2000, "Query is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
  context: z
    .object({
      recordingId: z.string().max(255).optional(),
      elderId: z.string().max(255).optional(),
      manuscriptId: z.string().max(255).optional(),
      currentPage: z.string().max(255).optional(),
      targetLanguage: z.string().max(20).optional(),
      proficiencyLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .optional(),
    })
    .optional(),
});

export type InputType = z.infer<typeof schema>;

export type StreamEventType =
  | { type: "text"; content: string }
  | { type: "audio-chunk"; content: string; lang?: string }
  | { type: "done" }
  | { type: "error"; message: string };

// Streaming endpoint — use useVoiceAssistantChat hook
export const postChat = async (
  body: InputType,
  init?: RequestInit,
): Promise<void> => {
  throw new Error("Use useVoiceAssistantChat hook for streaming chat");
};
