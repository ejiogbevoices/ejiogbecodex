import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// React hooks for hybrid search in Ejiogbe Voices
//
// These replace or augment your existing vector-only search
// with entity metadata filtering and full-text BM25
// ─────────────────────────────────────────────────────────────

// Initialize your Supabase client (adjust to match your setup)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Types ────────────────────────────────────────────────────

interface Entity {
  name: string;
  type: string;
  original_language?: string;
  english_gloss?: string;
  confidence: number;
}

interface SearchResult {
  id: string;
  source_table: string;
  content: string;
  entity_metadata: {
    entities: Entity[];
    relationships: { source: string; target: string; relationship: string }[];
    themes: string[];
    languages_detected: string[];
    tradition_context?: string;
  } | null;
  similarity: number;
  text_rank: number;
  combined_score: number;
}

interface EntitySearchResult {
  id: string;
  source_table: string;
  content: string;
  entity_metadata: SearchResult["entity_metadata"];
  matched_entity: Entity;
}

interface RelatedEntity {
  related_name: string;
  related_type: string | null;
  relationship: string;
  co_occurrence_count: number;
  source_tables: string[];
}

interface HybridSearchParams {
  queryText: string;
  queryEmbedding: number[]; // halfvec(3072) — must be 3072 dimensions
  matchCount?: number;
  filterEntityType?: string;
  filterEntityName?: string;
  filterTradition?: string;
  filterTheme?: string;
  vectorWeight?: number;
  textWeight?: number;
}

// ── Hook: Hybrid Search ──────────────────────────────────────

export function useHybridSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: HybridSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("hybrid_search", {
        query_embedding: JSON.stringify(params.queryEmbedding),
        query_text: params.queryText,
        match_count: params.matchCount ?? 10,
        filter_entity_type: params.filterEntityType ?? null,
        filter_entity_name: params.filterEntityName ?? null,
        filter_tradition: params.filterTradition ?? null,
        filter_theme: params.filterTheme ?? null,
        vector_weight: params.vectorWeight ?? 0.6,
        text_weight: params.textWeight ?? 0.4,
      });

      if (rpcError) throw new Error(rpcError.message);
      setResults(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

// ── Hook: Entity Lookup ──────────────────────────────────────
// "Show me all chunks mentioning Oshun"

export function useEntitySearch() {
  const [results, setResults] = useState<EntitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByEntity = useCallback(
    async (entityName: string, entityType?: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc("find_by_entity", {
          entity_name: entityName,
          entity_type: entityType ?? null,
          result_limit: 20,
        });

        if (rpcError) throw new Error(rpcError.message);
        setResults(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Entity search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { results, loading, error, searchByEntity };
}

// ── Hook: Related Entities ───────────────────────────────────
// "What entities are connected to Ogbè Méjì?"

export function useRelatedEntities() {
  const [related, setRelated] = useState<RelatedEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findRelated = useCallback(async (entityName: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "find_related_entities",
        {
          source_entity_name: entityName,
          result_limit: 20,
        }
      );

      if (rpcError) throw new Error(rpcError.message);
      setRelated(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Related entity search failed");
      setRelated([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { related, loading, error, findRelated };
}

// ── Hook: Browse by Theme ────────────────────────────────────
// "Show me all content about healing"

export function useThemeSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByTheme = useCallback(async (theme: string, tradition?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Use a direct query since we just need JSONB filtering
      let query = supabase
        .from("documents")
        .select("id, content, entity_metadata")
        .eq("extraction_status", "completed")
        .contains("entity_metadata", { themes: [theme] });

      if (tradition) {
        query = query.eq(
          "entity_metadata->>tradition_context",
          tradition
        );
      }

      const { data, error: queryError } = await query.limit(20);

      if (queryError) throw new Error(queryError.message);
      setResults(
        (data ?? []).map((d) => ({
          ...d,
          similarity: 0,
          text_rank: 0,
          combined_score: 0,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Theme search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, searchByTheme };
}

// ── Utility: Generate embedding ──────────────────────────────
// You likely already have this. Included for completeness.
// Replace with your actual embedding function.

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch("/api/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const { embedding } = await response.json();
  return embedding;
}
