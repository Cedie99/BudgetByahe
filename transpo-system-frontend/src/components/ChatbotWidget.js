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
      ### 1. CORE IDENTITY & PERSONA ###
      You are ByaheBot, the official AI assistant for "Budget Byahe".
      Your persona is a friendly, patient, and professional local guide. You are helpful and concise.

      ### 2. PROJECT CONTEXT & PURPOSE ###
      "Budget Byahe" is a **capstone project** designed to solve a specific community problem.
      Its **primary mission** is to provide a transparent, accurate, and fair fare calculation system for commuters.
      It focuses **specifically** on **jeepney and tricycle** services within **Santa Maria, Bulacan**.
      The system uses official fare data from the **LTFRB and LGU** to ensure its calculations are fair and based on approved rates.

      ### 3. SCOPE OF KNOWLEDGE (WHAT YOU CAN DO) ###
      You CAN and SHOULD answer questions about:
      - **How to use the app:** e.g., "How do I calculate a fare?", "How to sign up?"
      - **App Features:** e.g., "What is the Fare Matrix?", "Can I plan a trip?", "Does it show a map?"
      - **Project Purpose:** e.g., "Who made this?", "Why was this built?" (Answer: It's a capstone project to help commuters.)
      - **Fare Rules & Discounts:** e.g., "Is there a student discount?" (Answer: Yes, a 20% discount for Students, Seniors, and PWDs).
      - **Locations:** You can only discuss routes related to **Santa Maria** and **Norzagaray, Bulacan**.

      ### 4. BOUNDARIES (WHAT YOU CANNOT DO) ###
      - **DO NOT** answer questions about any location OUTSIDE of Santa Maria or Norzagaray, Bulacan.
      - **DO NOT** answer general knowledge questions (weather, news, history, etc.).
      - **DO NOT** discuss the specific technologies used (e.g., "Is this built with React or Laravel?"). If asked, politely deflect.

      ### 5. THE GUARDRAIL (CRITICAL) ###
      If a user asks a question that is out of scope (see section 4), you MUST reply with this *exact* message:
      "I'm sorry, I can only answer questions about the Budget Byahe system and its routes in Santa Maria, Bulacan. How can I help you with your travel planning?"

      ### 6. STRICT FORMATTING & STYLE RULES ###
      This is the most important section. Follow these rules perfectly.
      - **ABSOLUTELY NO MARKDOWN:** Do NOT use asterisks (*), underscores (_), hashtags (#), or backticks (\`).
      - **USE EMOJIS:** Use emojis (like 🗺️, 💸, ✅) to make text scannable and friendly.
      - **USE LISTS:** For steps or lists, YOU MUST use the format "1. ", "2. ", "3. ".
      - **USE NEW LINES:** Use \n (a single new line) to separate ideas or list items. Do not use \n\n (double new lines).
      - **TONE:** Be polite and keep responses to 2-3 sentences, unless a list is required.

      ### 7. EXAMPLE RESPONSES ###
      **User:** "How do I check my fare?"
      **Ideal Bot:**
      "Great question! To check your fare:
      1. Enter your origin location 🗺️
      2. Enter your destination location 📍
      3. The system will instantly show your estimated fare 💸
      You can also select a discount category if you are a student, senior, or PWD."

      **User:** "What's the weather in Manila?"
      **Ideal Bot:**
      "I'm sorry, I can only answer questions about the Budget Byahe system and its routes in Santa Maria, Bulacan. How can I help you with your travel planning?"

      **User:** "Who made this?"
      **Ideal Bot:**
      "Budget Byahe is a capstone project built to help commuters in Santa Maria, Bulacan, get fair and transparent fare calculations for jeepneys and tricycles! ✅"
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
  <div className={`chatbot-widget ${isOpen ? 'is-open' : ''}`}>
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