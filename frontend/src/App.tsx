import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse("");
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("http://localhost:3000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
        signal: abortControllerRef.current.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setResponse((prev) => prev + parsed.content);
              }
              if (parsed.error) {
                setResponse(parsed.error);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setResponse("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <div className="app-container">
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter your coding question here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
        <div className="response-container">
          <h2>HackGPT's Response:</h2>
          <p className={response ? "response-text" : "placeholder-text"}>
            {response || "Waiting for your question..."}
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
