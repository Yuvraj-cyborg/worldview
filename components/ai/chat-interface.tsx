"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; source: string }>;
  method?: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/ai/deduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await resp.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.answer ?? data.error ?? "No response.",
        sources: data.sources,
        method: data.method,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "Failed to get response. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <Bot className="size-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Ask GeoTrack anything</p>
            <p className="text-sm mt-1">Try: "What's happening in the Red Sea?" or "Analyze the Ukraine front"</p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                "What are the top global threats right now?",
                "Analyze Iran's nuclear program status",
                "What's driving instability in the Sahel?",
                "Summarize the Russia-Ukraine situation",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-wv-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="size-7 rounded-lg bg-wv-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="size-4 text-wv-accent" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3",
                msg.role === "user"
                  ? "bg-wv-accent text-white"
                  : "bg-surface-2 border border-border"
              )}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-[10px] uppercase text-text-muted font-medium mb-1">Sources</p>
                  {msg.sources.slice(0, 5).map((s, i) => (
                    <p key={i} className="text-[11px] text-text-muted truncate">
                      [{i + 1}] {s.title}
                    </p>
                  ))}
                </div>
              )}
              {msg.method && msg.role === "assistant" && (
                <p className="text-[10px] text-text-muted mt-1 font-mono">{msg.method}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="size-7 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 mt-0.5">
                <User className="size-4 text-text-secondary" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="size-7 rounded-lg bg-wv-accent/20 flex items-center justify-center shrink-0">
              <Loader2 className="size-4 text-wv-accent animate-spin" />
            </div>
            <div className="bg-surface-2 border border-border rounded-xl px-4 py-3">
              <p className="text-sm text-text-muted">Analyzing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border pt-4">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about current events..."
            className="flex-1 bg-surface-1 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-wv-accent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-wv-accent text-white rounded-lg text-sm font-medium hover:bg-wv-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
