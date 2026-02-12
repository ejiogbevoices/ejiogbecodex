import pg from "pg";
import { extractEntities } from "./extract";
import type { ExtractionResult } from "./schema";

// ─────────────────────────────────────────────────────────────
// Backfill script: enrich ALL 26 Ejiogbe Voices tables
// with entity metadata via Gemini structured extraction
//
// Connects via direct PostgreSQL connection string.
// No Supabase service role key needed.
//
// Usage:
//   npx tsx enrich.ts
//   npx tsx enrich.ts --table ceremonies
//   npx tsx enrich.ts --batch-size 50 --concurrency 5
//   npx tsx enrich.ts --dry-run
//
// Required env vars:
//   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
//   GEMINI_API_KEY=your_gemini_key
// ─────────────────────────────────────────────────────────────

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

// ── Table → Content Column Mapping ───────────────────────────

const TABLE_CONFIG: Record<string, { columns: string[] }> = {
  transcript_segments:    { columns: ["text_original"] },
  proverb_entries:        { columns: ["proverb", "meaning", "literal_translation"] },
  manuscripts:            { columns: ["title", "content"] },
  ceremonies:             { columns: ["name", "summary_long", "intent", "phases", "materials_overview"] },
  myth_entities:          { columns: ["name", "summary_long", "domains", "symbols"] },
  divination_systems:     { columns: ["name", "overview", "casting_method", "interpretation_model"] },
  divination_units:       { columns: ["name", "long_meaning", "content", "short_meaning"] },
  divination_tools:       { columns: ["name", "description", "iconography_notes", "taboo_notes"] },
  traditions:             { columns: ["name", "description"] },
  glossary_terms:         { columns: ["term", "definition", "etymology", "usage_notes"] },
  dictionary_words:       { columns: ["word", "definition", "semantics", "english_translation"] },
  plants:                 { columns: ["name_primary", "medicinal_uses", "folk_uses", "healing_properties", "preparation_methods"] },
  herbal_systems:         { columns: ["name", "notes"] },
  artifacts:              { columns: ["artifact_name", "description", "subject", "materials"] },
  symbols:                { columns: ["name", "description", "usage_notes", "lineage_notes"] },
  instruments:            { columns: ["name", "ritual_role", "lineage_notes", "construction_notes", "taboo_notes"] },
  somatic_movements:      { columns: ["common_name", "sacred_name", "synopsis", "instructions", "intent"] },
  somatic_movement_units: { columns: ["unit_name", "description", "symbolic_meaning", "deity_association"] },
  food_recipes:           { columns: ["name", "description", "instructions", "cautions"] },
  foods:                  { columns: ["name", "description", "notes"] },
  ingredients:            { columns: ["name", "description", "notes"] },
  recordings:             { columns: ["title", "description", "summary", "provenance_notes"] },
  communities:            { columns: ["community_name", "description", "lineage_notes", "protocol_definitions"] },
  calendars:              { columns: ["name", "description"] },
  tribes:                 { columns: ["name", "description", "notes", "historical_region"] },
  writing_systems:        { columns: ["name", "cultural_origin_story", "linguistic_history"] },
};

// ── CLI Config ───────────────────────────────────────────────

interface EnrichConfig {
  targetTable: string | null;
  batchSize: number;
  concurrency: number;
  delayMs: number;
  model: string;
  dryRun: boolean;
}

function parseArgs(): Partial<EnrichConfig> {
  const args: Partial<EnrichConfig> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--table":       args.targetTable = argv[++i]; break;
      case "--batch-size":  args.batchSize = parseInt(argv[++i]); break;
      case "--concurrency": args.concurrency = parseInt(argv[++i]); break;
      case "--delay":       args.delayMs = parseInt(argv[++i]); break;
      case "--model":       args.model = argv[++i]; break;
      case "--dry-run":     args.dryRun = true; break;
    }
  }
  return args;
}

const config: EnrichConfig = {
  targetTable: null,
  batchSize: 20,
  concurrency: 3,
  delayMs: 500,
  model: "gemini-2.5-flash",
  dryRun: false,
  ...parseArgs(),
};

// ── Helpers ──────────────────────────────────────────────────

