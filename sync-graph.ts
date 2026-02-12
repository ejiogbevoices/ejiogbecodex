import pg from "pg";
import neo4j, { Driver, Session } from "neo4j-driver";

// ─────────────────────────────────────────────────────────────
// Supabase → Neo4j Sync Script
// Ejiogbe Voices Phase 2: Graph Population
//
// Reads directly from PostgreSQL, writes to Neo4j Aura.
// Auto-discovers content tables, junction tables, and FK
// relationships from information_schema.
//
// Usage:
//   npx tsx sync-graph.ts
//   npx tsx sync-graph.ts --tables-only
//   npx tsx sync-graph.ts --relationships-only
//   npx tsx sync-graph.ts --table ceremonies
//   npx tsx sync-graph.ts --dry-run
//   npx tsx sync-graph.ts --batch-size 500
//
// Required env vars:
//   DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
//   NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
//   NEO4J_USERNAME=neo4j
//   NEO4J_PASSWORD=your_password
// ─────────────────────────────────────────────────────────────

const { Pool } = pg;

// ── Config ───────────────────────────────────────────────────

interface SyncConfig {
  batchSize: number;
  dryRun: boolean;
  tablesOnly: boolean;
  relationshipsOnly: boolean;
  targetTable: string | null;
  skipEmbeddings: boolean;
}

function parseArgs(): Partial<SyncConfig> {
  const args: Partial<SyncConfig> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--batch-size":      args.batchSize = parseInt(argv[++i]); break;
      case "--dry-run":         args.dryRun = true; break;
      case "--tables-only":     args.tablesOnly = true; break;
      case "--relationships-only": args.relationshipsOnly = true; break;
      case "--table":           args.targetTable = argv[++i]; break;
      case "--skip-embeddings": args.skipEmbeddings = true; break;
    }
  }
  return args;
}

const config: SyncConfig = {
  batchSize: 500,
  dryRun: false,
  tablesOnly: false,
  relationshipsOnly: false,
  targetTable: null,
  skipEmbeddings: true, // embeddings stay in pgvector by default
  ...parseArgs(),
};

// ── The 26 content tables that become :Entity nodes ──────────
// These are the tables with entity_metadata and embedding columns.
// Everything else is either a junction table, reference table, or app table.

const CONTENT_TABLES = new Set([
  "artifacts", "calendars", "ceremonies", "communities",
  "dictionary_words", "divination_systems", "divination_tools",
  "divination_units", "food_recipes", "foods", "glossary_terms",
  "herbal_systems", "ingredients", "instruments", "manuscripts",
  "myth_entities", "plants", "proverb_entries", "recordings",
  "somatic_movements", "somatic_movement_units", "symbols",
  "traditions", "transcript_segments", "tribes", "writing_systems",
]);

// ── Reference tables that become their own node labels ───────

const REFERENCE_TABLES = new Set([
  "languages", "countries", "elders", "lineages", "tags", "categories",
]);

// ── Table name → Neo4j label mapping ─────────────────────────

function tableToLabel(table: string): string {
  const map: Record<string, string> = {
    artifacts: "Artifact",
    calendars: "Calendar",
    ceremonies: "Ceremony",
    communities: "Community",
    dictionary_words: "DictionaryWord",
    divination_systems: "DivinationSystem",
    divination_tools: "DivinationTool",
    divination_units: "DivinationUnit",
    food_recipes: "FoodRecipe",
    foods: "Food",
    glossary_terms: "GlossaryTerm",
    herbal_systems: "HerbalSystem",
    ingredients: "Ingredient",
    instruments: "Instrument",
    manuscripts: "Manuscript",
    myth_entities: "MythEntity",
    plants: "Plant",
    proverb_entries: "ProverbEntry",
    recordings: "Recording",
    somatic_movements: "SomaticMovement",
    somatic_movement_units: "SomaticMovementUnit",
    symbols: "Symbol",
    traditions: "Tradition",
    transcript_segments: "TranscriptSegment",
    tribes: "Tribe",
    writing_systems: "WritingSystem",
    languages: "Language",
    countries: "Country",
    elders: "Elder",
    lineages: "Lineage",
    tags: "Tag",
    categories: "Category",
  };
  return map[table] || table.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join("");
}

