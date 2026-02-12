import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "./schema";

// ─────────────────────────────────────────────────────────────
// Gemini entity extraction with structured output
// Uses responseSchema to guarantee valid JSON matching our schema
// ─────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Gemini uses its own schema format (Type enum), not Zod directly.
// We define the response schema using Gemini's native Type system
// for guaranteed structured output.

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entities: {
      type: Type.ARRAY,
      description: "All entities found in this text chunk",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The entity name, preferring the original language term",
          },
          type: {
            type: Type.STRING,
            description: "The category of this entity",
            enum: [
              "deity", "divination_sign", "proverb", "ritual",
              "sacred_object", "lineage", "place", "person",
              "tradition", "concept", "language", "plant_animal",
              "song_chant",
            ],
          },
          original_language: {
            type: Type.STRING,
            description: "The source language if not English, e.g. Yoruba, Fon, Haitian Creole",
          },
          english_gloss: {
            type: Type.STRING,
            description: "Brief English translation or explanation if the name is in another language",
          },
          confidence: {
            type: Type.NUMBER,
            description: "How confident the extraction is, from 0 to 1",
          },
        },
        propertyOrdering: ["name", "type", "original_language", "english_gloss", "confidence"],
        required: ["name", "type", "confidence"],
      },
    },
    relationships: {
      type: Type.ARRAY,
      description: "Relationships between extracted entities",
      items: {
        type: Type.OBJECT,
        properties: {
          source: {
            type: Type.STRING,
            description: "Name of the source entity",
          },
          target: {
            type: Type.STRING,
            description: "Name of the target entity",
          },
          relationship: {
            type: Type.STRING,
            description:
              "The nature of the connection, e.g. governs, teaches, variant_of, presides_over, references, contains, originated_in",
          },
        },
        propertyOrdering: ["source", "target", "relationship"],
        required: ["source", "target", "relationship"],
      },
    },
    themes: {
      type: Type.ARRAY,
      description:
        "High level themes present, e.g. creation, healing, justice, initiation, ancestors",
      items: { type: Type.STRING },
    },
    languages_detected: {
      type: Type.ARRAY,
      description: "Languages present in the text",
      items: { type: Type.STRING },
    },
    tradition_context: {
      type: Type.STRING,
      description:
        "Which tradition this content most closely relates to, e.g. Ifá, Candomblé, Vodou, Santería, Palo Mayombe",
    },
  },
  propertyOrdering: [
    "entities",
    "relationships",
    "themes",
    "languages_detected",
    "tradition_context",
  ],
  required: ["entities", "relationships", "themes", "languages_detected"],
};

const SYSTEM_PROMPT = `You are an expert in African diasporic spiritual traditions including Ifá-Orisa, Candomblé, Santería/Lucumí, Haitian Vodou, Palo Mayombe, and related practices. You are also knowledgeable about West African languages (Yoruba, Fon, Ewe, Kikongo) and their use in sacred contexts.

Your task is to extract structured entities, relationships, and themes from oral tradition transcripts and translations. Follow these rules:

1. ALWAYS prefer original-language terms as entity names. "Oshun" not "goddess of rivers." "Ogbè Méjì" not "first odu."
2. Include an english_gloss only when the original term is in a non-English language.
3. Recognize cross-tradition variants: Oshun (Yoruba) = Ochún (Lucumí) = Oxum (Candomblé). Note these as separate entities with a "variant_of" relationship.
4. Extract relationships that are explicitly stated or strongly implied. Do not hallucinate connections.
5. Be sensitive to sacred content. Extract factually without editorializing.
6. For divination signs, use standard notation (e.g. Ogbè Méjì, Ìrosùn Méjì).
7. Themes should be broad and reusable: creation, healing, justice, initiation, ancestors, fertility, war, commerce, divination, death, transformation, migration, sacrifice.
8. Set confidence below 0.7 for any entity you are uncertain about.`;

export async function extractEntities(
  textChunk: string,
  options?: { model?: string }
): Promise<ExtractionResult> {
  const model = options?.model ?? "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: textChunk,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_SCHEMA,
      temperature: 0.1, // Low temperature for consistent extraction
    },
  });

  const parsed: ExtractionResult = JSON.parse(response.text!);
  return parsed;
}

// ─────────────────────────────────────────────────────────────
// Batch extraction with rate limiting
// Gemini Flash has generous limits but we still want to be safe
// ─────────────────────────────────────────────────────────────

export async function extractEntitiesBatch(
  chunks: { id: string; content: string }[],
  options?: {
    model?: string;
    concurrency?: number;
    delayMs?: number;
    onProgress?: (completed: number, total: number, id: string) => void;
    onError?: (id: string, error: Error) => void;
  }
): Promise<Map<string, ExtractionResult>> {
  const results = new Map<string, ExtractionResult>();
  const concurrency = options?.concurrency ?? 3;
  const delayMs = options?.delayMs ?? 200;

  // Process in batches of `concurrency`
  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency);

    const promises = batch.map(async (chunk) => {
      try {
        const result = await extractEntities(chunk.content, {
          model: options?.model,
        });
        results.set(chunk.id, result);
        options?.onProgress?.(results.size, chunks.length, chunk.id);
      } catch (error) {
        options?.onError?.(chunk.id, error as Error);
        // Store a minimal result so we can retry later
        results.set(chunk.id, {
          entities: [],
          relationships: [],
          themes: [],
          languages_detected: [],
        });
      }
    });

    await Promise.all(promises);

    // Rate limit between batches
    if (i + concurrency < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
