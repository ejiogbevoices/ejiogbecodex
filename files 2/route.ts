import { NextResponse } from "next/server";
import pg from "pg";
import { extractEntities } from "@/lib/graph-rag/extract";

// ─────────────────────────────────────────────────────────────
// POST /api/extract-entities
// Real-time entity extraction for new content
//
// Uses direct PostgreSQL connection via DATABASE_URL.
// No Supabase service role key needed.
// ─────────────────────────────────────────────────────────────

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

export async function POST(request: Request) {
  try {
    const { table, documentId, content } = await request.json();

    if (!table || !documentId || !content) {
      return NextResponse.json(
        { error: "table, documentId, and content are required" },
        { status: 400 }
      );
    }

    // Mark as processing
    await pool.query(
      `UPDATE ${table} SET extraction_status = 'processing' WHERE id = $1`,
      [documentId]
    );

    // Extract entities
    const result = await extractEntities(content);

    // Save results
    await pool.query(
      `UPDATE ${table}
       SET entity_metadata = $1,
           extraction_status = 'completed',
           extracted_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(result), documentId]
    );

    return NextResponse.json({
      success: true,
      entityCount: result.entities.length,
      relationshipCount: result.relationships.length,
      themes: result.themes,
      tradition: result.tradition_context,
    });
  } catch (err) {
    console.error("Entity extraction failed:", err);

    return NextResponse.json(
      { error: "Entity extraction failed", details: (err as Error).message },
      { status: 500 }
    );
  }
}
