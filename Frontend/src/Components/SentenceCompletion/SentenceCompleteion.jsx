import { useState, useRef } from "react";
import axios from "axios";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual API key

const AICursorAssistant = () => {
  const [content, setContent] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const editorRef = useRef(null);

  const fetchCompletion = async (text) => {
    if (!text.trim()) return;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`,
        {
          prompt: { text: `Complete this sentence: "${text}"` },
          maxTokens: 50
        }
      );

      setSuggestion(response.data.candidates[0].output);
    } catch (error) {
      console.error("Error fetching AI completion:", error);
    }
  };

  const handleInput = (e) => {
    setContent(e.target.innerText);
    fetchCompletion(e.target.innerText);
  };

  const handleKeyUp = (e) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setCursorPosition({ x: rect.left, y: rect.top + 25 });
  };

  return (
    <div style={{ position: "relative", width: "100%", padding: "10px" }}>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        style={{
          minHeight: "100px",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
        }}
      ></div>

      {suggestion && (
        <div
          style={{
            position: "absolute",
            top: cursorPosition.y,
            left: cursorPosition.x,
            background: "white",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {suggestion}
        </div>
      )}
    </div>
  );
};

export default AICursorAssistant;
