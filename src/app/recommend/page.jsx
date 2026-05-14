"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Loader2, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import MoodSelector from "@/components/MoodSelector";
import RecommendationCard from "@/components/RecommendationCard";
import { useLanguage } from "@/context/LanguageContext";

function parseRecommendations(text) {
  try {
    // Find JSON array in the response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export default function RecommendPage() {
  const { t, lang } = useLanguage();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/recommend",
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    append({ role: "user", content: inputValue.trim() });
    setInputValue("");
  };

  const handleMoodSelect = (prompt) => {
    if (isLoading) return;
    append({ role: "user", content: prompt });
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const hasMessages = messages.length > 0;

  return (
    <ClientLayout>
      <div className="page recommend-page">
        {!hasMessages && (
          <div className="recommend-welcome">
            <div className="recommend-welcome-icon">
              <Sparkles size={40} />
            </div>
            <h1 className="page-title">{t("recommend.title")}</h1>
            <p className="page-sub">{t("recommend.subtitle")}</p>

            <div className="recommend-mood-section">
              <p className="recommend-mood-label">
                {lang === "es" ? "¿Qué te apetece ver?" : "What are you in the mood for?"}
              </p>
              <MoodSelector onSelect={handleMoodSelect} disabled={isLoading} />
            </div>
          </div>
        )}

        {hasMessages && (
          <>
            <div className="recommend-header">
              <h1 className="page-title" style={{ fontSize: "1.2rem", margin: 0 }}>
                <Sparkles size={20} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                {t("recommend.title")}
              </h1>
              <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                <RotateCcw size={14} /> {lang === "es" ? "Nueva charla" : "New chat"}
              </button>
            </div>

            <div className="recommend-messages" ref={scrollRef}>
              {messages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="recommend-msg recommend-msg-user">
                      <div className="recommend-msg-avatar">
                        <User size={16} />
                      </div>
                      <div className="recommend-msg-content">{msg.content}</div>
                    </div>
                  );
                }

                // Assistant message — try to parse as recommendations
                const recs = parseRecommendations(msg.content);

                return (
                  <div key={msg.id} className="recommend-msg recommend-msg-ai">
                    <div className="recommend-msg-avatar recommend-msg-avatar-ai">
                      <Bot size={16} />
                    </div>
                    <div className="recommend-msg-content">
                      {recs ? (
                        <div className="rec-card-list">
                          {recs.map((rec, i) => (
                            <RecommendationCard key={`${rec.title}-${i}`} rec={rec} />
                          ))}
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="recommend-msg recommend-msg-ai">
                  <div className="recommend-msg-avatar recommend-msg-avatar-ai">
                    <Bot size={16} />
                  </div>
                  <div className="recommend-msg-content">
                    <Loader2 size={20} className="spin" />
                    <span style={{ marginLeft: 8, color: "var(--text-muted)" }}>
                      {lang === "es" ? "Pensando..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Input area — always visible */}
        <form className="recommend-input-form" onSubmit={handleSubmit}>
          {hasMessages && (
            <MoodSelector onSelect={handleMoodSelect} disabled={isLoading} />
          )}
          <div className="recommend-input-row">
            <input
              ref={inputRef}
              type="text"
              className="input recommend-input"
              placeholder={t("recommend.askPlaceholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary recommend-send-btn"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
}
