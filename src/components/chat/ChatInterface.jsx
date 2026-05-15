'use client';

import { useState, useRef, useEffect } from 'react';
import { SUGGESTED_QUESTIONS } from '@/lib/chat-config';

function pickSuggestions(n = 4) {
  return [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, n);
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '24rem',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '1rem',
    paddingRight: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  suggestionsGrid: {
    display: 'grid',
    gap: '0.5rem',
  },
  suggestionBtn: {
    textAlign: 'left',
    fontSize: '0.875rem',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem 1rem',
    color: 'var(--text)',
    cursor: 'pointer',
    width: '100%',
    transition: 'border-color 0.15s, background 0.15s',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    background: 'var(--bark)',
    color: '#fff',
    borderRadius: '1rem',
    borderBottomRightRadius: '0.25rem',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: '1rem',
    borderBottomLeftRadius: '0.25rem',
  },
  thinking: {
    opacity: 0.5,
    fontStyle: 'italic',
  },
  form: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    color: 'var(--text)',
    outline: 'none',
  },
  sendBtn: {
    padding: '0.75rem 1rem',
    background: 'var(--bark)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    minWidth: '2.75rem',
    minHeight: '2.75rem',
    transition: 'opacity 0.15s',
  },
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [suggestions] = useState(() => pickSuggestions(4));
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || streaming) return;
    const history = messages.slice(-10);
    setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.ok || !res.body) throw new Error('Chat request failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.startsWith('\x00ERROR:')) throw new Error(chunk.slice(7));
        full += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: full };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.messages} aria-live="polite">
        {messages.length === 0 && (
          <div>
            <p style={styles.emptyLabel}>Ask me anything about films:</p>
            <div style={styles.suggestionsGrid}>
              {suggestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={styles.suggestionBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--bark-light)';
                    e.currentTarget.style.background = 'var(--cream)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--line)';
                    e.currentTarget.style.background = 'var(--surface)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            {!msg.content && streaming && msg.role === 'assistant' ? (
              <span style={styles.thinking}>Thinking…</span>
            ) : (
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={e => { e.preventDefault(); sendMessage(input); }}
        style={styles.form}
        noValidate
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about movies…"
          disabled={streaming}
          aria-label="Chat message"
          style={{
            ...styles.input,
            opacity: streaming ? 0.5 : 1,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--bark)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          aria-label="Send message"
          style={{
            ...styles.sendBtn,
            opacity: streaming || !input.trim() ? 0.45 : 1,
            cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {streaming ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