// ── Primary display column per table ─────────────────────────
// Used as the "name" property on Neo4j nodes

const NAME_COLUMN: Record<string, string> = {
  artifacts: "artifact_name",
  communities: "community_name",
  dictionary_words: "word",
  glossary_terms: "term",
  proverb_entries: "proverb",
  transcript_segments: "text_original",
  plants: "name_primary",
  somatic_movements: "common_name",
  somatic_movement_units: "unit_name",
  // everything else uses "name" or "title"
};

function getNameColumn(table: string): string {
  if (NAME_COLUMN[table]) return NAME_COLUMN[table];
  // manuscripts and recordings use "title"
  if (table === "manuscripts" || table === "recordings") return "title";
  return "name";
}

// ── Junction table → relationship type mapping ───────────────

function junctionToRelType(junctionTable: string, sourceTable: string, targetTable: string): string {
  // Map target table to relationship verb
  const targetRelMap: Record<string, string> = {
    traditions: "PART_OF_TRADITION",
    communities: "ASSOCIATED_WITH_COMMUNITY",
    tribes: "ASSOCIATED_WITH_TRIBE",
    myth_entities: "INVOLVES_MYTH_ENTITY",
    plants: "USES_PLANT",
    herbal_systems: "DRAWS_FROM_HERBAL",
    divination_systems: "EMPLOYS_DIVINATION",
    divination_units: "REFERENCES_DIVINATION_UNIT",
    divination_tools: "USES_DIVINATION_TOOL",
    manuscripts: "DOCUMENTED_IN",
    recordings: "CAPTURED_IN",
    somatic_movements: "INCORPORATES_MOVEMENT",
    somatic_movement_units: "INVOLVES_MOVEMENT_UNIT",
    instruments: "PLAYED_WITH_INSTRUMENT",
    artifacts: "USES_ARTIFACT",
    ingredients: "USES_INGREDIENT",
    symbols: "DISPLAYS_SYMBOL",
    calendars: "FOLLOWS_CALENDAR",
    foods: "FEATURES_FOOD",
    food_recipes: "INCLUDES_RECIPE",
    countries: "LOCATED_IN",
    languages: "EXPRESSED_IN_LANGUAGE",
    writing_systems: "USES_WRITING_SYSTEM",
  };

  return targetRelMap[targetTable] || `RELATED_TO_${targetTable.toUpperCase()}`;
}

// ── Direct FK → relationship type mapping ────────────────────

function fkToRelType(fkColumn: string, targetTable: string): string {
  const fkMap: Record<string, string> = {
    tradition_id: "PART_OF_TRADITION",
    community_id: "ASSOCIATED_WITH_COMMUNITY",
    tribe_id: "ASSOCIATED_WITH_TRIBE",
    language_id: "EXPRESSED_IN_LANGUAGE",
    country_id: "LOCATED_IN",
    elder_id: "ATTRIBUTED_TO",
    lineage_id: "BELONGS_TO_LINEAGE",
    category_id: "CATEGORIZED_AS",
    tag_id: "TAGGED_WITH",
    tag_id1: "TAGGED_WITH",
    tag_id2: "TAGGED_WITH",
    tag2_id: "TAGGED_WITH",
    tag3_id: "TAGGED_WITH",
    herbal_system_id: "DRAWS_FROM_HERBAL",
    recording_id: "SEGMENT_OF",
    divination_system_id: "BELONGS_TO_SYSTEM",
    parent_unit_id: "HAS_PARENT_UNIT",
    dictionary_id: "BELONGS_TO_DICTIONARY",
    proverb_id: "BELONGS_TO_PROVERB",
    movement_id: "PART_OF_MOVEMENT",
    primary_language_id: "PRIMARY_LANGUAGE",
    secondary_language_id: "SECONDARY_LANGUAGE",
    tertiary_language_id: "TERTIARY_LANGUAGE",
    origin_country_id: "ORIGINATES_IN",
    current_country_id: "LOCATED_IN",
  };

  return fkMap[fkColumn] || `LINKED_TO_${targetTable.toUpperCase()}`;
}

