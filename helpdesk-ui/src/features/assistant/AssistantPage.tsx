import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiAskAssistant } from '../../lib/apiClient';
import { AIAnswerBlock, Button, Alert } from '../../components';
import { ASSISTANT_STARTER_PROMPTS } from '../../lib/mockData';
import type { ChatMessage } from '../../types';
import './AssistantPage.css';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function AssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(false);
  const [solvedId, setSolvedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isSearching) return;
    setError(false);
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsSearching(true);
    try {
      const reply = await apiAskAssistant(text.trim());
      setMessages(m => [...m, reply]);
    } catch {
      setError(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNeedHelp = (questionText?: string) => {
    navigate('/tickets/new', {
      state: { prefillDescription: questionText ?? '' }
    });
  };

  return (
    <div className="assistant-page">
      {/* Header */}
      <div className="assistant-header">
        <div className="assistant-header__icon"><Bot size={20} /></div>
        <div>
          <h1 className="assistant-header__title">AI Assistant</h1>
          <p className="assistant-header__subtitle">
            Answers are grounded in company documents — runs on your company's own infrastructure, no cloud AI.
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="assistant-body">
        {/* Empty state — starter prompts */}
        {messages.length === 0 && !isSearching && (
          <div className="assistant-empty">
            <p className="assistant-empty__label">Try asking:</p>
            <div className="assistant-starter-prompts">
              {ASSISTANT_STARTER_PROMPTS.map(p => (
                <button
                  key={p}
                  className="starter-prompt"
                  onClick={() => sendMessage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        <div className="chat-thread" aria-live="polite" aria-label="Conversation">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              <div className="chat-message__avatar" aria-hidden>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className="chat-message__bubble">
                {msg.role === 'assistant' ? (
                  <AIAnswerBlock
                    content={msg.content}
                    citation={msg.citation}
                    noMatch={msg.noMatch}
                    onSolved={solvedId !== msg.id ? () => setSolvedId(msg.id) : undefined}
                    onNeedHelp={() => handleNeedHelp(
                      messages.find((m, i) => m.role === 'user' && messages[i + 1]?.id === msg.id)?.content
                    )}
                  />
                ) : (
                  <p className="chat-message__text">{msg.content}</p>
                )}
                <span className="chat-message__time">{formatTime(msg.timestamp)}</span>
                {solvedId === msg.id && (
                  <p className="chat-message__solved">✓ Marked as solved — no ticket needed.</p>
                )}
              </div>
            </div>
          ))}

          {/* Searching indicator */}
          {isSearching && (
            <div className="chat-message chat-message--assistant">
              <div className="chat-message__avatar" aria-hidden><Bot size={14} /></div>
              <div className="chat-searching" aria-label="Searching knowledge base">
                <span className="chat-searching__dot" /><span className="chat-searching__dot" /><span className="chat-searching__dot" />
                <span className="chat-searching__label">Searching knowledge base…</span>
              </div>
            </div>
          )}

          {/* AI error state */}
          {error && (
            <Alert variant="error" title="AI Assistant unavailable">
              The assistant is temporarily unavailable. You can{' '}
              <button className="inline-link" onClick={() => handleNeedHelp(input)}>create a ticket</button>
              {' '}and a support agent will help you directly.
            </Alert>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="assistant-input-area">
        <div className="assistant-input-wrap">
          <textarea
            ref={inputRef}
            className="assistant-input"
            placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={isSearching}
            aria-label="Message input"
          />
          <Button
            variant="primary"
            icon={<Send size={16} />}
            loading={isSearching}
            disabled={!input.trim()}
            onClick={() => sendMessage(input)}
            aria-label="Send message"
          />
        </div>
        <p className="assistant-input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
