import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Entity types specific to African diasporic oral traditions
// These will be extracted from transcript chunks via Gemini
// ─────────────────────────────────────────────────────────────

export const EntityType = z.enum([
  "deity",             // Orisha, Lwa, Nkisi, etc.
  "divination_sign",   // Odu (Ifá), etc.
  "proverb",           // Owe, adages, sayings
  "ritual",            // Ebó, ceremonies, initiations
  "sacred_object",     // Tools, implements, offerings
  "lineage",           // Houses, families, spiritual lineages
  "place",             // Sacred sites, cities, countries
  "person",            // Historical/mythological figures, titles
  "tradition",         // Ifá, Candomblé, Santería, Vodou, Palo, etc.
  "concept",           // Ashe, Iwa, Ori, cosmological ideas
  "language",          // Yoruba, Fon, Kikongo, Portuguese, etc.
  "plant_animal",      // Sacred plants, animals, natural elements
  "song_chant",        // Oríkì, songs, invocations
]);

export type EntityType = z.infer<typeof EntityType>;

export const ExtractedEntity = z.object({
  name: z.string().describe("The entity name, preferring the original language term"),
  type: EntityType.describe("The category of this entity"),
  original_language: z.string().optional().describe("The source language if not English, e.g. Yoruba, Fon, Haitian Creole"),
  english_gloss: z.string().optional().describe("Brief English translation or explanation if the name is in another language"),
  confidence: z.number().min(0).max(1).describe("How confident the extraction is, from 0 to 1"),
});

export const ExtractedRelationship = z.object({
  source: z.string().describe("Name of the source entity"),
  target: z.string().describe("Name of the target entity"),
  relationship: z.string().describe("The nature of the connection, e.g. governs, teaches, variant_of, presides_over, references"),
});

export const ExtractionResult = z.object({
  entities: z.array(ExtractedEntity).describe("All entities found in this text chunk"),
  relationships: z.array(ExtractedRelationship).describe("Relationships between extracted entities"),
  themes: z.array(z.string()).describe("High level themes present, e.g. creation, healing, justice, initiation, ancestors"),
  languages_detected: z.array(z.string()).describe("Languages present in the text"),
  tradition_context: z.string().optional().describe("Which tradition this content most closely relates to, e.g. Ifá, Candomblé, Vodou"),
});

export type ExtractedEntity = z.infer<typeof ExtractedEntity>;
export type ExtractedRelationship = z.infer<typeof ExtractedRelationship>;
export type ExtractionResult = z.infer<typeof ExtractionResult>;