// ── Helpers ──────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Schema Discovery ─────────────────────────────────────────

interface JunctionInfo {
  junctionTable: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  metadataColumns: string[];
}

interface FKInfo {
  sourceTable: string;
  fkColumn: string;
  targetTable: string;
}

async function discoverJunctions(pool: pg.Pool): Promise<JunctionInfo[]> {
  // A junction table has exactly 2 FK columns pointing to content/reference tables
  const result = await pool.query(`
    SELECT
      tc.table_name AS junction_table,
      kcu.column_name AS fk_column,
      ccu.table_name AS target_table
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `);

  // Group FKs by table
  const fksByTable = new Map<string, Array<{ column: string; target: string }>>();
  for (const row of result.rows) {
    const existing = fksByTable.get(row.junction_table) || [];
    existing.push({ column: row.fk_column, target: row.target_table });
    fksByTable.set(row.junction_table, existing);
  }

  const junctions: JunctionInfo[] = [];
  const allTables = new Set([...CONTENT_TABLES, ...REFERENCE_TABLES]);

  for (const [table, fks] of fksByTable) {
    // Skip if it's a content table or reference table (those have direct FKs, not junction)
    if (allTables.has(table)) continue;

    // Junction table: has exactly 2 FKs that both point to content/reference tables
    const contentFks = fks.filter(fk => allTables.has(fk.target));
    if (contentFks.length === 2) {
      // Get any additional metadata columns (notes, authority_notes, etc.)
      const colResult = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
          AND column_name NOT IN ('id', 'created_at', 'updated_at', $2, $3)
      `, [table, contentFks[0].column, contentFks[1].column]);

      const metaCols = colResult.rows
        .map(r => r.column_name)
        .filter(c => !c.endsWith("_id")); // skip any other FK columns

      junctions.push({
        junctionTable: table,
        sourceTable: contentFks[0].target,
        sourceColumn: contentFks[0].column,
        targetTable: contentFks[1].target,
        targetColumn: contentFks[1].column,
        metadataColumns: metaCols,
      });
    }
  }

  return junctions;
}

async function discoverDirectFKs(pool: pg.Pool): Promise<FKInfo[]> {
  const allTables = new Set([...CONTENT_TABLES, ...REFERENCE_TABLES]);

  const result = await pool.query(`
    SELECT
      tc.table_name AS source_table,
      kcu.column_name AS fk_column,
      ccu.table_name AS target_table
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `);

  return result.rows
    .filter(row =>
      allTables.has(row.source_table) &&
      allTables.has(row.target_table) &&
      row.source_table !== row.target_table // skip self-refs for now
    )
    .map(row => ({
      sourceTable: row.source_table,
      fkColumn: row.fk_column,
      targetTable: row.target_table,
    }));
}

// ── Neo4j Operations ─────────────────────────────────────────

async function createConstraints(neo4jDriver: Driver): Promise<void> {
  const session = neo4jDriver.session();
  try {
    const allTables = [...CONTENT_TABLES, ...REFERENCE_TABLES];
    for (const table of allTables) {
      const label = tableToLabel(table);
      const constraint = `CREATE CONSTRAINT ${label.toLowerCase()}_pk IF NOT EXISTS FOR (n:${label}) REQUIRE n.id IS UNIQUE`;
      console.log(`  Constraint: ${label}`);
      if (!config.dryRun) {
        await session.run(constraint);
      }
    }
    console.log(`  Created ${allTables.length} uniqueness constraints\n`);
  } finally {
    await session.close();
  }
}

async function syncNodes(
  pool: pg.Pool,
  neo4jDriver: Driver,
  table: string,
  isContent: boolean
): Promise<number> {
  const label = tableToLabel(table);
  const nameCol = getNameColumn(table);
  const entityLabel = isContent ? "Entity:" : "";

  // Get all columns for this table
  const colResult = await pool.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `, [table]);

  // Select columns: skip binary/large types, embedding
  const skipCols = new Set(["embedding", "fts"]);
  const columns = colResult.rows
    .filter(r => !skipCols.has(r.column_name))
    .map(r => r.column_name);

  // Count rows
  const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
  const total = parseInt(countResult.rows[0].count);
  if (total === 0) {
    console.log(`  ${table}: empty, skipping`);
    return 0;
  }

  console.log(`  ${table} → :${entityLabel}${label} (${total} rows)`);

  let synced = 0;
  let offset = 0;

  while (offset < total) {
    const batch = await pool.query(
      `SELECT ${columns.join(", ")} FROM ${table} ORDER BY id LIMIT $1 OFFSET $2`,
      [config.batchSize, offset]
    );

    if (batch.rows.length === 0) break;

    // Build node properties from row data
    const nodes = batch.rows.map(row => {
      const props: Record<string, unknown> = { id: row.id };

      // Set name from the appropriate column
      if (row[nameCol]) props.name = String(row[nameCol]);
      else if (row.title) props.name = String(row.title);
      else if (row.name) props.name = String(row.name);

      // Add other string/number/boolean properties
      for (const col of columns) {
        if (col === "id" || col === nameCol) continue;
        if (row[col] === null || row[col] === undefined) continue;

        const val = row[col];
        if (typeof val === "string" && val.length > 10000) {
          // Truncate very long text to keep Neo4j performant
          props[toCamelCase(col)] = val.substring(0, 10000);
        } else if (typeof val === "object" && !(val instanceof Date)) {
          // Store JSONB as string
          props[toCamelCase(col)] = JSON.stringify(val);
        } else if (val instanceof Date) {
          props[toCamelCase(col)] = val.toISOString();
        } else {
          props[toCamelCase(col)] = val;
        }
      }

      return props;
    });

    if (!config.dryRun) {
      const session = neo4jDriver.session();
      try {
        await session.run(
          `UNWIND $nodes AS props
           MERGE (n:${entityLabel}${label} {id: props.id})
           SET n += props`,
          { nodes }
        );
      } finally {
        await session.close();
      }
    }

    synced += batch.rows.length;
    offset += config.batchSize;

    if (offset % 2000 === 0 || offset >= total) {
      console.log(`    ${synced}/${total}`);
    }
  }

  return synced;
}

async function syncJunction(
  pool: pg.Pool,
  neo4jDriver: Driver,
  junction: JunctionInfo
): Promise<number> {
  const relType = junctionToRelType(junction.junctionTable, junction.sourceTable, junction.targetTable);
  const sourceLabel = tableToLabel(junction.sourceTable);
  const targetLabel = tableToLabel(junction.targetTable);

  // Count rows
  const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${junction.junctionTable}`);
  const total = parseInt(countResult.rows[0].count);
  if (total === 0) return 0;

  console.log(`  ${junction.junctionTable}: (${sourceLabel})-[:${relType}]->(${targetLabel}) [${total} edges]`);

  // Build SELECT
  const selectCols = [junction.sourceColumn, junction.targetColumn, ...junction.metadataColumns];

  let synced = 0;
  let offset = 0;

  while (offset < total) {
    const batch = await pool.query(
      `SELECT ${selectCols.join(", ")} FROM ${junction.junctionTable}
       ORDER BY ${junction.sourceColumn} LIMIT $1 OFFSET $2`,
      [config.batchSize, offset]
    );

    if (batch.rows.length === 0) break;

    const edges = batch.rows.map(row => {
      const edge: Record<string, unknown> = {
        sourceId: row[junction.sourceColumn],
        targetId: row[junction.targetColumn],
      };
      for (const col of junction.metadataColumns) {
        if (row[col] !== null && row[col] !== undefined) {
          edge[toCamelCase(col)] = row[col];
        }
      }
      return edge;
    });

    if (!config.dryRun) {
      const session = neo4jDriver.session();
      try {
        await session.run(
          `UNWIND $edges AS edge
           MATCH (a:${sourceLabel} {id: edge.sourceId})
           MATCH (b:${targetLabel} {id: edge.targetId})
           MERGE (a)-[r:${relType}]->(b)
           SET r.source = 'schema', r.confidence = 1.0
           ${junction.metadataColumns.map(c => `, r.${toCamelCase(c)} = edge.${toCamelCase(c)}`).join("")}`,
          { edges }
        );
      } finally {
        await session.close();
      }
    }

    synced += batch.rows.length;
    offset += config.batchSize;
  }

  return synced;
}

async function syncDirectFKs(
  pool: pg.Pool,
  neo4jDriver: Driver,
  fks: FKInfo[]
): Promise<number> {
  let totalEdges = 0;

  // Group FKs by source table to batch queries
  const fksBySource = new Map<string, FKInfo[]>();
  for (const fk of fks) {
    const existing = fksBySource.get(fk.sourceTable) || [];
    existing.push(fk);
    fksBySource.set(fk.sourceTable, existing);
  }

  for (const [sourceTable, tableFks] of fksBySource) {
    const sourceLabel = tableToLabel(sourceTable);
    const fkColumns = tableFks.map(fk => fk.fkColumn);

    // Fetch all rows that have at least one non-null FK
    const whereClauses = fkColumns.map(c => `${c} IS NOT NULL`).join(" OR ");
    const result = await pool.query(
      `SELECT id, ${fkColumns.join(", ")} FROM ${sourceTable} WHERE ${whereClauses}`
    );

    if (result.rows.length === 0) continue;

    for (const fk of tableFks) {
      const targetLabel = tableToLabel(fk.targetTable);
      const relType = fkToRelType(fk.fkColumn, fk.targetTable);

      const edges = result.rows
        .filter(row => row[fk.fkColumn] !== null)
        .map(row => ({
          sourceId: row.id,
          targetId: row[fk.fkColumn],
        }));

      if (edges.length === 0) continue;

      console.log(`  ${sourceTable}.${fk.fkColumn} → (${sourceLabel})-[:${relType}]->(${targetLabel}) [${edges.length} edges]`);

      if (!config.dryRun) {
        // Batch in chunks
        for (let i = 0; i < edges.length; i += config.batchSize) {
          const chunk = edges.slice(i, i + config.batchSize);
          const session = neo4jDriver.session();
          try {
            await session.run(
              `UNWIND $edges AS edge
               MATCH (a:${sourceLabel} {id: edge.sourceId})
               MATCH (b:${targetLabel} {id: edge.targetId})
               MERGE (a)-[r:${relType}]->(b)
               SET r.source = 'schema', r.confidence = 1.0`,
              { edges: chunk }
            );
          } finally {
            await session.close();
          }
        }
      }

      totalEdges += edges.length;
    }
  }

  return totalEdges;
}

// ── Self-referential FKs (divination_units.parent_unit_id) ───

async function syncSelfRefs(pool: pg.Pool, neo4jDriver: Driver): Promise<number> {
  // divination_units → parent_unit_id
  const result = await pool.query(
    `SELECT id, parent_unit_id FROM divination_units WHERE parent_unit_id IS NOT NULL`
  );

  if (result.rows.length === 0) return 0;

  console.log(`  divination_units self-ref: HAS_PARENT_UNIT [${result.rows.length} edges]`);

  if (!config.dryRun) {
    const session = neo4jDriver.session();
    try {
      await session.run(
        `UNWIND $edges AS edge
         MATCH (a:DivinationUnit {id: edge.id})
         MATCH (b:DivinationUnit {id: edge.parentId})
         MERGE (a)-[r:HAS_PARENT_UNIT]->(b)
         SET r.source = 'schema', r.confidence = 1.0`,
        { edges: result.rows.map(r => ({ id: r.id, parentId: r.parent_unit_id })) }
      );
    } finally {
      await session.close();
    }
  }

  // languages → parent_language_id
  const langResult = await pool.query(
    `SELECT id, parent_language_id FROM languages WHERE parent_language_id IS NOT NULL`
  );

  if (langResult.rows.length > 0) {
    console.log(`  languages self-ref: DIALECT_OF [${langResult.rows.length} edges]`);

    if (!config.dryRun) {
      const session = neo4jDriver.session();
      try {
        await session.run(
          `UNWIND $edges AS edge
           MATCH (a:Language {id: edge.id})
           MATCH (b:Language {id: edge.parentId})
           MERGE (a)-[r:DIALECT_OF]->(b)
           SET r.source = 'schema', r.confidence = 1.0`,
          { edges: langResult.rows.map(r => ({ id: r.id, parentId: r.parent_language_id })) }
        );
      } finally {
        await session.close();
      }
    }
  }

  return result.rows.length + langResult.rows.length;
}

// ── Utility ──────────────────────────────────────────────────

function toCamelCase(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════");
  console.log("Ejiogbe Voices: Supabase → Neo4j Graph Sync");
  console.log(`Batch size: ${config.batchSize}`);
  if (config.dryRun) console.log("*** DRY RUN MODE ***");
  if (config.tablesOnly) console.log("*** NODES ONLY ***");
  if (config.relationshipsOnly) console.log("*** RELATIONSHIPS ONLY ***");
  console.log("═══════════════════════════════════════════════\n");

  // Connect PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const pgTest = await pool.query("SELECT NOW()");
    console.log(`PostgreSQL connected: ${pgTest.rows[0].now}`);
  } catch (err) {
    console.error("PostgreSQL connection failed:", (err as Error).message);
    process.exit(1);
  }

  // Connect Neo4j
  const neo4jDriver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(
      process.env.NEO4J_USERNAME || "neo4j",
      process.env.NEO4J_PASSWORD!
    )
  );

  try {
    const serverInfo = await neo4jDriver.getServerInfo();
    console.log(`Neo4j connected: ${serverInfo.address}\n`);
  } catch (err) {
    console.error("Neo4j connection failed:", (err as Error).message);
    process.exit(1);
  }

  const globalStart = Date.now();

  // ── Phase 1: Constraints ────────────────────────────────────
  console.log("── Phase 1: Creating constraints ──");
  await createConstraints(neo4jDriver);

  // ── Phase 2: Sync Nodes ─────────────────────────────────────
  if (!config.relationshipsOnly) {
    console.log("── Phase 2: Syncing nodes ──");
    let totalNodes = 0;

    // Content tables (get :Entity dual label)
    const contentTables = config.targetTable
      ? [config.targetTable].filter(t => CONTENT_TABLES.has(t))
      : [...CONTENT_TABLES];

    for (const table of contentTables) {
      const count = await syncNodes(pool, neo4jDriver, table, true);
      totalNodes += count;
    }

    // Reference tables (single label)
    if (!config.targetTable) {
      for (const table of REFERENCE_TABLES) {
        const count = await syncNodes(pool, neo4jDriver, table, false);
        totalNodes += count;
      }
    }

    console.log(`\n  Total nodes synced: ${totalNodes}\n`);
  }

  // ── Phase 3: Sync Relationships ─────────────────────────────
  if (!config.tablesOnly) {
    let totalEdges = 0;

    // Discover junction tables
    console.log("── Phase 3a: Discovering junction tables ──");
    const junctions = await discoverJunctions(pool);
    console.log(`  Found ${junctions.length} junction tables\n`);

    console.log("── Phase 3b: Syncing junction relationships ──");
    for (const junction of junctions) {
      const count = await syncJunction(pool, neo4jDriver, junction);
      totalEdges += count;
    }
    console.log(`\n  Junction edges synced: ${totalEdges}\n`);

    // Discover and sync direct FK relationships
    console.log("── Phase 3c: Syncing direct FK relationships ──");
    const directFKs = await discoverDirectFKs(pool);
    console.log(`  Found ${directFKs.length} direct FK relationships\n`);
    const fkEdges = await syncDirectFKs(pool, neo4jDriver, directFKs);
    console.log(`\n  FK edges synced: ${fkEdges}\n`);

    // Self-referential FKs
    console.log("── Phase 3d: Syncing self-referential relationships ──");
    const selfRefEdges = await syncSelfRefs(pool, neo4jDriver);
    console.log(`\n  Self-ref edges synced: ${selfRefEdges}\n`);

    totalEdges += fkEdges + selfRefEdges;
    console.log(`  Total edges synced: ${totalEdges}\n`);
  }

  // ── Summary ─────────────────────────────────────────────────
  const elapsed = (Date.now() - globalStart) / 1000;
  console.log("═══════════════════════════════════════════════");
  console.log(`Sync complete in ${elapsed.toFixed(1)}s`);
  console.log("═══════════════════════════════════════════════");

  await neo4jDriver.close();
  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
