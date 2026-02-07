import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  text: z.string().min(1).max(500),
  languageCode: z.string().max(20).optional(),
});

export type InputType = z.infer<typeof schema>;

export const postTts = async (
  body: InputType,
  init?: RequestInit,
): Promise<Blob> => {
  const validatedInput = schema.parse(body);
  const result = await fetch("/_api/voice-assistant/tts", {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorText = await result.text();
    let errorMessage = "TTS request failed";
    try {
      const errorObj = superjson.parse<{ error: string }>(errorText);
      errorMessage = errorObj.error;
    } catch (e) {
      errorMessage = errorText || result.statusText;
    }
    throw new Error(errorMessage);
  }

  return await result.blob();
};
