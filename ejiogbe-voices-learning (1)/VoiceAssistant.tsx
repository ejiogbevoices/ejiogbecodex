import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  X,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Square,
  Volume2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useVoiceAssistantChat } from "../helpers/voiceAssistantApi";
import { useAudioQueue } from "../helpers/useAudioQueue";
import styles from "./VoiceAssistant.module.css";

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface VoiceAssistantProps {
  inline?: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  inline = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const {
    messages,
    currentResponse,
    isStreaming,
    error,
    sendMessage,
    clearHistory,
  } = useVoiceAssistantChat();

  const {
    isPlaying: isAudioPlaying,
    isSpeaking,
    addToQueue,
    ensureAudioUnlocked,
  } = useAudioQueue();

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } =
      window as unknown as IWindow;
    const SpeechRecognitionConstructor =
      SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleSend(finalTranscript);
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse, isStreaming, isOpen]);

  // Handle legacy JSON navigation only.
  // New [NAVIGATE: ...] format is handled in handleIncomingAudioChunk.
  useEffect(() => {
    if (currentResponse) {
      try {
        // Check JSON format
        const match = currentResponse.match(
          /\{"action":\s*"navigate",\s*"path":\s*"(.*?)"\}/,
        );
        if (match && match[1]) {
          navigate(match[1]);
        }
      } catch (e) {
        console.error("Navigation parsing error:", e);
      }
    }
  }, [currentResponse, navigate]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const toggleListening = () => {
    ensureAudioUnlocked();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      recognitionRef.current?.start();
    }
  };

  const handleIncomingAudioChunk = useCallback(
    (rawText: string) => {
      let displayableText = rawText;

      // 1. Silent Navigation Action
      const navMatch = displayableText.match(/\[NAVIGATE:\s*([^\]]+)\]/);
      if (navMatch) {
        const targetPath = navMatch[1];
        navigate(targetPath); // Perform the page move instantly

        // Remove the tag so it never goes to TTS
        displayableText = displayableText.replace(navMatch[0], "").trim();
      }

      // 2. Only update if there is actual speech left
      if (displayableText.length > 0) {
        addToQueue(displayableText);
      }
    },
    [addToQueue, navigate],
  );

  const handleSend = (text: string) => {
    ensureAudioUnlocked();
    if (!text.trim()) return;

    const context = {
      currentPage: location.pathname,
      recordingId: location.pathname.includes("/recordings/")
        ? location.pathname.split("/recordings/")[1]
        : undefined,
      elderId: location.pathname.includes("/elders/")
        ? location.pathname.split("/elders/")[1]
        : undefined,
      manuscriptId: location.pathname.includes("/manuscripts/")
        ? location.pathname.split("/manuscripts/")[1]
        : undefined,
    };

    sendMessage(text, context, handleIncomingAudioChunk);
    setTranscript("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend(transcript);
    }
  };

  const cleanText = (text: string) => {
    return text
      .replace(/\{"action":.*?\}/g, "")
      .replace(/\[NAVIGATE:.*?\]/g, "");
  };

  const showButton = !isOpen || inline;
  const showContainer = isOpen;

  return (
    <>
      {showButton && (
        <button
          className={inline ? styles.inlineButton : styles.floatingButton}
          onClick={handleOpen}
          aria-label="Open Ejiogbe Voices Assistant"
        >
          <Mic size={inline ? 20 : 24} />
        </button>
      )}

      {showContainer && (
        <div
          className={`${inline ? styles.inlineContainer : styles.container} ${isMinimized ? styles.minimized : ""}`}
        >
          <div className={styles.header}>
            <div className={styles.title}>
              <MessageSquare size={18} />
              <span>Ejiogbe Voices Assistant</span>
            </div>
            <div className={styles.actions}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={styles.iconButton}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.iconButton}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className={styles.messages}>
              {messages.length === 0 && !transcript && (
                <div className={styles.emptyState}>
                  <p>How can I help you explore the archive today?</p>
                  <div className={styles.suggestions}>
                    <button
                      onClick={() => handleSend("Show me recent recordings")}
                    >
                      "Show me recent recordings"
                    </button>
                    <button
                      onClick={() => handleSend("Tell me about the traditions")}
                    >
                      "Tell me about the traditions"
                    </button>
                    <button onClick={() => handleSend("Who are the elders?")}>
                      "Who are the elders?"
                    </button>
                    <button
                      onClick={() =>
                        handleSend("What languages are available?")
                      }
                    >
                      "What languages are available?"
                    </button>
                    <button
                      onClick={() =>
                        handleSend("Recommend something to listen to")
                      }
                    >
                      "Recommend something to listen to"
                    </button>
                    <button
                      onClick={() =>
                        handleSend("Help me find something specific")
                      }
                    >
                      "Help me find something specific"
                    </button>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.message} ${
                    msg.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage
                  }`}
                >
                  {cleanText(msg.content)}
                </div>
              ))}

              {isStreaming && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  {cleanText(currentResponse)}
                  <span className={styles.cursor}>|</span>
                </div>
              )}

              {error && (
                <div className={styles.errorMessage}>Error: {error}</div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {!isMinimized && (
            <div className={styles.inputArea}>
              {isListening && (
                <div className={styles.listeningIndicator}>
                  <div className={styles.pulseRing}></div>
                  <span>Listening...</span>
                </div>
              )}

              {isSpeaking && !isListening && (
                <div className={styles.speakingIndicator}>
                  <Volume2 size={16} className={styles.speakingIcon} />
                  <span>Speaking...</span>
                </div>
              )}

              <div className={styles.inputRow}>
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening ? "Listening..." : "Type or speak..."
                  }
                  className={styles.input}
                  disabled={isListening || isStreaming}
                />

                {transcript ? (
                  <Button
                    size="icon-sm"
                    onClick={() => handleSend(transcript)}
                    disabled={isStreaming}
                  >
                    <Send size={16} />
                  </Button>
                ) : isSpeaking ? (
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    title="Stop speaking"
                  >
                    <Square size={16} />
                  </Button>
                ) : (
                  <Button
                    size="icon-sm"
                    variant={isListening ? "destructive" : "primary"}
                    onClick={toggleListening}
                    className={isListening ? styles.micActive : ""}
                    disabled={isStreaming}
                  >
                    <Mic size={16} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
