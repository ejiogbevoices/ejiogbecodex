/**
 * Fenix Voice Assistant — RAG Search Helper
 *
 * Shared search function used by both:
 *   - The voice assistant chat route (inline context injection)
 *   - The semantic search endpoint (standalone search)
 *
 * Generates an embedding for the query, then runs cosine distance
 * searches across the specified tables in parallel.
 */

import { generateEmbedding } from "./embeddingGenerator";
import { db } from "./db";
import { sql } from "kysely";

export type RAGResult = {
  type: string;
  id: string;
  title: string;
  snippet: string;
  distance: number;
};

/**
 * Run semantic search across specified tables.
 * Returns results sorted by distance (closest first).
 */
export async function ragSearch(
  query: string,
  tables: string[],
  limit: number = 5,
): Promise<RAGResult[]> {
  const embedding = await generateEmbedding(query);
  if (!embedding) return [];

  const embeddingString = JSON.stringify(embedding);

  const promises = tables.map((table) =>
    searchTable(table, embeddingString, limit),
  );
  const resultsArrays = await Promise.all(promises);

  return resultsArrays
    .flat()
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * Format RAG results into a string block for injection into the system prompt.
 */
export function formatRAGContext(results: RAGResult[]): string {
  if (results.length === 0) return "";

  return (
    "\nRELEVANT CONTENT FROM ARCHIVE:\n" +
    results
      .map(
        (r) =>
          `[${r.type}] ${r.title}: ${(r.snippet || "").substring(0, 200)}`,
      )
      .join("\n")
  );
}

// ─────────────────────────────────────────────
// Per-table search (mirrors semantic_POST.ts logic)
// ─────────────────────────────────────────────

async function searchTable(
  table: string,
  embeddingString: string,
  limit: number,
): Promise<RAGResult[]> {
  try {
    switch (table) {
      case "recordings":
        return db
          .selectFrom("recordings")
          .select([
            "id",
            "title",
            "description as snippet",
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "recording",
              id: r.id,
              title: r.title || "Untitled",
              snippet: (r.snippet || "").substring(0, 200),
              distance: r.distance,
            })),
          );

      case "manuscripts":
        return db
          .selectFrom("manuscripts")
          .select([
            "id",
            "title",
            sql<string>`substring(content, 1, 200)`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "manuscript",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "myth_entities":
        return db
          .selectFrom("mythEntities")
          .select([
            "id",
            sql<string>`name`.as("title"),
            "summaryShort as snippet",
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "myth_entity",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "glossary_terms":
        return db
          .selectFrom("glossaryTerms")
          .select([
            "id",
            sql<string>`term`.as("title"),
            "definition as snippet",
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "glossary_term",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "ceremonies":
        return db
          .selectFrom("ceremonies")
          .select([
            "id",
            "name as title",
            "summaryShort as snippet",
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "ceremony",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "symbols":
        return db
          .selectFrom("symbols")
          .select([
            "id",
            "name as title",
            "description as snippet",
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "symbol",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "dictionary_words":
        return db
          .selectFrom("dictionaryWords")
          .select([
            "id",
            sql<string>`word`.as("title"),
            sql<string>`CONCAT_WS(' - ', definition, english_translation)`.as(
              "snippet",
            ),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "dictionary_word",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "transcript_segments":
        return db
          .selectFrom("transcriptSegments")
          .select([
            "id",
            sql<string>`substring(text_original, 1, 50)`.as("title"),
            sql<string>`text_original`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "transcript_segment",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "plants":
        return db
          .selectFrom("plants")
          .select([
            "id",
            sql<string>`COALESCE(name_primary, name_english, 'Unnamed Plant')`.as(
              "title",
            ),
            sql<string>`COALESCE(medicinal_uses, folk_uses, '')`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "plant",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "divination_systems":
        return db
          .selectFrom("divinationSystems")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`overview`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "divination_system",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "divination_units":
        return db
          .selectFrom("divinationUnits")
          .select([
            "id",
            sql<string>`COALESCE(name, title, 'Unnamed Unit')`.as("title"),
            sql<string>`COALESCE(short_meaning, long_meaning, '')`.as(
              "snippet",
            ),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "divination_unit",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "divination_tools":
        return db
          .selectFrom("divinationTools")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "divination_tool",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "instruments":
        return db
          .selectFrom("instruments")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`COALESCE(ritual_role, lineage_notes, '')`.as(
              "snippet",
            ),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "instrument",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "proverb_entries":
        return db
          .selectFrom("proverbEntries")
          .select([
            "id",
            sql<string>`proverb`.as("title"),
            sql<string>`meaning`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "proverb_entry",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "artifacts":
        return db
          .selectFrom("artifacts")
          .select([
            "id",
            sql<string>`artifact_name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "artifact",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "traditions":
        return db
          .selectFrom("traditions")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "tradition",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "communities":
        return db
          .selectFrom("communities")
          .select([
            "id",
            sql<string>`community_name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "community",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "calendars":
        return db
          .selectFrom("calendars")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "calendar",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "herbal_systems":
        return db
          .selectFrom("herbalSystems")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`notes`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "herbal_system",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "somatic_movements":
        return db
          .selectFrom("somaticMovements")
          .select([
            "id",
            sql<string>`COALESCE(common_name, sacred_name, 'Unnamed Movement')`.as(
              "title",
            ),
            sql<string>`COALESCE(synopsis, instructions, '')`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "somatic_movement",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "food_recipes":
        return db
          .selectFrom("foodRecipes")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "food_recipe",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "foods":
        return db
          .selectFrom("foods")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "food",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      case "ingredients":
        return db
          .selectFrom("ingredients")
          .select([
            "id",
            sql<string>`name`.as("title"),
            sql<string>`description`.as("snippet"),
            sql<number>`(embedding <=> ${embeddingString})`.as("distance"),
          ])
          .where("embedding", "is not", null)
          .orderBy("distance", "asc")
          .limit(limit)
          .execute()
          .then((rows) =>
            rows.map((r) => ({
              type: "ingredient",
              id: r.id,
              title: r.title || "Untitled",
              snippet: r.snippet || "",
              distance: r.distance,
            })),
          );

      default:
        return [];
    }
  } catch (err) {
    console.error(`RAG search error for table ${table}:`, err);
    return [];
  }
}
