import { useState, useEffect } from "react";
 
const BACKEND_URL = "https://mindforgeai.duckdns.org/ask";
 
// The single paper currently loaded. When you add live upload later,
// this becomes dynamic — for now it names what's actually ingested.
const LOADED_PAPER = {
  title: "PaLM: Scaling Language Modeling with Pathways",
  short: "the PaLM paper",
};
 
export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  // Start from the visitor's OS preference; the toggle can override it.
  const [dark, setDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
 
  // Reflect the theme on the root element so CSS variables switch.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);
 
  async function askQuestion() {
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setAnswer("");
    setErrored(false);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch {
      setErrored(true);
      setAnswer("The assistant is waking up or unreachable. Wait a few seconds and ask again.");
    }
    setLoading(false);
  }
 
  function onKeyDown(e) {
    // Enter to send, Shift+Enter for a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  }
 
  return (
    <>
      <style>{css}</style>
 
      <div className="mf-page">
        <header className="mf-top">
          <div className="mf-brand">
            <span className="mf-mark">MindForge</span>
            <span className="mf-tag">research assistant</span>
          </div>
          <button
            className="mf-theme"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? "Light" : "Dark"}
          </button>
        </header>
 
        <main className="mf-main">
          <div className="mf-lede">
            <h1 className="mf-h1">Ask the paper, not the internet.</h1>
            <p className="mf-sub">
              Loaded now: <em>{LOADED_PAPER.title}</em>. Ask about its
              architecture, training data, benchmarks, or parameter counts —
              answers come only from the paper, and it says so when the answer
              isn&rsquo;t there.
            </p>
          </div>
 
          <div className={`mf-ask ${loading ? "is-loading" : ""}`}>
            <textarea
              className="mf-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              spellCheck={false}
              placeholder="Ask your question here…"
            />
            <button
              className="mf-send"
              onClick={askQuestion}
              disabled={loading || !question.trim()}
            >
              {loading ? "Reading…" : "Ask"}
            </button>
          </div>
 
          {answer && (
            <div className={`mf-answer ${errored ? "is-error" : ""}`}>
              <div className="mf-answer-label">
                {errored ? "Not connected" : "From the paper"}
              </div>
              <p className="mf-answer-body">{answer}</p>
            </div>
          )}
 
          {!answer && !loading && (
            <div className="mf-hints">
              <span className="mf-hints-label">Try</span>
              {[
                "What dataset was PaLM trained on?",
                "How many parameters does PaLM have?",
                "What hardware was used for training?",
              ].map((h) => (
                <button key={h} className="mf-chip" onClick={() => setQuestion(h)}>
                  {h}
                </button>
              ))}
            </div>
          )}
        </main>
 
        <footer className="mf-foot">
          <span>Retrieval-augmented · grounded answers · built by hand</span>
        </footer>
      </div>
    </>
  );
}
 
const css = `
:root[data-theme="dark"] {
  --bg: #191917;
  --surface: #211f1d;
  --border: #34322e;
  --text: #ece9e3;
  --muted: #9a958c;
  --accent: #c96442;
  --accent-ink: #fff;
  --shadow: 0 1px 0 rgba(255,255,255,0.02), 0 12px 40px rgba(0,0,0,0.4);
}
:root[data-theme="light"] {
  --bg: #faf9f7;
  --surface: #ffffff;
  --border: #e7e3db;
  --text: #23211d;
  --muted: #7a746a;
  --accent: #be5237;
  --accent-ink: #fff;
  --shadow: 0 1px 2px rgba(30,25,20,0.04), 0 12px 32px rgba(30,25,20,0.06);
}
 
* { box-sizing: border-box; margin: 0; padding: 0; }
 
.mf-page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  font-family: ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif;
  transition: background .3s ease, color .3s ease;
}
 
.mf-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
}
.mf-brand { display: flex; align-items: baseline; gap: 10px; }
.mf-mark {
  font-family: ui-serif, Georgia, "Times New Roman", serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.mf-tag {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.mf-theme {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color .2s, color .2s;
}
.mf-theme:hover { color: var(--text); border-color: var(--muted); }
 
.mf-main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 28px 0;
}
 
.mf-lede { margin-bottom: 32px; }
.mf-h1 {
  font-family: ui-serif, Georgia, serif;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
}
.mf-sub {
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--muted);
  max-width: 60ch;
}
.mf-sub em { color: var(--text); font-style: italic; }
 
.mf-ask {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 8px 8px 8px 18px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  box-shadow: var(--shadow);
  transition: border-color .2s;
}
.mf-ask:focus-within { border-color: var(--accent); }
.mf-ask.is-loading { opacity: .85; }
 
.mf-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: var(--text);
  font-size: 16px;
  line-height: 1.5;
  font-family: inherit;
  padding: 12px 0;
  max-height: 200px;
}
.mf-input::placeholder { color: var(--muted); }
 
.mf-send {
  flex-shrink: 0;
  background: var(--accent);
  color: var(--accent-ink);
  border: none;
  border-radius: 11px;
  padding: 11px 20px;
  font-size: 14.5px;
  font-weight: 550;
  cursor: pointer;
  transition: opacity .2s, transform .05s;
}
.mf-send:hover:not(:disabled) { opacity: .9; }
.mf-send:active:not(:disabled) { transform: translateY(1px); }
.mf-send:disabled { opacity: .4; cursor: default; }
 
.mf-answer {
  margin-top: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px 24px;
  animation: rise .35s ease;
}
.mf-answer.is-error { border-color: #b4553f66; }
.mf-answer-label {
  font-size: 11.5px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
  font-weight: 600;
}
.mf-answer.is-error .mf-answer-label { color: #c96442; }
.mf-answer-body {
  font-size: 16.5px;
  line-height: 1.7;
  color: var(--text);
  white-space: pre-wrap;
}
 
.mf-hints {
  margin-top: 26px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.mf-hints-label {
  font-size: 12.5px;
  color: var(--muted);
  margin-right: 4px;
}
.mf-chip {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color .2s, color .2s;
  font-family: inherit;
}
.mf-chip:hover { color: var(--text); border-color: var(--muted); }
 
.mf-foot {
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 48px 28px 28px;
  font-size: 12.5px;
  color: var(--muted);
}
 
@keyframes rise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
 
@media (max-width: 560px) {
  .mf-h1 { font-size: 27px; }
  .mf-main { padding-top: 32px; }
  .mf-ask { flex-direction: column; align-items: stretch; padding: 14px; }
  .mf-send { width: 100%; padding: 12px; }
}
 
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
`;