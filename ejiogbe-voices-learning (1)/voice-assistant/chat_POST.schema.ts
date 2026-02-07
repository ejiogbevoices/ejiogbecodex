import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  query: z.string().min(1).max(2000, "Query is too long"),
  context: z
    .object({
      recordingId: z.string().max(255).optional(),
      elderId: z.string().max(255).optional(),
      manuscriptId: z.string().max(255).optional(),
      currentPage: z.string().max(255).optional(),
    })
    .optional(),
});

export type InputType = z.infer<typeof schema>;

// Output is streamed, so we don't define a strict single OutputType here
// but rather the shape of the events
export type StreamEventType =
  | { type: "text"; content: string }
  | { type: "audio-chunk"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

// Helper function not strictly needed for streaming endpoint as we use fetch directly in the hook
// but kept for consistency if we ever want a non-streaming version
export const postChat = async (
  body: InputType,
  init?: RequestInit
): Promise<void> => {
  // This is a placeholder as the actual implementation uses direct fetch for streaming
  throw new Error("Use useVoiceAssistantChat hook for streaming chat");
};