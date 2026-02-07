import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook for managing a FIFO queue of text chunks for sequential TTS playback.
 * Implements backpressure control and interrupt handling.
 */
export const useAudioQueue = () => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

    // Refs for queue and state management (to avoid stale closures in async loops)
  const queueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const playNextRef = useRef<() => void>(() => {});

  // Constants for backpressure
  const MAX_TEXT_CHUNKS = 10;

  /**
   * Initialize and unlock the audio element on user interaction.
   * Required for iOS Safari to allow playback.
   */
  const ensureAudioUnlocked = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!currentAudioRef.current) {
      const audio = new Audio();
      // @ts-ignore - playsInline is useful for iOS policy even on audio
      audio.playsInline = true;
      audio.preload = "auto";
      audio.style.display = "none";
      document.body.appendChild(audio);
      currentAudioRef.current = audio;
    }

    const audio = currentAudioRef.current;

    // Play a tiny silent MP3 to unlock the audio context if not already playing
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
   * This is called recursively via the onended handler.
   */
  const playNext = useCallback(async () => {
    // Look for the next chunk immediately
    const nextChunk = queueRef.current.shift();

    if (!nextChunk) {
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
        body: JSON.stringify({ text: nextChunk }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Re-use the singleton audio element
      if (!currentAudioRef.current) {
        ensureAudioUnlocked();
      }
      const audio = currentAudioRef.current!;

      // Setup handlers on the singleton
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        // Do NOT set currentAudioRef.current to null, keep it for reuse
        playNextRef.current();
      };

      audio.onerror = (e) => {
        console.error("Audio playback error", e);
        URL.revokeObjectURL(audioUrl);
        // Skip this chunk and try next
        playNextRef.current();
      };

      audio.src = audioUrl;
      await audio.play();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
            console.error("Error playing TTS chunk:", err);
      // Skip error and try next
      playNextRef.current();
    }
  }, []);

  // Keep the ref updated with the latest playNext function
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
   * Add text chunk to queue with backpressure.
   */
  const addToQueue = useCallback(
    (text: string) => {
      if (queueRef.current.length >= MAX_TEXT_CHUNKS) {
        console.warn(
          "Audio queue full, dropping chunk:",
          text.substring(0, 20),
        );
        return;
      }

      queueRef.current.push(text);
      processQueue();
    },
    [processQueue],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.remove(); // Remove from DOM
        currentAudioRef.current = null;
      }
      abortControllerRef.current.abort();
    };
  }, []);

  return {
    // For debugging/display, we return a copy of current queue,
    // though note this won't auto-update the component on change
    // since we use a ref. If queue UI is needed, state sync would be required.
    textQueue: queueRef.current,
    isPlaying,
    isSpeaking,
    addToQueue,
    ensureAudioUnlocked,
    abortSignal: abortControllerRef.current.signal,
  };
};
