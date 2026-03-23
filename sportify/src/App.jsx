import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: input }],
          }),
        }
      );

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const aiReply = data.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        { role: "user", text: input },
        { role: "ai", text: aiReply },
      ]);

      setInput("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
    setError(null);
  };

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="title">Spotnana</div>
        <button className="hamburger" onClick={() => setHistoryOpen(!historyOpen)}>
          ☰ History
        </button>
      </header>

      {/* Overlay */}
      <div className={`overlay ${historyOpen ? "show" : ""}`} onClick={() => setHistoryOpen(false)}></div>

      {/* History Panel */}
      <div className={`history-panel ${historyOpen ? "show" : ""}`}>
        <h2>History</h2>
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, index) => (
          <div key={index} className="history-message">
            <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat Box */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="typing">AI is typing...</div>}
        {error && <div className="error">{error}</div>}
      </div>

      {/* Input Area */}
      <div className="input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}

export default App;