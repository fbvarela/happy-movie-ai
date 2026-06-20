"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ChatInterface from "@/components/chat/ChatInterface";

const STORAGE_KEY = "hf-chat-pos";
const BTN_SIZE = 52;
const DRAG_THRESHOLD = 5;

function clamp(x, y) {
  return {
    x: Math.max(0, Math.min(x, window.innerWidth - BTN_SIZE)),
    y: Math.max(0, Math.min(y, window.innerHeight - BTN_SIZE)),
  };
}

function loadPos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return clamp(p.x, p.y);
    }
  } catch {}
  return null;
}

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const drag = useRef({ active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false });

  useEffect(() => {
    const saved = loadPos();
    setPos(saved || clamp(window.innerWidth - 72, window.innerHeight - 132));
    setReady(true);
  }, []);

  useEffect(() => {
    function onResize() {
      setPos((p) => clamp(p.x, p.y));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (!drag.current.moved && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
      drag.current.moved = true;
    }
    if (drag.current.moved) {
      setPos(clamp(e.clientX - drag.current.offsetX, e.clientY - drag.current.offsetY));
    }
  }, []);

  const onPointerUp = useCallback(() => {
    if (!drag.current.active) return;
    const wasDrag = drag.current.moved;
    drag.current.active = false;
    if (!wasDrag) {
      setOpen(true);
    }
    setPos((p) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
      return p;
    });
  }, []);

  return (
    <>
      {ready && !open && (
        <button
          type="button"
          aria-label="Open AI chat"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: "50%",
            background: "var(--bark, #3d2b1f)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            zIndex: 999,
            border: "none",
            cursor: "grab",
            fontSize: 22,
            touchAction: "none",
            userSelect: "none",
          }}
        >
          &#128172;
        </button>
      )}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI chat assistant"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface, #fff)",
              width: "100%",
              maxWidth: 480,
              height: "min(85dvh, 640px)",
              borderRadius: "16px 16px 0 0",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.1rem",
                borderBottom: "1px solid var(--line, #e5e5e5)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #1a1a1a)" }}>
                AI Assistant
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 26,
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "var(--text-muted, #777)",
                  padding: "0 4px",
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: "1rem 1.1rem" }}>
              <ChatInterface />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
