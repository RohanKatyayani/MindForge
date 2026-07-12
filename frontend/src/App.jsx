import { useState, useEffect, useRef, useCallback } from "react";
 
const BACKEND_URL = "https://mindforgeai.duckdns.org/ask";
 
const LOADED_PAPER = {
  title: "PaLM: Scaling Language Modeling with Pathways",
};
 
const SAMPLES = [
  "What dataset was PaLM trained on?",
  "How many parameters does PaLM have?",
  "What hardware was used for training?",
  "Summarise the main result.",
];
 
let WORD_SEQ = 0;
function toWords(text) {
  return text.split(/(\s+)/).map((w) => ({ id: WORD_SEQ++, text: w }));
}
 
export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [shownAnswer, setShownAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [board, setBoard] = useState("chalk");
  const isChalk = board === "chalk";
 
  const [qWords, setQWords] = useState([]);
  const [aWords, setAWords] = useState([]);
  const [erased, setErased] = useState(() => new Set());
 
  useEffect(() => {
    document.documentElement.setAttribute("data-board", board);
  }, [board]);
 
  async function askQuestion(qOverride) {
    const q = (qOverride ?? question).trim();
    if (!q || loading) return;
    setLoading(true);
    setAnswer("");
    setShownAnswer("");
    setAWords([]);
    setErrored(false);
    setQWords(toWords(q));
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setAnswer(data.answer || "");
    } catch {
      setErrored(true);
      setAnswer("The board is out of reach for a moment. Wait a few seconds and ask again.");
    }
    setLoading(false);
  }
 
  useEffect(() => {
    if (!answer) return;
    setShownAnswer("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShownAnswer(answer.slice(0, i));
      if (i >= answer.length) {
        clearInterval(id);
        setAWords(toWords(answer));
      }
    }, 18);
    return () => clearInterval(id);
  }, [answer]);
 
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  }
 
  const [dusterPos, setDusterPos] = useState({ x: 28, y: null });
  const [dragging, setDragging] = useState(false);
  const dusterRef = useRef(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const frameRef = useRef(null);
 
  const eraseUnder = useCallback(() => {
    const d = dusterRef.current;
    if (!d) return;
    const r = d.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const rx = r.width / 2;
    const ry = r.height / 2;
    const hits = [];
    document.querySelectorAll("[data-word]").forEach((el) => {
      const wr = el.getBoundingClientRect();
      const wcx = wr.left + wr.width / 2;
      const wcy = wr.top + wr.height / 2;
      if (Math.abs(wcx - cx) < rx + wr.width / 2 && Math.abs(wcy - cy) < ry + wr.height / 2) {
        hits.push(Number(el.getAttribute("data-word")));
      }
    });
    if (hits.length) {
      setErased((prev) => {
        const next = new Set(prev);
        hits.forEach((h) => next.add(h));
        return next;
      });
    }
  }, []);
 
  function onDusterDown(e) {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const r = dusterRef.current.getBoundingClientRect();
    dragOffset.current = { dx: clientX - r.left, dy: clientY - r.top };
    setDragging(true);
  }
 
  useEffect(() => {
    if (!dragging) return;
    function move(e) {
      if (e.cancelable) e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const fx = frameRef.current.getBoundingClientRect();
      setDusterPos({
        x: clientX - dragOffset.current.dx - fx.left,
        y: clientY - dragOffset.current.dy - fx.top,
      });
      eraseUnder();
    }
    function up() {
      setDragging(false);
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, eraseUnder]);
 
  const dusterStyle =
    dusterPos.y === null
      ? { left: dusterPos.x, bottom: 14 }
      : { left: dusterPos.x, top: dusterPos.y };
 
  const boardWritten = qWords.length > 0 || aWords.length > 0;
 
  function resetBoard() {
    setQWords([]);
    setAWords([]);
    setErased(new Set());
    setQuestion("");
    setAnswer("");
    setShownAnswer("");
    setErrored(false);
  }
 
  return (
    <>
      <style>{css}</style>
 
      <div className="wall">
        <div className="frame" ref={frameRef}>
          <div className="board">
            <div className="board-inner">
            <header className="bd-top">
              <div className="brand">
                <span className="mark">MindForge</span>
                <span className="tag">research assistant</span>
              </div>
              <button className="flip" onClick={() => setBoard(isChalk ? "white" : "chalk")}>
                {isChalk ? "Whiteboard" : "Chalkboard"}
              </button>
            </header>
 
            <div className="eyebrow">On the board —</div>
            <div className="paper-title">{LOADED_PAPER.title}</div>
 
            <h1 className="hero">Ask the paper,<br />not the internet.</h1>
            <p className="lede">
              Every answer is written straight from the loaded paper —
              architecture, training data, benchmarks, parameters. No paper,
              no answer.
            </p>
 
            {qWords.length === 0 && (
              <div className="ask-row">
                <textarea
                  className="ask"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  spellCheck={false}
                  placeholder="write your question…"
                />
                <button
                  className="ask-btn"
                  onClick={() => askQuestion()}
                  disabled={loading || !question.trim()}
                >
                  {loading ? "…" : "Ask"}
                </button>
              </div>
            )}
 
            {qWords.length > 0 && (
              <div className="written">
                <div className="written-label">question</div>
                <p className="written-body">
                  {qWords.map((w) => (
                    <span key={w.id} data-word={w.id} className={`word ${erased.has(w.id) ? "gone" : ""}`}>
                      {w.text}
                    </span>
                  ))}
                </p>
              </div>
            )}
 
            {shownAnswer && aWords.length === 0 && (
              <div className={`answer ${errored ? "err" : ""}`}>
                <div className="answer-label">{errored ? "hmm" : "answer"}</div>
                <p className="answer-body">
                  {shownAnswer}
                  {shownAnswer.length < answer.length && <span className="cursor">▍</span>}
                </p>
              </div>
            )}
            {aWords.length > 0 && (
              <div className={`answer ${errored ? "err" : ""}`}>
                <div className="answer-label">{errored ? "hmm" : "answer"}</div>
                <p className="answer-body">
                  {aWords.map((w) => (
                    <span key={w.id} data-word={w.id} className={`word ${erased.has(w.id) ? "gone" : ""}`}>
                      {w.text}
                    </span>
                  ))}
                </p>
                {!errored && <div className="underline" />}
              </div>
            )}
 
            {boardWritten && !loading && (
              <button className="again" onClick={resetBoard}>← ask another</button>
            )}
 
            {!boardWritten && !loading && (
              <div className="chips">
                <span className="chips-label">Try</span>
                {SAMPLES.map((s) => (
                  <button key={s} className="chip" onClick={() => setQuestion(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>
 
          {/* free-floating top-view duster, positioned within the frame */}
          <div
            ref={dusterRef}
            className={`duster ${dragging ? "grab" : ""}`}
            style={dusterStyle}
            onMouseDown={onDusterDown}
            onTouchStart={onDusterDown}
            title="Drag me over the writing to rub it out"
          >
            <span className="duster-pad" />
          </div>
        </div>
 
        <div className="hint">pick up the {isChalk ? "duster" : "eraser"} and rub out what you like</div>
      </div>
    </>
  );
}
 
const css = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Inter:wght@400;500&display=swap');
 
:root[data-board="chalk"] {
  --wall: #b3ab9c; --wall-2: #a59d8d;
  --board: #2a322f; --board-2: #232a27;
  --ink: #f2efe6; --ink-soft: #b7c0ba; --ink-faint: #8fa39a; --line: #4a534f;
  --q-color: #eae7dd; --a-color: #f4f1e8; --a-accent: #e8d98a; --underline: #d98a8a;
  --btn-bg: #f2efe6; --btn-ink: #2a322f;
  --frame-a: #8a6b45; --frame-b: #6f5236;
  --pad-a: #8a683f; --pad-b: #6b4f30; --felt: #4d5b57;
  --glow: 0 0 3px rgba(255,255,255,0.12);
}
:root[data-board="white"] {
  --wall: #cfcabd; --wall-2: #c2bcae;
  --board: #f7f7f4; --board-2: #ffffff;
  --ink: #1a1a18; --ink-soft: #55554e; --ink-faint: #8a8a82; --line: #dcdcd4;
  --q-color: #1f57c4; --a-color: #1a1a18; --a-accent: #1a8a4a; --underline: #d23b3b;
  --btn-bg: #1a1a18; --btn-ink: #ffffff;
  --frame-a: #9a9a90; --frame-b: #7f7f75;
  --pad-a: #7a5c3c; --pad-b: #5f4630; --felt: #4a5568;
  --glow: none;
}
 
* { box-sizing: border-box; margin: 0; padding: 0; }
 
html, body, #root { width: 100%; min-height: 100vh; margin: 0; padding: 0; background: var(--wall); }
 
.wall {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, var(--wall), var(--wall-2));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4vh 4vw;
  font-family: 'Inter', ui-sans-serif, sans-serif;
  transition: background .4s ease;
}
 
.frame {
  position: relative;
  width: 100%;
  max-width: 1100px;
  background: linear-gradient(145deg, var(--frame-a), var(--frame-b));
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 22px 50px rgba(0,0,0,0.4),
              inset 0 2px 4px rgba(255,255,255,0.22),
              inset 0 -4px 8px rgba(0,0,0,0.35);
}
 
.board {
  background: var(--board);
  border-radius: 6px;
  padding: 44px 56px 38px;
  color: var(--ink);
  box-shadow: inset 0 0 130px rgba(0,0,0,0.45);
  transition: background .4s ease, color .4s ease;
  min-height: 74vh;
}
 
.board-inner { max-width: 820px; margin: 0 auto; }
 
.bd-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.brand { display: flex; align-items: baseline; gap: 12px; }
.mark { font-family: 'Caveat', cursive; font-size: 34px; font-weight: 700; color: var(--ink); text-shadow: var(--glow); line-height: 1; }
.tag { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint); }
.flip { background: transparent; border: 1px solid var(--line); color: var(--ink-soft); border-radius: 22px; padding: 7px 16px; font-size: 13px; cursor: pointer; font-family: inherit; transition: border-color .2s, color .2s; }
.flip:hover { color: var(--ink); border-color: var(--ink-faint); }
 
.eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 10px; }
.paper-title { font-family: 'Caveat', cursive; font-size: 24px; color: var(--ink-soft); margin-bottom: 28px; text-shadow: var(--glow); }
 
.hero { font-family: 'Caveat', cursive; font-size: 54px; line-height: 1.02; font-weight: 700; color: var(--ink); text-shadow: var(--glow); margin-bottom: 16px; letter-spacing: 0.005em; }
.lede { font-size: 15px; line-height: 1.75; color: var(--ink-soft); max-width: 54ch; margin-bottom: 32px; }
 
.ask-row { border: 1.5px dashed var(--line); border-radius: 12px; background: var(--board-2); padding: 6px 6px 6px 22px; display: flex; align-items: center; gap: 12px; }
.ask-row:focus-within { border-color: var(--ink-faint); border-style: solid; }
.ask { flex: 1; background: transparent; border: none; outline: none; resize: none; color: var(--q-color); font-family: 'Caveat', cursive; font-size: 24px; line-height: 1.4; padding: 12px 0; text-shadow: var(--glow); }
.ask::placeholder { color: var(--ink-faint); opacity: .7; }
.ask-btn { flex-shrink: 0; background: var(--btn-bg); color: var(--btn-ink); border: none; border-radius: 9px; padding: 12px 26px; font-family: 'Caveat', cursive; font-size: 22px; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .05s; }
.ask-btn:hover:not(:disabled) { opacity: .9; }
.ask-btn:active:not(:disabled) { transform: translateY(1px); }
.ask-btn:disabled { opacity: .4; cursor: default; }
 
.written { margin-top: 4px; }
.written-label, .answer-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 12px; }
.written-label { color: var(--ink-faint); }
.written-body { font-family: 'Caveat', cursive; font-size: 26px; line-height: 1.5; color: var(--q-color); text-shadow: var(--glow); }
 
.answer { margin-top: 28px; }
.answer-label { color: var(--a-accent); }
.answer-body { font-family: 'Caveat', cursive; font-size: 30px; line-height: 1.5; color: var(--a-color); text-shadow: var(--glow); min-height: 1.5em; }
.cursor { animation: blink 1s step-end infinite; color: var(--a-accent); }
 
.word { transition: opacity .25s ease, filter .25s ease, transform .25s ease; display: inline; }
.word.gone { opacity: 0; filter: blur(4px); transform: translateY(2px) scale(.96); }
 
.underline { height: 3px; width: 55%; max-width: 340px; background: var(--underline); opacity: .65; margin-top: 14px; border-radius: 2px; animation: draw .5s ease forwards; transform-origin: left; }
 
.again { margin-top: 26px; background: transparent; border: 1px solid var(--line); color: var(--ink-soft); border-radius: 20px; padding: 8px 18px; font-family: 'Caveat', cursive; font-size: 19px; cursor: pointer; transition: border-color .2s, color .2s; }
.again:hover { color: var(--ink); border-color: var(--ink-faint); }
 
.chips { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.chips-label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint); margin-right: 4px; }
.chip { background: transparent; border: 1px solid var(--line); color: var(--ink-soft); border-radius: 20px; padding: 8px 16px; font-family: 'Caveat', cursive; font-size: 18px; cursor: pointer; transition: border-color .2s, color .2s; }
.chip:hover { color: var(--ink); border-color: var(--ink-faint); }
 
/* top-view duster: a wooden block seen from above with a felt pad */
.duster {
  position: absolute;
  left: 28px;
  bottom: 14px;
  width: 104px;
  height: 56px;
  cursor: grab;
  border-radius: 7px;
  background: linear-gradient(145deg, var(--pad-a), var(--pad-b));
  box-shadow: 0 8px 18px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.2);
  padding: 9px;
  user-select: none;
  touch-action: none;
  z-index: 60;
}
.duster.grab { cursor: grabbing; }
.duster-pad {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: var(--felt);
  box-shadow: inset 0 0 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.12);
}
 
.hint { margin-top: 16px; font-size: 12px; letter-spacing: 0.05em; color: rgba(60,50,40,0.55); }
 
@keyframes blink { 50% { opacity: 0; } }
@keyframes draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
 
@media (max-width: 640px) {
  .wall { padding: 20px 12px; }
  .frame { padding: 10px; }
  .board { padding: 26px 22px 22px; min-height: 68vh; }
  .hero { font-size: 40px; }
  .mark { font-size: 28px; }
  .ask-row { flex-direction: column; align-items: stretch; padding: 14px; }
  .ask-btn { width: 100%; padding: 10px; }
  .duster { width: 88px; height: 48px; }
}
 
@media (prefers-reduced-motion: reduce) {
  .word { transition: opacity .15s ease; }
  * { animation-duration: .01ms !important; }
}
`;