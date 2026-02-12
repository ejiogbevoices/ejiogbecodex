# Ejiogbe Voices: Phase 1 Entity Enrichment Setup

## What This Does

Runs Gemini entity extraction across all 26 Ejiogbe Voices database tables, storing structured entity metadata (deities, rituals, divination signs, plants, proverbs, etc.) as JSONB alongside existing records. This enables hybrid search combining vector similarity, full-text keyword search, and entity-level filtering.

## Prerequisites

The database migration has already been run (entity_metadata, extraction_status, extracted_at columns exist on all 26 tables, FTS columns created, hybrid_search/find_by_entity/find_related_entities functions deployed, RLS policies active).

## Step 1: Install Dependencies

In the project root, run:

```bash
npm install pg @google/genai zod zod-to-json-schema
npm install -D @types/pg tsx
```

Note: we use the `pg` package for direct PostgreSQL connection. We do NOT use @supabase/supabase-js or any service role key for this script.

## Step 2: Place the Files

Copy these files from the phase1 delivery into the project:

- `schema.ts` → `src/lib/graph-rag/schema.ts`
- `extract.ts` → `src/lib/graph-rag/extract.ts`
- `enrich.ts` → `src/lib/graph-rag/enrich.ts`
- `hooks.ts` → `src/lib/graph-rag/hooks.ts`
- `route.ts` → `src/app/api/extract-entities/route.ts`

Adjust the paths to match the project structure. The important thing is that `enrich.ts` can import from `./extract` and `./schema` as sibling files.

## Step 3: Set Environment Variables

