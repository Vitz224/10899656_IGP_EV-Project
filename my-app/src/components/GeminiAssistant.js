import React, { useState } from "react";
import axios from "axios";

const GeminiAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setLoading(true);

    try {
      const res = await axios.post("/api/gemini/ask", { message: input });
      setMessages(msgs => [...msgs, { sender: "ai", text: res.data.text }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: "ai", text: "Error: " + err.message }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, width: 350, background: "#222",
      color: "#fff", borderRadius: 10, padding: 16, zIndex: 1000
    }}>
      <img src={process.env.PUBLIC_URL + "/MainLogo.png"} alt="Logo" className="main-logo" />  
      <h3>EV Assistant</h3>
      <h6>Ask about your EV Bookings, Chargers, and more..</h6>
      <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <b>{msg.sender === "user" ? "You" : "AI"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        placeholder="Ask Your AI Assistant..."
        style={{ width: "80%", marginRight: 8 }}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
    </div>
  );
};

export default GeminiAssistant;
