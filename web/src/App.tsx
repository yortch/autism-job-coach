import React, { useEffect, useReducer, useRef } from "react";
import {
  getScenarios,
  postDecode,
  type DecodeResponse,
  type Scenario,
} from "./lib/api";

/* ---------- state ---------- */
type State = {
  scenarios: Scenario[];
  scenariosError: string | null;
  scenarioId: string;
  text: string;
  decoding: boolean;
  result: DecodeResponse | null;
  decodeError: string | null;
};

type Action =
  | { type: "SET_SCENARIOS"; scenarios: Scenario[] }
  | { type: "SCENARIOS_ERROR"; msg: string }
  | { type: "SET_SCENARIO"; id: string }
  | { type: "SET_TEXT"; text: string }
  | { type: "DECODE_START" }
  | { type: "DECODE_OK"; result: DecodeResponse }
  | { type: "DECODE_ERROR"; msg: string };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "SET_SCENARIOS":
      return {
        ...s,
        scenarios: a.scenarios,
        scenarioId: a.scenarios[0]?.id ?? "",
      };
    case "SCENARIOS_ERROR":
      return { ...s, scenariosError: a.msg };
    case "SET_SCENARIO":
      return { ...s, scenarioId: a.id };
    case "SET_TEXT":
      return { ...s, text: a.text };
    case "DECODE_START":
      return { ...s, decoding: true, result: null, decodeError: null };
    case "DECODE_OK":
      return { ...s, decoding: false, result: a.result };
    case "DECODE_ERROR":
      return { ...s, decoding: false, decodeError: a.msg };
  }
}

const initial: State = {
  scenarios: [],
  scenariosError: null,
  scenarioId: "",
  text: "",
  decoding: false,
  result: null,
  decodeError: null,
};

/* ---------- component ---------- */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getScenarios()
      .then((s) => dispatch({ type: "SET_SCENARIOS", scenarios: s }))
      .catch((e: unknown) =>
        dispatch({
          type: "SCENARIOS_ERROR",
          msg: e instanceof Error ? e.message : String(e),
        })
      );
  }, []);

  async function handleDecode(e: React.FormEvent) {
    e.preventDefault();
    if (!state.scenarioId || !state.text.trim()) return;
    dispatch({ type: "DECODE_START" });
    try {
      const result = await postDecode({
        scenarioId: state.scenarioId,
        text: state.text.trim(),
      });
      dispatch({ type: "DECODE_OK", result });
    } catch (err) {
      dispatch({
        type: "DECODE_ERROR",
        msg: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Autism Job Coach</h1>
      <p style={styles.subtitle}>Paste a manager's message and tap Decode.</p>

      <form onSubmit={handleDecode} style={styles.form} noValidate>
        {/* Scenario picker */}
        <label htmlFor="scenario" style={styles.label}>
          Scenario
        </label>
        {state.scenariosError ? (
          <p role="alert" style={styles.error}>
            Could not load scenarios: {state.scenariosError}
          </p>
        ) : (
          <select
            id="scenario"
            style={styles.select}
            value={state.scenarioId}
            onChange={(e) =>
              dispatch({ type: "SET_SCENARIO", id: e.target.value })
            }
            disabled={state.scenarios.length === 0}
          >
            {state.scenarios.length === 0 ? (
              <option value="">Loading…</option>
            ) : (
              state.scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))
            )}
          </select>
        )}

        {/* Manager phrase input */}
        <label htmlFor="phrase" style={styles.label}>
          Manager's message
        </label>
        <textarea
          id="phrase"
          ref={textRef}
          style={styles.textarea}
          rows={4}
          placeholder="Type or paste the message here…"
          value={state.text}
          onChange={(e) => dispatch({ type: "SET_TEXT", text: e.target.value })}
        />

        {/* Decode button */}
        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: state.decoding ? 0.7 : 1,
            cursor: state.decoding ? "not-allowed" : "pointer",
          }}
          disabled={state.decoding || !state.scenarioId || !state.text.trim()}
          aria-busy={state.decoding}
        >
          {state.decoding ? "Decoding…" : "Decode"}
        </button>
      </form>

      {/* Error */}
      {state.decodeError && (
        <p role="alert" style={styles.error}>
          Error: {state.decodeError}
        </p>
      )}

      {/* Raw result */}
      {state.result && (
        <section aria-label="Decode result" style={styles.resultSection}>
          <h2 style={styles.h2}>Result</h2>
          <pre style={styles.pre}>{JSON.stringify(state.result, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}

/* ---------- inline styles (minimal, readable, large targets) ---------- */
const styles = {
  main: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "2rem 1.25rem 4rem",
  },
  h1: {
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "0.25rem",
  },
  h2: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#555",
    marginTop: 0,
    marginBottom: "2rem",
  },
  form: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  label: {
    fontWeight: 600,
    marginBottom: "-0.25rem",
  },
  select: {
    fontSize: "1rem",
    padding: "0.75rem 1rem",
    minHeight: "48px",
    borderRadius: "6px",
    border: "2px solid #aaa",
    background: "#fff",
    width: "100%",
  },
  textarea: {
    fontSize: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    border: "2px solid #aaa",
    width: "100%",
    resize: "vertical" as const,
    minHeight: "120px",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  button: {
    fontSize: "1.125rem",
    fontWeight: 700,
    padding: "0.875rem 2rem",
    minHeight: "56px",
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    width: "100%",
  },
  error: {
    color: "#c0392b",
    fontWeight: 600,
    marginTop: "0.5rem",
  },
  resultSection: {
    marginTop: "2rem",
  },
  pre: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "1rem",
    overflowX: "auto" as const,
    fontSize: "0.9rem",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
} as const;
