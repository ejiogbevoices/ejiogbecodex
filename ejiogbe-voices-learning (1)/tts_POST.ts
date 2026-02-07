import { schema } from "./tts_POST.schema";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import superjson from "superjson";
import {
  checkRateLimit,
  incrementRateLimit,
  AI_ENDPOINT_LIMIT,
} from "../../helpers/rateLimiter";
import { getClientIp } from "../../helpers/getClientIp";
import { resolveVoice } from "../../helpers/voiceMap";

export async function handle(request: Request) {
  const clientIp = getClientIp(request);

  try {
    const rateLimitResult = await checkRateLimit(
      clientIp,
      "voice_assistant_tts",
      AI_ENDPOINT_LIMIT,
    );

    if (!rateLimitResult.allowed) {
      return new Response(
        superjson.stringify({
          error: `Too many requests. Please try again in ${
            rateLimitResult.waitSeconds || 60
          } seconds.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    const json = await request.json();
    const { text, languageCode } = schema.parse(json);

    await incrementRateLimit(
      clientIp,
      "voice_assistant_tts",
      AI_ENDPOINT_LIMIT,
    );

    if (!process.env.GCP_TTS_SERVICE_ACCOUNT_JSON) {
      throw new Error("GCP_TTS_SERVICE_ACCOUNT_JSON is not set");
    }

    const credentials = JSON.parse(process.env.GCP_TTS_SERVICE_ACCOUNT_JSON);
    const client = new TextToSpeechClient({ credentials });

    // Resolve the best voice for this language
    const voice = resolveVoice(languageCode || "en");

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
      },
      audioConfig: { audioEncoding: "MP3" },
    });

    if (!response.audioContent) {
      throw new Error("No audio content received from Google TTS");
    }

    return new Response(response.audioContent as Uint8Array, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("TTS Error:", error);
    return new Response(
      superjson.stringify({ error: error.message || "TTS generation failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
