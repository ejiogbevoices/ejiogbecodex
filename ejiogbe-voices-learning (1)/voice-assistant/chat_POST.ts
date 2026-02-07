import { schema } from "./chat_POST.schema";
import { GoogleGenAI } from "@google/genai";
import {
  checkRateLimit,
  incrementRateLimit,
  AI_ENDPOINT_LIMIT,
} from "../../helpers/rateLimiter";
import { getClientIp } from "../../helpers/getClientIp";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const SYSTEM_PROMPT = `
You are the voice-first Assistant for Ejiogbe Voices, a digital archive of ancestral intelligence and indigenous knowledge.
Your role is to guide users, answer questions about recordings, elders, manuscripts, and traditions, and help with navigation. 

If the user asks to see a page, include the navigation tag at the very beginning of your response.
Start EVERY response with the navigation tag if a page change is needed: [NAVIGATE: /path]

All navigation commands must be enclosed in square brackets at the very start of your response. Do not use any introductory text before the bracket. Example: '[NAVIGATE: /events] Certainly, here are the events.' Your response will be parsed; the user will not see the bracketed command.
NEVER end a response mid-sentence. If you are near your limit, finish your thought immediately.

ALWAYS detect the language of the user's last message and reply in that EXACT same language. If they speak Spanish, reply in Spanish. If they switch to English, switch to English immediately.

Key Responsibilities:
1.  **Guide & Inform:** Answer questions about the archive's content. Be respectful and culturally sensitive.
2.  **Navigation:** If a user asks to go somewhere, provide a JSON action in your response text like this: \`{"action": "navigate", "path": "/path"}\`. Supported paths: /, /archive, /elders, /search, /about, /contact, /pricing, /upload, /library, /glossary, /collections, /playlists, /events, /blog, /news, /updates, /mission, /partners, /contributors, /guidelines, /documentation, /faqs, /support, /legal, /terms, /privacy, /cookie-policy, /usage-policy, /consent-agreement, /legal-information, /partners-provenance, /login, /register, /account, /reset-password, /apply-editor, /playlists/liked, /manuscripts/liked, /proverbs, /artifacts, /communities, /tribes, /dictionaries, /study, /learning, /myths, /symbols, /ceremonies, /food, /food/recipes, /food/ingredients, /herbalism, /herbalism/plants, /divination, /calendars, /movements, /instruments, /languages, /traditions, /scripts, /vocabulary, /organizations, /manuscripts.
3.  **Search:** If a user is looking for something specific, suggest they use the search page or provide a direct link if you know it (simulated for now).
4.  **Conciseness:** Speak in short, conversational bursts. Never exceed two sentences per turn. If a topic is complex, give a high-level summary and ask if the user wants details.No lists. No digressions. Be concise.
5.  **Translation:** Assist with basic translation requests if asked.

Tone:
- Respectful, calm, and knowledgeable.
- Reverent towards the ancestral wisdom.

Current Context:
The user is currently viewing: {{CURRENT_PAGE}}
Context IDs provided: {{CONTEXT_IDS}}
`;

export async function handle(request: Request) {
  const clientIp = getClientIp(request);

  try {
    const rateLimitResult = await checkRateLimit(
      clientIp,
      "voice_assistant_chat",
      AI_ENDPOINT_LIMIT
    );

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many requests. Please try again in ${
            rateLimitResult.waitSeconds || 60
          } seconds.`,
        }),
        { status: 429 }
      );
    }

    const json = await request.json();
    const { query, context } = schema.parse(json);

    await incrementRateLimit(clientIp, "voice_assistant_chat", AI_ENDPOINT_LIMIT);

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        let promptContext = `Current Page: ${context?.currentPage || "Unknown"}\n`;
        if (context?.recordingId) {
          promptContext += `Recording ID: ${context.recordingId}\n`;
        }
        if (context?.elderId) {
          promptContext += `Elder ID: ${context.elderId}\n`;
        }
        if (context?.manuscriptId) {
          promptContext += `Manuscript ID: ${context.manuscriptId}\n`;
        }

        const fullSystemPrompt = SYSTEM_PROMPT.replace(
          "{{CURRENT_PAGE}}",
          context?.currentPage || "Unknown",
        ).replace("{{CONTEXT_IDS}}", promptContext);

        console.log("Generating response for query:", query);

        const result = await genAI.models.generateContentStream({
          model: "gemini-3-flash-preview",
          contents: fullSystemPrompt + "\n\nUser Query: " + query,
          config: {
            maxOutputTokens: 800,
          },
        });

        let buffer = "";
        const MAX_CHUNK_SIZE = 300;
        let isFirstChunk = true;

        for await (const chunk of result) {
          const chunkText = chunk.text;
          if (!chunkText) continue;

          buffer += chunkText;

          // Send raw text for display
          const textEvent = `data: ${JSON.stringify({ type: "text", content: chunkText })}\n\n`;
          await writer.write(encoder.encode(textEvent));

          // First chunk optimization: use smaller threshold for faster time-to-first-audio
          const threshold = isFirstChunk ? 40 : 60;

          if (buffer.length < threshold && !/[.!?:;]/.test(buffer)) {
            // Keep buffering
            continue;
          }

          // Check for punctuation to emit audio chunk
          const punctuationMatch = buffer.match(/[.!?;:]/);
          if (punctuationMatch && buffer.length >= threshold) {
            // Find last punctuation in buffer
            const lastPuncIndex = Math.max(
              buffer.lastIndexOf("."),
              buffer.lastIndexOf("!"),
              buffer.lastIndexOf("?"),
              buffer.lastIndexOf(";"),
              buffer.lastIndexOf(":"),
            );

            if (lastPuncIndex > 0) {
              const audioChunk = buffer.substring(0, lastPuncIndex + 1).trim();
              buffer = buffer.substring(lastPuncIndex + 1).trim();

              if (audioChunk.length > 0) {
                const audioEvent = `data: ${JSON.stringify({ type: "audio-chunk", content: audioChunk })}\n\n`;
                await writer.write(encoder.encode(audioEvent));
                isFirstChunk = false;
              }
            }
          }

          // Force split if buffer too large
          if (buffer.length > MAX_CHUNK_SIZE) {
            // Split on comma or space
            let splitIndex = buffer.lastIndexOf(",", MAX_CHUNK_SIZE);
            if (splitIndex < threshold) {
              splitIndex = buffer.lastIndexOf(" ", MAX_CHUNK_SIZE);
            }
            if (splitIndex < threshold) {
              splitIndex = MAX_CHUNK_SIZE;
            }

            const audioChunk = buffer.substring(0, splitIndex + 1).trim();
            buffer = buffer.substring(splitIndex + 1).trim();

            if (audioChunk.length > 0) {
              const audioEvent = `data: ${JSON.stringify({ type: "audio-chunk", content: audioChunk })}\n\n`;
              await writer.write(encoder.encode(audioEvent));
              isFirstChunk = false;
            }
          }
        }

        // Flush remaining buffer
        if (buffer.trim().length > 0) {
          const audioEvent = `data: ${JSON.stringify({ type: "audio-chunk", content: buffer.trim() })}\n\n`;
          await writer.write(encoder.encode(audioEvent));
        }

        console.log("Text streaming complete");

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
      {
        status: 500,
      },
    );
  }
}
