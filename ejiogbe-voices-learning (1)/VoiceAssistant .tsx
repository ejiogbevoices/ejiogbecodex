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
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useVoiceAssistantChat } from "../helpers/voiceAssistantApi";
import { useAudioQueue } from "../helpers/useAudioQueue";
import { useFenixSessions } from "../helpers/useFenixSessions";
import { pickSuggestions, detectIntent } from "../helpers/fenixSuggestions";
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
  const [suggestions] = useState(() => pickSuggestions(null));
  const [showSidebar, setShowSidebar] = useState(false);

  const {
    messages,
    setMessages,
    currentResponse,
    isStreaming,
    error,
    sendMessage,
    clearHistory,
  } = useVoiceAssistantChat();

  const {
    isSpeaking,
    addToQueue,
    stopAll,
    ensureAudioUnlocked,
  } = useAudioQueue();

  const {
    sessions,
    activeSessionId,
    isLoadingSession,
    loadSession,
    createSession,
    saveSession,
    deleteSession,
    startNewConversation,
  } = useFenixSessions();

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ── Speech Recognition ──
  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } =
      window as unknown as IWindow;
    const Ctor = SpeechRecognition || webkitSpeechRecognition;

    if (Ctor) {
      const recognition = new Ctor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setTranscript(final);
          handleSend(final);
        } else {
          setTranscript(interim);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse, isStreaming, isOpen]);

  // ── Auto-save after each assistant response ──
  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const intent = lastUserMsg
      ? detectIntent(lastUserMsg.content)
      : "general";
    saveSession(messages, intent);
  }, [messages, activeSessionId, saveSession]);

  // ── Audio chunk handler with tag parsing ──
  const handleIncomingAudioChunk = useCallback(
    (rawText: string, lang?: string) => {
      let text = rawText;
      let chunkLang = lang;

      const langMatch = text.match(/\[LANG:\s*([^\]]+)\]/);
      if (langMatch) {
        chunkLang = langMatch[1].trim();
        text = text.replace(langMatch[0], "").trim();
      }

      const navMatch = text.match(/\[NAVIGATE:\s*([^\]]+)\]/);
      if (navMatch) {
        navigate(navMatch[1].trim());
        text = text.replace(navMatch[0], "").trim();
      }

      const suggestMatch = text.match(/\[SUGGEST_RECORDING:\s*([^\]]+)\]/);
      if (suggestMatch) {
        text = text.replace(suggestMatch[0], "").trim();
      }

      const contentMatch = text.match(/\[SUGGEST_CONTENT:\s*([^\]]+)\]/);
      if (contentMatch) {
        text = text.replace(contentMatch[0], "").trim();
      }

      if (text.length > 0) {
        addToQueue(text, chunkLang);
      }
    },
    [addToQueue, navigate],
  );

  // ── Handlers ──

  const handleOpen = () => setIsOpen(true);

  const toggleListening = () => {
    ensureAudioUnlocked();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (text: string) => {
    ensureAudioUnlocked();
    if (!text.trim()) return;

    // Create session on first message if none is active
    if (!activeSessionId) {
      await createSession(text);
    }

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
    if (e.key === "Enter") handleSend(transcript);
  };

  const handleLoadSession = async (sessionId: string) => {
    const loaded = await loadSession(sessionId);
    setMessages(loaded);
    setShowSidebar(false);
  };

  const handleNewConversation = () => {
    startNewConversation();
    clearHistory();
    setShowSidebar(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);

    // If we just deleted the active session, clear the chat
    if (sessionId === activeSessionId) {
      clearHistory();
    }
  };

  const cleanText = (text: string) =>
    text
      .replace(/\{"action":.*?\}/g, "")
      .replace(/\[NAVIGATE:.*?\]/g, "")
      .replace(/\[LANG:.*?\]/g, "")
      .replace(/\[SUGGEST_RECORDING:.*?\]/g, "")
      .replace(/\[SUGGEST_CONTENT:.*?\]/g, "");

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const showButton = !isOpen || inline;
  const showContainer = isOpen;

  return (
    <>
      {/* ── Floating / inline open button ── */}
      {showButton && (
        <button
          className={inline ? styles.inlineButton : styles.floatingButton}
          onClick={handleOpen}
          aria-label="Open Fenix"
        >
          <Mic size={inline ? 20 : 24} />
        </button>
      )}

      {showContainer && (
        <div
          className={`${inline ? styles.inlineContainer : styles.container} ${
            isMinimized ? styles.minimized : ""
          }`}
        >
          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.title}>
              <button
                className={styles.iconButton}
                onClick={() => setShowSidebar(!showSidebar)}
                title={showSidebar ? "Hide conversations" : "Conversations"}
              >
                {showSidebar ? (
                  <PanelLeftClose size={16} />
                ) : (
                  <PanelLeftOpen size={16} />
                )}
              </button>
              <MessageSquare size={16} />
              <span>Fenix</span>
            </div>
            <div className={styles.actions}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={styles.iconButton}
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
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className={styles.body}>
              {/* ── Sidebar ── */}
              {showSidebar && (
                <div className={styles.sidebar}>
                  <div className={styles.sidebarHeader}>
                    <span className={styles.sidebarTitle}>Conversations</span>
                    <button
                      className={styles.newChatBtn}
                      onClick={handleNewConversation}
                      title="New conversation"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className={styles.sessionList}>
                    {sessions.length === 0 ? (
                      <p className={styles.noSessions}>
                        No conversations yet
                      </p>
                    ) : (
                      sessions.map((s) => (
                        <button
                          key={s.id}
                          className={`${styles.sessionItem} ${
                            s.id === activeSessionId
                              ? styles.sessionActive
                              : ""
                          }`}
                          onClick={() => handleLoadSession(s.id)}
                        >
                          <div className={styles.sessionInfo}>
                            <span className={styles.sessionTitle}>
                              {s.title}
                            </span>
                            <span className={styles.sessionDate}>
                              {formatTime(s.updatedAt)}
                            </span>
                          </div>
                          <button
                            className={styles.sessionDelete}
                            onClick={(e) => handleDeleteSession(e, s.id)}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── Chat ── */}
              <div className={styles.chatArea}>
                <div className={styles.messages}>
                  {/* Empty state */}
                  {messages.length === 0 && !transcript && !isLoadingSession && (
                    <div className={styles.emptyState}>
                      <p>How can I help you explore the archive?</p>
                      <div className={styles.suggestions}>
                        {suggestions.map((s, i) => (
                          <button key={i} onClick={() => handleSend(s)}>
                            "{s}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading session */}
                  {isLoadingSession && (
                    <div className={styles.loadingSession}>
                      Loading conversation...
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`${styles.message} ${
                        msg.role === "user"
                          ? styles.userMessage
                          : styles.assistantMessage
                      }`}
                    >
                      {cleanText(msg.content)}
                    </div>
                  ))}

                  {/* Streaming response */}
                  {isStreaming && (
                    <div
                      className={`${styles.message} ${styles.assistantMessage}`}
                    >
                      {cleanText(currentResponse)}
                      <span className={styles.cursor}>|</span>
                    </div>
                  )}

                  {error && (
                    <div className={styles.errorMessage}>Error: {error}</div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ── Input area ── */}
                <div className={styles.inputArea}>
                  {isListening && (
                    <div className={styles.listeningIndicator}>
                      <div className={styles.pulseRing} />
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
                        onClick={stopAll}
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
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
