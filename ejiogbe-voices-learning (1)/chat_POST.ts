import { schema } from "./chat_POST.schema";
import { GoogleGenAI } from "@google/genai";
import {
  checkRateLimit,
  incrementRateLimit,
  AI_ENDPOINT_LIMIT,
} from "../../helpers/rateLimiter";
import { getClientIp } from "../../helpers/getClientIp";
import { detectIntent, INTENT_RAG_TABLES } from "../../helpers/fenixSuggestions";
import { buildSystemPrompt } from "../../helpers/systemPrompts";
import { ragSearch, formatRAGContext } from "../../helpers/ragSearch";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Navigation intent pattern — skip RAG for simple page moves
const NAVIGATION_PATTERN =
  /^(show me|go to|take me to|open|browse|navigate to)\b/i;

export async function handle(request: Request) {
  const clientIp = getClientIp(request);

  try {
    const rateLimitResult = await checkRateLimit(
      clientIp,
      "voice_assistant_chat",
      AI_ENDPOINT_LIMIT,
    );

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many requests. Please try again in ${
            rateLimitResult.waitSeconds || 60
          } seconds.`,
        }),
        { status: 429 },
      );
    }

    const json = await request.json();
    const { query, history, context } = schema.parse(json);

    await incrementRateLimit(
      clientIp,
      "voice_assistant_chat",
      AI_ENDPOINT_LIMIT,
    );

    // ── 1. Detect intent from user's message ──
    const intent = detectIntent(query);

    // ── 2. RAG: fetch relevant content (skip for simple navigation) ──
    let ragContext = "";
    if (!NAVIGATION_PATTERN.test(query.trim())) {
      const tables = INTENT_RAG_TABLES[intent] || INTENT_RAG_TABLES.general;
      const results = await ragSearch(query, tables, 5);
      ragContext = formatRAGContext(results);
    }

    // ── 3. Build system prompt ──
    const systemPrompt = buildSystemPrompt(intent, context || {}, ragContext);

    // ── 4. Build multi-turn conversation ──
    const contents: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood." }] },
    ];

    // Append conversation history
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Append current query
    contents.push({ role: "user", parts: [{ text: query }] });

    // ── 5. Stream response ──
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Adjust max tokens based on intent
    const maxTokens = intent === "wellness" ? 1200 : 800;

    (async () => {
      try {
        console.log(
          `Fenix [${intent}] query:`,
          query.substring(0, 80),
        );

        const result = await genAI.models.generateContentStream({
          model: "gemini-3-flash-preview",
          contents,
          config: {
            maxOutputTokens: maxTokens,
          },
        });

        let buffer = "";
        const MAX_CHUNK_SIZE = 300;
        let isFirstChunk = true;
        let currentLang = "en"; // Track language for TTS routing

        for await (const chunk of result) {
          const chunkText = chunk.text;
          if (!chunkText) continue;

          buffer += chunkText;

          // Send raw text for display
          const textEvent = `data: ${JSON.stringify({ type: "text", content: chunkText })}\n\n`;
          await writer.write(encoder.encode(textEvent));

          // First chunk: smaller threshold for faster time-to-first-audio
          const threshold = isFirstChunk ? 40 : 60;

          if (buffer.length < threshold && !/[.!?:;]/.test(buffer)) {
            continue;
          }

          // Check for punctuation to emit audio chunk
          const punctuationMatch = buffer.match(/[.!?;:]/);
          if (punctuationMatch && buffer.length >= threshold) {
            const lastPuncIndex = Math.max(
              buffer.lastIndexOf("."),
              buffer.lastIndexOf("!"),
              buffer.lastIndexOf("?"),
              buffer.lastIndexOf(";"),
              buffer.lastIndexOf(":"),
            );

            if (lastPuncIndex > 0) {
              let audioChunk = buffer.substring(0, lastPuncIndex + 1).trim();
              buffer = buffer.substring(lastPuncIndex + 1).trim();

              // Extract [LANG: xx] tag for TTS routing
              const langMatch = audioChunk.match(/\[LANG:\s*([^\]]+)\]/);
              if (langMatch) {
                currentLang = langMatch[1].trim();
                audioChunk = audioChunk.replace(langMatch[0], "").trim();
              }

              if (audioChunk.length > 0) {
                const audioEvent = `data: ${JSON.stringify({
                  type: "audio-chunk",
                  content: audioChunk,
                  lang: currentLang,
                })}\n\n`;
                await writer.write(encoder.encode(audioEvent));
                isFirstChunk = false;
              }
            }
          }

          // Force split if buffer too large
          if (buffer.length > MAX_CHUNK_SIZE) {
            let splitIndex = buffer.lastIndexOf(",", MAX_CHUNK_SIZE);
            if (splitIndex < threshold) {
              splitIndex = buffer.lastIndexOf(" ", MAX_CHUNK_SIZE);
            }
            if (splitIndex < threshold) {
              splitIndex = MAX_CHUNK_SIZE;
            }

            let audioChunk = buffer.substring(0, splitIndex + 1).trim();
            buffer = buffer.substring(splitIndex + 1).trim();

            // Extract [LANG: xx] here too
            const langMatch = audioChunk.match(/\[LANG:\s*([^\]]+)\]/);
            if (langMatch) {
              currentLang = langMatch[1].trim();
              audioChunk = audioChunk.replace(langMatch[0], "").trim();
            }

            if (audioChunk.length > 0) {
              const audioEvent = `data: ${JSON.stringify({
                type: "audio-chunk",
                content: audioChunk,
                lang: currentLang,
              })}\n\n`;
              await writer.write(encoder.encode(audioEvent));
              isFirstChunk = false;
            }
          }
        }

        // Flush remaining buffer
        if (buffer.trim().length > 0) {
          let finalChunk = buffer.trim();
          const langMatch = finalChunk.match(/\[LANG:\s*([^\]]+)\]/);
          if (langMatch) {
            currentLang = langMatch[1].trim();
            finalChunk = finalChunk.replace(langMatch[0], "").trim();
          }

          if (finalChunk.length > 0) {
            const audioEvent = `data: ${JSON.stringify({
              type: "audio-chunk",
              content: finalChunk,
              lang: currentLang,
            })}\n\n`;
            await writer.write(encoder.encode(audioEvent));
          }
        }

        const doneEvent = `data: ${JSON.stringify({ type: "done" })}\n\n`;
        await writer.write(encoder.encode(doneEvent));
      } catch (error: any) {
        console.error("Streaming error:", error);
        const errorEvent = `data: ${JSON.stringify({ type: "error", message: "Stream failed: " + error.message })}\n\n`;
        await writer.write(encoder.encode(errorEvent));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("Request handling error:", error);
    return new Response(
      JSON.stringify({ error: "Request Failed: " + error.message }),
      { status: 500 },
    );
  }
}