function buildTextContent(row: Record<string, unknown>, columns: string[]): string {
  return columns
    .map((col) => {
      const val = row[col];
      return val ? `${col}: ${String(val)}` : null;
    })
    .filter(Boolean)
    .join("\n\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Process a single row ─────────────────────────────────────

async function processRow(
  table: string,
  rowId: string,
  textContent: string
): Promise<{ success: boolean; entityCount: number }> {
  try {
    // Mark as processing
    await pool.query(
      `UPDATE ${table} SET extraction_status = 'processing' WHERE id = $1`,
      [rowId]
    );

    // Extract entities via Gemini
    const result: ExtractionResult = await extractEntities(textContent, config.model);

    if (config.dryRun) {
      console.log(`  [DRY RUN] ${table}/${rowId}: ${result.entities.length} entities, ${result.relationships.length} relationships`);
      await pool.query(
        `UPDATE ${table} SET extraction_status = 'pending' WHERE id = $1`,
        [rowId]
      );
      return { success: true, entityCount: result.entities.length };
    }

    // Save entity_metadata
    await pool.query(
      `UPDATE ${table}
       SET entity_metadata = $1,
           extraction_status = 'completed',
           extracted_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(result), rowId]
    );

    return { success: true, entityCount: result.entities.length };
  } catch (err) {
    console.error(`  ✗ ${table}/${rowId}: ${(err as Error).message}`);
    await pool.query(
      `UPDATE ${table} SET extraction_status = 'failed' WHERE id = $1`,
      [rowId]
    ).catch(() => {});
    return { success: false, entityCount: 0 };
  }
}

// ── Process a batch with concurrency ─────────────────────────

async function processBatch(
  table: string,
  rows: Array<{ id: string; text: string }>,
  concurrency: number
): Promise<{ successes: number; failures: number; totalEntities: number }> {
  let successes = 0;
  let failures = 0;
  let totalEntities = 0;

  for (let i = 0; i < rows.length; i += concurrency) {
    const chunk = rows.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map((row) => processRow(table, row.id, row.text))
    );
    for (const r of results) {
      if (r.success) {
        successes++;
        totalEntities += r.entityCount;
      } else {
        failures++;
      }
    }
    if (i + concurrency < rows.length) {
      await sleep(200);
    }
  }

  return { successes, failures, totalEntities };
}

// ── Process one table ────────────────────────────────────────

async function processTable(table: string): Promise<void> {
  const tableConfig = TABLE_CONFIG[table];
  if (!tableConfig) {
    console.error(`Unknown table: ${table}`);
    return;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) as count FROM ${table} WHERE extraction_status = 'pending' OR extraction_status = 'failed'`
  );
  const totalPending = parseInt(countResult.rows[0].count);

  if (totalPending === 0) {
    console.log(`  ${table}: no pending rows, skipping`);
    return;
  }

  console.log(`  ${table}: ${totalPending} rows to process`);

  const startTime = Date.now();
  let processed = 0;
  let totalSuccesses = 0;
  let totalFailures = 0;
  let totalEntities = 0;

  const selectCols = ["id", ...tableConfig.columns].join(", ");

  while (true) {
    const batchResult = await pool.query(
      `SELECT ${selectCols} FROM ${table}
       WHERE extraction_status = 'pending' OR extraction_status = 'failed'
       ORDER BY created_at ASC
       LIMIT $1`,
      [config.batchSize]
    );

    if (batchResult.rows.length === 0) break;

    const rows = batchResult.rows.map((row) => ({
      id: row.id as string,
      text: buildTextContent(row, tableConfig.columns),
    }));

    // Skip rows with no text content
    const nonEmptyRows = rows.filter((r) => r.text.trim().length > 0);
    if (nonEmptyRows.length === 0) {
      const emptyIds = rows.map((r) => r.id);
      await pool.query(
        `UPDATE ${table}
         SET extraction_status = 'completed',
             entity_metadata = '{"entities":[],"relationships":[],"themes":[],"languages_detected":[],"tradition_context":""}'::jsonb,
             extracted_at = NOW()
         WHERE id = ANY($1)`,
        [emptyIds]
      );
      processed += rows.length;
      continue;
    }

    const result = await processBatch(table, nonEmptyRows, config.concurrency);
    totalSuccesses += result.successes;
    totalFailures += result.failures;
    totalEntities += result.totalEntities;
    processed += batchResult.rows.length;

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    console.log(
      `  ${table}: ${processed}/${totalPending} (${rate.toFixed(1)} rows/sec) | ` +
      `${totalEntities} entities extracted | ${totalFailures} failures`
    );

    await sleep(config.delayMs);
  }

  const elapsed = (Date.now() - startTime) / 1000;
  console.log(
    `  ${table} DONE: ${totalSuccesses} succeeded, ${totalFailures} failed, ` +
    `${totalEntities} entities in ${elapsed.toFixed(1)}s\n`
  );
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════");
  console.log("Ejiogbe Voices: Entity Metadata Enrichment");
  console.log(`Model: ${config.model}`);
  console.log(`Batch size: ${config.batchSize} | Concurrency: ${config.concurrency}`);
  if (config.dryRun) console.log("*** DRY RUN MODE ***");
  console.log("═══════════════════════════════════════════════\n");

  try {
    const res = await pool.query("SELECT NOW()");
    console.log(`Connected to database at ${res.rows[0].now}\n`);
  } catch (err) {
    console.error("Failed to connect to database:", (err as Error).message);
    console.error("Check your DATABASE_URL env var.");
    process.exit(1);
  }

  const tables = config.targetTable
    ? [config.targetTable]
    : Object.keys(TABLE_CONFIG);

  const globalStart = Date.now();

  for (const table of tables) {
    console.log(`\n── Processing: ${table} ──`);
    await processTable(table);
  }

  const totalElapsed = (Date.now() - globalStart) / 1000;
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`All tables complete in ${totalElapsed.toFixed(1)}s`);
  console.log(`═══════════════════════════════════════════════`);

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
