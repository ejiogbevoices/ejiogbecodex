import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Entity types derived from the 26 Ejiogbe Voices tables.
// When Gemini reads row content, it classifies extracted
// entities into these categories so they can be linked
// back to the appropriate table.
// ─────────────────────────────────────────────────────────────

export const EntityType = z.enum([
  "artifact",
  "calendar",
  "ceremony",
  "community",
  "dictionary_word",
  "divination_system",
  "divination_tool",
  "divination_unit",
  "food_recipe",
  "food",
  "glossary_term",
  "herbal_system",
  "ingredient",
  "instrument",
  "manuscript",
  "myth_entity",
  "plant",
  "proverb",
  "recording",
  "somatic_movement",
  "somatic_movement_unit",
  "symbol",
  "tradition",
  "transcript_segment",
  "tribe",
  "writing_system",
]);

export type EntityType = z.infer<typeof EntityType>;

export const ExtractedEntity = z.object({
  name: z.string().describe("The entity name as it appears in the source text"),
  type: EntityType.describe("Which table category this entity belongs to"),
  original_language: z.string().optional().describe("The language of the term if not English"),
  english_gloss: z.string().optional().describe("English translation if the name is in another language"),
  confidence: z.number().min(0).max(1).describe("Extraction confidence from 0 to 1"),
});

export const ExtractedRelationship = z.object({
  source: z.string().describe("Name of the source entity"),
  target: z.string().describe("Name of the target entity"),
  relationship: z.string().describe("The connection between them, e.g. references, contains, used_in, associated_with, variant_of, part_of, originates_from"),
});

export const ExtractionResult = z.object({
  entities: z.array(ExtractedEntity).describe("All entities found in this text"),
  relationships: z.array(ExtractedRelationship).describe("Relationships between extracted entities"),
  themes: z.array(z.string()).describe("High level themes present in the text"),
  languages_detected: z.array(z.string()).describe("Languages present in the text"),
  tradition_context: z.string().optional().describe("Which tradition this content relates to, if identifiable"),
});

export type ExtractedEntity = z.infer<typeof ExtractedEntity>;
export type ExtractedRelationship = z.infer<typeof ExtractedRelationship>;
export type ExtractionResult = z.infer<typeof ExtractionResult>;
