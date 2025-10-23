import React, { useState } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import "./ChatbotWidget.css";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! 👋 I'm ByaheBot. How can I assist you with Budget Byahe today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);
    // Simulate AI reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Thanks for your message! My AI assistant feature will soon connect to eGov AI for real answers 🚀" },
      ]);
    }, 600);

    setInput("");
  };

  return (
    <div className="chatbot-widget">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <span>ByaheBot</span>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <FaTimes />
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.from}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      ) : (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <FaComments />
        </button>
      )}
    </div>
  );
}
