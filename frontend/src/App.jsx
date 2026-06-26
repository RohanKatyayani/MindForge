import { useState } from "react";

function App() {
  // ---- STATE: the data that can change ----
  const [question, setQuestion] = useState("");   // what the user types
  const [answer, setAnswer] = useState("");       // what comes back from /ask
  const [loading, setLoading] = useState(false);  // "thinking..." flag

  // ---- THE PART YOU OWN: calling your backend ----
  async function askQuestion() {
    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      setAnswer("Error: could not reach the backend.");
    }
    setLoading(false);
  }

  // ---- JSX: what gets drawn on screen ----
  return (
    <div style={{ maxWidth: "600px", margin: "60px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>🧠 MindForge</h1>
      <p style={{ color: "#666" }}>Ask a question about your ingested papers.</p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="How many parameters does PaLM have?"
        rows={3}
        style={{ width: "100%", padding: "12px", fontSize: "16px", boxSizing: "border-box" }}
      />

      <button
        onClick={askQuestion}
        disabled={loading}
        style={{ marginTop: "12px", padding: "10px 24px", fontSize: "16px", cursor: "pointer" }}
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {answer && (
        <div style={{ marginTop: "24px", padding: "16px", background: "#f4f4f4", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
          {answer}
        </div>
      )}
    </div>
  );
}

export default App;