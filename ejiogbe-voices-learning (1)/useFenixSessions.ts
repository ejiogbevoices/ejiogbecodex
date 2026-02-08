import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "./voiceAssistantApi";

export type FenixSession = {
  id: string;
  title: string;
  intent: string;
  createdAt: string;
  updatedAt: string;
};

type FenixSessionFull = FenixSession & {
  conversation: ChatMessage[];
};

/**
 * Hook for managing Fenix conversation sessions.
 * Handles sidebar listing, creating, loading, saving, and deleting.
 */
export const useFenixSessions = () => {
  const [sessions, setSessions] = useState<FenixSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch session list ──

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/_api/voice-assistant/sessions?limit=30");
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ── Load a session ──

  const loadSession = useCallback(
    async (sessionId: string): Promise<ChatMessage[]> => {
      setIsLoadingSession(true);
      try {
        const res = await fetch(
          `/_api/voice-assistant/sessions/${sessionId}`,
        );
        if (!res.ok) throw new Error("Failed to load session");
        const data: { session: FenixSessionFull } = await res.json();
        setActiveSessionId(sessionId);
        return data.session.conversation || [];
      } catch (err) {
        console.error("Failed to load session:", err);
        return [];
      } finally {
        setIsLoadingSession(false);
      }
    },
    [],
  );

  // ── Create a new session ──

  const createSession = useCallback(
    async (firstMessage?: string): Promise<string | null> => {
      try {
        const title = firstMessage
          ? firstMessage.substring(0, 80)
          : "New conversation";

        const res = await fetch("/_api/voice-assistant/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });

        if (!res.ok) throw new Error("Failed to create session");
        const data: { session: { id: string } } = await res.json();

        setActiveSessionId(data.session.id);
        fetchSessions();
        return data.session.id;
      } catch (err) {
        console.error("Failed to create session:", err);
        return null;
      }
    },
    [fetchSessions],
  );

  // ── Save messages (debounced, called after each assistant response) ──

  const saveSession = useCallback(
    (messages: ChatMessage[], intent?: string) => {
      const id = activeSessionId;
      if (!id || messages.length === 0) return;

      // Debounce: wait 2s after last change before saving
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        try {
          const body: Record<string, any> = {
            conversation: messages,
          };
          if (intent) body.intent = intent;

          await fetch(`/_api/voice-assistant/sessions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          // Bump sidebar timestamp
          setSessions((prev) =>
            prev.map((s) =>
              s.id === id
                ? { ...s, updatedAt: new Date().toISOString() }
                : s,
            ),
          );
        } catch (err) {
          console.error("Failed to save session:", err);
        }
      }, 2000);
    },
    [activeSessionId],
  );

  // ── Delete a session ──

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await fetch(`/_api/voice-assistant/sessions/${sessionId}`, {
          method: "DELETE",
        });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) setActiveSessionId(null);
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    },
    [activeSessionId],
  );

  // ── Start fresh (no active session until first message) ──

  const startNewConversation = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    sessions,
    activeSessionId,
    isLoadingSession,
    fetchSessions,
    loadSession,
    createSession,
    saveSession,
    deleteSession,
    startNewConversation,
  };
};
