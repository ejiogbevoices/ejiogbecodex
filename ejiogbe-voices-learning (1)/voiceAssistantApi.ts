import { useState, useRef, useCallback } from "react";

export type ChatContext = {
  recordingId?: string;
  elderId?: string;
  manuscriptId?: string;
  currentPage?: string;
  targetLanguage?: string;
  proficiencyLevel?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StreamEvent =
  | { type: "text"; content: string }
  | { type: "audio-chunk"; content: string; lang?: string }
  | { type: "done" }
  | { type: "error"; message: string };

export const useVoiceAssistantChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      query: string,
      context?: ChatContext,
      onAudioChunk?: (text: string, lang?: string) => void,
    ) => {
      if (!query.trim()) return;

      setIsStreaming(true);
      setError(null);
      setCurrentResponse("");

      setMessages((prev) => [...prev, { role: "user", content: query }]);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/_api/voice-assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            history: messages.slice(-20),
            context,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(line.slice(6)) as StreamEvent;

              if (data.type === "text") {
                assistantContent += data.content;
                setCurrentResponse((prev) => prev + data.content);
              } else if (data.type === "audio-chunk") {
                if (onAudioChunk) {
                  onAudioChunk(data.content, data.lang);
                }
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (parseError) {
              if (
                parseError instanceof Error &&
                parseError.message !== "error"
              ) {
                console.error("SSE parse error:", parseError);
              }
            }
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantContent },
        ]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Chat error:", err);
        setError(msg);
      } finally {
        setIsStreaming(false);
        setCurrentResponse("");
        abortControllerRef.current = null;
      }
    },
    [messages],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    setCurrentResponse("");
    setError(null);
  }, []);

  return {
    messages,
    setMessages, // Exposed for session restore
    currentResponse,
    isStreaming,
    error,
    sendMessage,
    clearHistory,
  };
};