Add these to `.env.local` (or export them in the terminal):

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.qacnaurmomvvtkvlpfso.supabase.co:5432/postgres
GEMINI_API_KEY=your_gemini_api_key
```

The DATABASE_URL is the direct connection string from Supabase Dashboard → Settings → Database → Connection String → URI. Replace `[YOUR-PASSWORD]` with the actual database password.

Do NOT use the Supabase service role key. This script connects directly to PostgreSQL.

## Step 4: Test with Dry Run

Run a dry run on a single table to verify everything connects and Gemini responds:

```bash
npx tsx src/lib/graph-rag/enrich.ts --table ceremonies --dry-run
```

Expected output: it should connect to the database, fetch pending rows from ceremonies, send text to Gemini, print extracted entity counts, and reset rows back to pending. No data is written in dry run mode.

If you see a connection error about IPv4, use the Supabase connection pooler URL instead (found under Settings → Database → Connection Pooling).

## Step 5: Run on One Table First

Pick a small table to verify real writes:

```bash
npx tsx src/lib/graph-rag/enrich.ts --table calendars
```

After it finishes, verify in Supabase:
```sql
SELECT id, extraction_status, entity_metadata FROM calendars WHERE extraction_status = 'completed' LIMIT 3;
```

You should see JSONB with entities, relationships, themes, languages_detected, and tradition_context.

## Step 6: Run All 26 Tables

```bash
npx tsx src/lib/graph-rag/enrich.ts
```

This processes all 26 tables sequentially. Default settings: batch size 20, concurrency 3 (3 Gemini calls at once), 500ms delay between batches.

To go faster (if your Gemini quota allows):
```bash
npx tsx src/lib/graph-rag/enrich.ts --batch-size 50 --concurrency 5 --delay 200
```

To go slower (if hitting rate limits):
```bash
npx tsx src/lib/graph-rag/enrich.ts --batch-size 10 --concurrency 2 --delay 1000
```

## Step 7: Check Progress

At any point, check how many rows are done across all tables:

```sql
SELECT 'transcript_segments' as tbl, extraction_status, count(*) FROM transcript_segments GROUP BY extraction_status
UNION ALL SELECT 'proverb_entries', extraction_status, count(*) FROM proverb_entries GROUP BY extraction_status
UNION ALL SELECT 'manuscripts', extraction_status, count(*) FROM manuscripts GROUP BY extraction_status
UNION ALL SELECT 'ceremonies', extraction_status, count(*) FROM ceremonies GROUP BY extraction_status
UNION ALL SELECT 'myth_entities', extraction_status, count(*) FROM myth_entities GROUP BY extraction_status
UNION ALL SELECT 'divination_systems', extraction_status, count(*) FROM divination_systems GROUP BY extraction_status
UNION ALL SELECT 'divination_units', extraction_status, count(*) FROM divination_units GROUP BY extraction_status
UNION ALL SELECT 'divination_tools', extraction_status, count(*) FROM divination_tools GROUP BY extraction_status
UNION ALL SELECT 'traditions', extraction_status, count(*) FROM traditions GROUP BY extraction_status
UNION ALL SELECT 'glossary_terms', extraction_status, count(*) FROM glossary_terms GROUP BY extraction_status
UNION ALL SELECT 'dictionary_words', extraction_status, count(*) FROM dictionary_words GROUP BY extraction_status
UNION ALL SELECT 'plants', extraction_status, count(*) FROM plants GROUP BY extraction_status
UNION ALL SELECT 'herbal_systems', extraction_status, count(*) FROM herbal_systems GROUP BY extraction_status
UNION ALL SELECT 'artifacts', extraction_status, count(*) FROM artifacts GROUP BY extraction_status
UNION ALL SELECT 'symbols', extraction_status, count(*) FROM symbols GROUP BY extraction_status
UNION ALL SELECT 'instruments', extraction_status, count(*) FROM instruments GROUP BY extraction_status
UNION ALL SELECT 'somatic_movements', extraction_status, count(*) FROM somatic_movements GROUP BY extraction_status
UNION ALL SELECT 'somatic_movement_units', extraction_status, count(*) FROM somatic_movement_units GROUP BY extraction_status
UNION ALL SELECT 'food_recipes', extraction_status, count(*) FROM food_recipes GROUP BY extraction_status
UNION ALL SELECT 'foods', extraction_status, count(*) FROM foods GROUP BY extraction_status
UNION ALL SELECT 'ingredients', extraction_status, count(*) FROM ingredients GROUP BY extraction_status
UNION ALL SELECT 'recordings', extraction_status, count(*) FROM recordings GROUP BY extraction_status
UNION ALL SELECT 'communities', extraction_status, count(*) FROM communities GROUP BY extraction_status
UNION ALL SELECT 'calendars', extraction_status, count(*) FROM calendars GROUP BY extraction_status
UNION ALL SELECT 'tribes', extraction_status, count(*) FROM tribes GROUP BY extraction_status
UNION ALL SELECT 'writing_systems', extraction_status, count(*) FROM writing_systems GROUP BY extraction_status
ORDER BY tbl, extraction_status;
```

## Step 8: Retry Failures

If any rows failed (network timeout, Gemini error, etc.), just run the script again. It picks up rows with status 'pending' or 'failed' automatically:

```bash
npx tsx src/lib/graph-rag/enrich.ts
```

## CLI Flags Reference

| Flag | Default | Description |
|------|---------|-------------|
| `--table TABLE_NAME` | all 26 tables | Process only one table |
| `--batch-size N` | 20 | Rows fetched per batch |
| `--concurrency N` | 3 | Parallel Gemini calls per batch |
| `--delay N` | 500 | Milliseconds between batches |
| `--model NAME` | gemini-2.5-flash | Gemini model to use |
| `--dry-run` | false | Preview without writing to database |

## Table → Content Column Mapping

The script sends these columns to Gemini for entity extraction per table:

| Table | Columns sent to Gemini |
|-------|----------------------|
| transcript_segments | text_original |
| proverb_entries | proverb, meaning, literal_translation |
| manuscripts | title, content |
| ceremonies | name, summary_long, intent, phases, materials_overview |
| myth_entities | name, summary_long, domains, symbols |
| divination_systems | name, overview, casting_method, interpretation_model |
| divination_units | name, long_meaning, content, short_meaning |
| divination_tools | name, description, iconography_notes, taboo_notes |
| traditions | name, description |
| glossary_terms | term, definition, etymology, usage_notes |
| dictionary_words | word, definition, semantics, english_translation |
| plants | name_primary, medicinal_uses, folk_uses, healing_properties, preparation_methods |
| herbal_systems | name, notes |
| artifacts | artifact_name, description, subject, materials |
| symbols | name, description, usage_notes, lineage_notes |
| instruments | name, ritual_role, lineage_notes, construction_notes, taboo_notes |
| somatic_movements | common_name, sacred_name, synopsis, instructions, intent |
| somatic_movement_units | unit_name, description, symbolic_meaning, deity_association |
| food_recipes | name, description, instructions, cautions |
| foods | name, description, notes |
| ingredients | name, description, notes |
| recordings | title, description, summary, provenance_notes |
| communities | community_name, description, lineage_notes, protocol_definitions |
| calendars | name, description |
| tribes | name, description, notes, historical_region |
| writing_systems | name, cultural_origin_story, linguistic_history |
