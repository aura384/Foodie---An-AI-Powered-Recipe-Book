import { useState, useRef, useEffect } from "react";
import "./ReyChat.css";
import reyImg from "./rey.png";

const API_BASE = "http://localhost:3001/api/chat";

export default function ReyChat() {
  const [open, setOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm Rey 👋 Your personal food guide. Ask me anything — recipes, cooking tips, ingredient swaps, you name it! 🍽️",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setBubbleVisible(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setBubbleVisible(true);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const reply = data.reply || "Hmm, I couldn't think of anything! Try asking again 🙈";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong on my end. Try again in a sec 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {open && (
        <div className="rey-chat-window">
          <div className="rey-chat-header">
            <div className="rey-header-left">
              <div className="rey-avatar-sm">
                <img src={reyImg} alt="Rey" />
              </div>
              <div>
                <div className="rey-name">Rey</div>
                <div className="rey-status">
                  <span className="rey-dot" />
                  Your food guide
                </div>
              </div>
            </div>
            <button className="rey-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="rey-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`rey-msg rey-msg--${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="rey-msg-avatar">
                    <img src={reyImg} alt="Rey" />
                  </div>
                )}
                <div className="rey-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="rey-msg rey-msg--assistant">
                <div className="rey-msg-avatar">
                  <img src={reyImg} alt="Rey" />
                </div>
                <div className="rey-bubble rey-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="rey-input-row">
            <textarea
              ref={inputRef}
              className="rey-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything food-related…"
              rows={1}
            />
            <button
              className="rey-send"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="rey-fab-wrap">
        {bubbleVisible && !open && (
          <div className="rey-speech-bubble">
            Need help? Chat with me! 👋
            <button className="rey-bubble-close" onClick={() => setBubbleVisible(false)}>✕</button>
            <div className="rey-speech-tail" />
          </div>
        )}
        <button
          className={`rey-fab ${open ? "rey-fab--active" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Chat with Rey"
        >
          <img src={reyImg} alt="Rey" className="rey-fab-img" />
          {!open && <div className="rey-fab-ping" />}
        </button>
      </div>
    </>
  );
}