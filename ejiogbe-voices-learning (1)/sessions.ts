/**
 * Fenix Sessions — CRUD for conversation persistence
 *
 * Routes (wire these up in your router):
 *   GET    /_api/voice-assistant/sessions           → handleListSessions
 *   GET    /_api/voice-assistant/sessions/:id        → handleGetSession
 *   POST   /_api/voice-assistant/sessions            → handleCreateSession
 *   PATCH  /_api/voice-assistant/sessions/:id        → handleUpdateSession
 *   DELETE /_api/voice-assistant/sessions/:id        → handleDeleteSession
 */

import { z } from "zod";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

// ── Schemas ──

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string().optional(),
});

const createSchema = z.object({
  title: z.string().max(200).optional(),
  messages: z.array(messageSchema).optional(),
});

const updateSchema = z.object({
  conversation: z.array(messageSchema).optional(),
  title: z.string().max(200).optional(),
  intent: z.string().max(50).optional(),
});

// ── List sessions (sidebar) ──

export async function handleListSessions(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const url = new URL(request.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "30"),
      50,
    );
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const sessions = await db
      .selectFrom("fenixSessions")
      .select(["id", "title", "intent", "createdAt", "updatedAt"])
      .where("userId", "=", user.id)
      .orderBy("updatedAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    return Response.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title || "New conversation",
        intent: s.intent,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("List sessions error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Get session (load full conversation) ──

export async function handleGetSession(
  request: Request,
  sessionId: string,
) {
  try {
    const { user } = await getServerUserSession(request);

    const session = await db
      .selectFrom("fenixSessions")
      .selectAll()
      .where("id", "=", sessionId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    return Response.json({ session });
  } catch (error: any) {
    console.error("Get session error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Create session ──

export async function handleCreateSession(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = await request.json();
    const { title, messages } = createSchema.parse(body);

    const session = await db
      .insertInto("fenixSessions")
      .values({
        userId: user.id,
        title: title || null,
        conversation: JSON.stringify(messages || []),
        intent: "general",
        isActive: true,
      })
      .returning(["id", "title", "createdAt", "updatedAt"])
      .executeTakeFirstOrThrow();

    return Response.json({ session }, { status: 201 });
  } catch (error: any) {
    console.error("Create session error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Update session (save messages, update title/intent) ──

export async function handleUpdateSession(
  request: Request,
  sessionId: string,
) {
  try {
    const { user } = await getServerUserSession(request);
    const body = await request.json();
    const { conversation, title, intent } = updateSchema.parse(body);

    // Verify ownership
    const existing = await db
      .selectFrom("fenixSessions")
      .select("id")
      .where("id", "=", sessionId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (!existing) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (conversation !== undefined) {
      updates.conversation = JSON.stringify(conversation);
    }
    if (title !== undefined) {
      updates.title = title;
    }
    if (intent !== undefined) {
      updates.intent = intent;
    }

    await db
      .updateTable("fenixSessions")
      .set(updates)
      .where("id", "=", sessionId)
      .where("userId", "=", user.id)
      .execute();

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Update session error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Delete session ──

export async function handleDeleteSession(
  request: Request,
  sessionId: string,
) {
  try {
    const { user } = await getServerUserSession(request);

    await db
      .deleteFrom("fenixSessions")
      .where("id", "=", sessionId)
      .where("userId", "=", user.id)
      .execute();

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Delete session error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
