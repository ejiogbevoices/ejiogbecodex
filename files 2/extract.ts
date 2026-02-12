import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "./schema";

// ─────────────────────────────────────────────────────────────
// Gemini entity extraction with structured output
// Entity types map to the 26 Ejiogbe Voices database tables
// ─────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entities: {
      type: Type.ARRAY,
      description: "All entities found in this text",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The entity name as it appears in the source text",
          },
          type: {
            type: Type.STRING,
            description: "Which table category this entity belongs to",
            enum: [
              "artifact", "calendar", "ceremony", "community",
              "dictionary_word", "divination_system", "divination_tool",
              "divination_unit", "food_recipe", "food", "glossary_term",
              "herbal_system", "ingredient", "instrument", "manuscript",
              "myth_entity", "plant", "proverb", "recording",
              "somatic_movement", "somatic_movement_unit", "symbol",
              "tradition", "transcript_segment", "tribe", "writing_system",
            ],
          },
          original_language: {
            type: Type.STRING,
            description: "The language of the term if not English",
          },
          english_gloss: {
            type: Type.STRING,
            description: "English translation if the name is in another language",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Extraction confidence from 0 to 1",
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
            description: "The connection between them, e.g. references, contains, used_in, associated_with, variant_of, part_of, originates_from",
          },
        },
        propertyOrdering: ["source", "target", "relationship"],
        required: ["source", "target", "relationship"],
      },
    },
    themes: {
      type: Type.ARRAY,
      description: "High level themes present in the text",
      items: { type: Type.STRING },
    },
    languages_detected: {
      type: Type.ARRAY,
      description: "Languages present in the text",
      items: { type: Type.STRING },
    },
    tradition_context: {
      type: Type.STRING,
      description: "Which tradition this content relates to, if identifiable",
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

const SYSTEM_PROMPT = `You are an entity extraction system for a cultural preservation database. Your task is to extract structured entities, relationships, and themes from the provided text.

The database contains 26 tables. Classify each extracted entity into the matching category:

- artifact: physical or cultural objects
- calendar: calendrical systems or observance schedules
- ceremony: rituals, rites, initiations, or ceremonial practices
- community: groups, houses, lineages, or congregations
- dictionary_word: vocabulary terms with definitions
- divination_system: systems of divination (e.g. Ifá, Diloggún)
- divination_tool: physical tools used in divination
- divination_unit: individual signs, odu, or units within a divination system
- food_recipe: preparation instructions for ritual or traditional foods
- food: named foods or dishes
- glossary_term: defined terms with contextual meaning
- herbal_system: systems of herbal or plant-based practice
- ingredient: specific ingredients used in recipes or preparations
- instrument: musical instruments or ritual implements
- manuscript: written texts, documents, or historical records
- myth_entity: deities, spirits, ancestors, or mythological figures
- plant: specific plants, herbs, or botanical items
- proverb: sayings, proverbs, or oral wisdom
- recording: audio or video recordings
- somatic_movement: named body movements, dances, or physical practices
- somatic_movement_unit: individual units or steps within a movement
- symbol: visual symbols, signs, or iconographic elements
- tradition: named spiritual, cultural, or religious traditions
- transcript_segment: spoken word transcriptions
- tribe: ethnic groups, peoples, or nations
- writing_system: scripts or writing systems

Rules:
1. Use entity names exactly as they appear in the text. Do not translate or normalize names.
2. Only extract entities and relationships that are explicitly stated or directly implied in the text. Do not infer connections that are not supported by the content.
3. Set confidence below 0.7 for any entity you are uncertain about.
4. If the text contains terms in languages other than English, note the language in original_language and provide an english_gloss.
5. Extract themes as short, reusable labels.
6. Set tradition_context only if the text clearly identifies a specific tradition.`;

export async function extractEntities(
  textChunk: string,
  model?: string
): Promise<ExtractionResult> {
  const response = await ai.models.generateContent({
    model: model ?? "gemini-2.5-flash",
    contents: textChunk,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_SCHEMA,
      temperature: 0.1,
    },
  });

  const parsed: ExtractionResult = JSON.parse(response.text!);
  return parsed;
}

// ─────────────────────────────────────────────────────────────
// Batch extraction with rate limiting
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

  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency);

    const promises = batch.map(async (chunk) => {
      try {
        const result = await extractEntities(chunk.content, options?.model);
        results.set(chunk.id, result);
        options?.onProgress?.(results.size, chunks.length, chunk.id);
      } catch (error) {
        options?.onError?.(chunk.id, error as Error);
        results.set(chunk.id, {
          entities: [],
          relationships: [],
          themes: [],
          languages_detected: [],
        });
      }
    });

    await Promise.all(promises);

    if (i + concurrency < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
