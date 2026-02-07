import { schema } from "./tts_POST.schema";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import superjson from "superjson";
import {
  checkRateLimit,
  incrementRateLimit,
  AI_ENDPOINT_LIMIT,
} from "../../helpers/rateLimiter";
import { getClientIp } from "../../helpers/getClientIp";

// Initialize client outside handler for reuse if possible, though credentials might need parsing per request if env var changes (unlikely in lambda but safe)
// However, for serverless, it's better to init inside or lazily if we want to handle potential cold start issues or env var parsing errors gracefully.
// Given the requirement to use process.env.GCP_TTS_SERVICE_ACCOUNT_JSON, we'll parse it.

export async function handle(request: Request) {
  const clientIp = getClientIp(request);

  try {
    const rateLimitResult = await checkRateLimit(
      clientIp,
      "voice_assistant_tts",
      AI_ENDPOINT_LIMIT
    );

    if (!rateLimitResult.allowed) {
      return new Response(
        superjson.stringify({
          error: `Too many requests. Please try again in ${
            rateLimitResult.waitSeconds || 60
          } seconds.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse input
    const json = await request.json();
    const { text } = schema.parse(json);

    await incrementRateLimit(clientIp, "voice_assistant_tts", AI_ENDPOINT_LIMIT);

    if (!process.env.GCP_TTS_SERVICE_ACCOUNT_JSON) {
      throw new Error("GCP_TTS_SERVICE_ACCOUNT_JSON is not set");
    }

    const credentials = JSON.parse(process.env.GCP_TTS_SERVICE_ACCOUNT_JSON);
    const client = new TextToSpeechClient({ credentials });

    // Perform TTS request
    const [response] = await client.synthesizeSpeech({
      input: { text },
      // Using en-US-Neural2-D as requested (Male, Neural2 quality)
      voice: { languageCode: "en-US", name: "en-US-Neural2-D" },
      audioConfig: { audioEncoding: "MP3" },
    });

    if (!response.audioContent) {
      throw new Error("No audio content received from Google TTS");
    }

    // Return audio directly
    // response.audioContent can be string | Uint8Array. In Node environment it's usually Buffer (Uint8Array).
    return new Response(response.audioContent as Uint8Array, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("TTS Error:", error);
    // Return JSON error
    return new Response(
      superjson.stringify({ error: error.message || "TTS generation failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}