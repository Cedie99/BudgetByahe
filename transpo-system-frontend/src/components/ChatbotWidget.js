import React, { useState, useEffect } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import "./ChatbotWidget.css";

// Use environment variable for the API Key
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

// Define available models with a preferred order (fastest/most reliable first)
const GROQ_MODELS = [
  "mixtral-8x7b-32768",
  "gemma-7b-it",
  "llama-3.1-8b-instant"
];

// --- Utility Function to Format Time ---
const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- Groq Failover API Function ---
/**
 * Tries to get a response from Groq, iterating through models until one succeeds.
 * @param {Array<Object>} messages - The conversation history including the new user message.
 * @param {string} systemPrompt - The instruction for the AI.
 * @returns {Promise<string>} The bot's response text.
 * @throws {Error} If all models fail or the API key is missing.
 */
const getGroqResponse = async (messages, systemPrompt) => {

    // The Groq API requires the full message structure: [{role: 'system', content: '...'}, {role: 'user', content: '...'}, ...]
    const payloadMessages = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    for (const model of GROQ_MODELS) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                    messages: payloadMessages,
                    temperature: 0.5,
                    max_tokens: 250,
                }),
            });

            const data = await response.json();

            if (data.choices?.[0]?.message?.content) {
                console.log(`Groq response successful using model: ${model}`);
                return data.choices[0].message.content.trim();
            }

            // If the API returns an error structure (e.g., rate limit, invalid request)
            if (data.error) {
                console.warn(`Model ${model} failed with API error:`, data.error.message);
                // Continue to the next model in the list
                continue;
            }

        } catch (err) {
            // Catches network errors (e.g., CORS, DNS, network cable disconnected)
            console.warn(`Model ${model} failed with network error:`, err);
            // Continue to the next model in the list
        }
    }

    throw new Error("⚠️ All Groq AI models failed. Please check your network or API limits.");
}
// --- End Groq Failover API Function ---


export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! 👋 I'm ByaheBot. How can I assist you with Budget Byahe today?", timestamp: formatTime(new Date()) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);


    // --- SCROLL TO BOTTOM EFFECT ---
    useEffect(() => {
        const chatBody = document.querySelector(".chat-body");
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, [messages, isOpen]);


  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Safety check for API Key before processing
    if (!GROQ_API_KEY) {
    setMessages((prev) => [...prev, { from: "bot", text: "Error: Groq API Key is missing. Please check your environment variables (.env).", timestamp: formatTime(new Date()) }]);
    return;
    }

    const userMessage = input;
    setMessages((prev) => [...prev, { from: "user", text: userMessage, timestamp: formatTime(new Date()) }]);
    setInput("");
    setIsTyping(true);

    try {
    // --- 1. Define System Context (Keep this as is) ---
    const systemPrompt = `
    You are ByaheBot, the friendly AI assistant for the Budget Byahe system.
    Always use clear, concise, and easy-to-read responses.

    🏙️ About Budget Byahe:
    - Transparent fare system for tricycles and jeepneys in Santa Maria, Bulacan.
    - Ensures fair, accurate fare computation based on distance.

    💸 Fare Rules:
    - Uses Norzagaray–Santa Maria Jeepney Route as base.
    - 20% fare discount applies to Students, Seniors, and PWDs.

    🗺️ Features:
    - Fare matrix transparency (LTFRB & LGU rates)
    - Trip planning, budget tracking, and Google Maps route display
    - User actions: Sign up, Select Route, Check Fare Matrix, Plan Trip

    🧾 Response Style:
    - No asterisks or Markdown.
    - Use line breaks, emojis, or bullet points for clarity.
    - Always polite, brief, and within 2–3 sentences (unless step-by-step is required).
    - If unrelated to Budget Byahe, reply exactly:
    "I'm sorry, I can only answer questions about the Budget Byahe system. How can I help you with your travel planning or account?"

    🎯 Example ideal response:
    To check your fare:
    1. Enter your origin and destination 🗺️  
    2. The system instantly shows your estimated fare 💸  
    3. You can also view the updated fare matrix for transparency ✅
    `;

    // --- 2. Prepare conversation history (Keep this as is) ---
    const conversationHistory = messages
    .filter(msg => msg.from !== 'bot' || !msg.text.includes("Error:"))
    .slice(1)
    .map(msg => ({
    role: msg.from === 'user' ? 'user' : 'assistant',
    content: msg.text,
    }));

    conversationHistory.push({ role: 'user', content: userMessage });

    let botReply = await getGroqResponse(conversationHistory, systemPrompt);

    /// --- START: Improved cleanup for numbered-list formatting ---

    botReply = botReply
      .replace(/[*_`#]/g, "")
      .replace(/:\s*(?=(\d+[\.\)]|\(\d+\)|\d+\uFE0F?\u20E3))/g, ":\n")
      // Handle numbered items, making sure not to duplicate dots
      .replace(/(?:^|\s)(\d+)(?:[.)])?\s+/g, "\n$1. ")
      // Convert emoji-numbered or weird number formats into clean "1. "
      .replace(/(\d+)[\uFE0F\u20E3]\s*/g, "\n$1. ")
      // Convert hyphen bullets into their own lines
      .replace(/(?:^|\s)-\s*/g, "\n- ")
      // Collapse multiple blank lines
      .replace(/\n{2,}/g, "\n")
      // Trim spaces and fix leading newline
      .replace(/[ \t]+$/gm, "")
      .trim();

    if (botReply.startsWith("\n")) botReply = botReply.slice(1);
    if (botReply && !/[.!?]$/.test(botReply)) botReply += ".";
    // --- END: Robust cleanup & list formatting ---


    // final step: set message once
    setMessages(prev => [
    ...prev,
    { from: "bot", text: botReply, timestamp: formatTime(new Date()) }
    ]);
    } catch (error) {
    setMessages(prev => [
    ...prev,
    { from: "bot", text: "⚠️ Sorry, something went wrong while connecting to ByaheBot. Please try again later.", timestamp: formatTime(new Date()) }
    ]);
    } finally {
    setIsTyping(false);
    }
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
              // --- UPDATE 4: Render message with text and timestamp ---
              <div key={i} className={`chat-message-container ${msg.from}`}>
                  <div
                    className={`chat-message ${msg.from}`}
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        // Bold bullet or plain key phrases before a colon
                        .replace(/(^|\n|\•\s*)([A-Z][^:\n]{2,}):/g, '$1<strong>$2:</strong>')
                        // Bold numbered list items like "1. Sign Up:" or "2. Select Route:"
                        .replace(/(^|\n)(\d+\.\s*)([A-Z][^:\n]{2,}):/g, '$1$2<strong>$3:</strong>')
                        // Keep line breaks visible
                        .replace(/\n/g, "<br>")
                    }}
                  ></div>

                  <div className="timestamp">{msg.timestamp}</div>
              </div>
            ))}
                {isTyping && (
                    <div className="chat-message-container bot">
                        <div className="chat-message bot typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder={isTyping ? "ByaheBot is typing..." : "Type your question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
            />
            <button onClick={handleSend} disabled={isTyping || !input.trim()}>Send</button>
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