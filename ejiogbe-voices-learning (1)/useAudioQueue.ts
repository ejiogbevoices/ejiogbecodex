import { useState, useRef, useEffect, useCallback } from "react";

type QueueItem = {
  text: string;
  lang?: string;
};

/**
 * Hook for managing a FIFO queue of text chunks for sequential TTS playback.
 * Implements backpressure control, interrupt handling, and multilingual voice routing.
 */
export const useAudioQueue = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const queueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const playNextRef = useRef<() => void>(() => {});

  const MAX_TEXT_CHUNKS = 10;

  /**
   * Initialize and unlock the audio element on user interaction.
   * Required for iOS Safari to allow playback.
   */
  const ensureAudioUnlocked = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!currentAudioRef.current) {
      const audio = new Audio();
      // @ts-ignore
      audio.playsInline = true;
      audio.preload = "auto";
      audio.style.display = "none";
      document.body.appendChild(audio);
      currentAudioRef.current = audio;
    }

    const audio = currentAudioRef.current;

    if (audio.paused) {
      audio.src =
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAABFMYXZjNTguNTQuMTAwAAAAAAAAAAAA//OEAAABAAAAABAAAAAAAAAAAAAAAAAAlfE8BlgAAAAAABAAAAAAAAAAAAAA//OECQAAAAABAAAAABAAAAAAAAAAAAAAAAAAAAAAAAA//OECQAAAAABAAAAABAAAAAAAAAAAAAAAAAAAAAAAAA//OECQAAAAABAAAAABAAAAAAAAAAAAAAAAAAAAAAAAA//OECQAAAAABAAAAABAAAAAAAAAAAAAAAAAAAAAAAAA=";
      audio.play().catch((e) => {
        console.warn("Audio unlock failed (interaction required?):", e);
      });
    }
  }, []);

  /**
   * Fetch and play the next audio chunk.
   */
  const playNext = useCallback(async () => {
    const nextItem = queueRef.current.shift();

    if (!nextItem) {
      isProcessingRef.current = false;
      setIsSpeaking(false);
      setIsPlaying(false);
      return;
    }

    setIsSpeaking(true);

    try {
      const response = await fetch("/_api/voice-assistant/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: nextItem.text,
          languageCode: nextItem.lang,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (!currentAudioRef.current) {
        ensureAudioUnlocked();
      }
      const audio = currentAudioRef.current!;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        playNextRef.current();
      };

      audio.onerror = (e) => {
        console.error("Audio playback error", e);
        URL.revokeObjectURL(audioUrl);
        playNextRef.current();
      };

      audio.src = audioUrl;
      await audio.play();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.error("Error playing TTS chunk:", err);
      playNextRef.current();
    }
  }, [ensureAudioUnlocked]);

  playNextRef.current = playNext;

  /**
   * Start processing the queue if not already doing so.
   */
  const processQueue = useCallback(() => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsPlaying(true);
    playNext();
  }, [playNext]);

  /**
   * Add text chunk to queue with optional language for voice routing.
   */
  const addToQueue = useCallback(
    (text: string, lang?: string) => {
      if (queueRef.current.length >= MAX_TEXT_CHUNKS) {
        console.warn(
          "Audio queue full, dropping chunk:",
          text.substring(0, 20),
        );
        return;
      }

      queueRef.current.push({ text, lang });
      processQueue();
    },
    [processQueue],
  );

  /**
   * Stop all audio and clear the queue.
   */
  const stopAll = useCallback(() => {
    // Abort in-flight TTS requests
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    // Clear queue
    queueRef.current = [];

    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    isProcessingRef.current = false;
    setIsSpeaking(false);
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.remove();
        currentAudioRef.current = null;
      }
      abortControllerRef.current.abort();
    };
  }, []);

  return {
    textQueue: queueRef.current,
    isPlaying,
    isSpeaking,
    addToQueue,
    stopAll,
    ensureAudioUnlocked,
    abortSignal: abortControllerRef.current.signal,
  };
};
