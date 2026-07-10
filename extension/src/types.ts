/** Shared types between content script, background worker and popup. */

export type RiskLevel = "safe" | "suspicious" | "dangerous";

export interface HeuristicFinding {
  /** Stable rule id, e.g. "url.typosquat" */
  rule: string;
  /** Human-readable description of what triggered */
  detail: string;
  /** Contribution to the total risk score */
  weight: number;
}

export interface HeuristicReport {
  score: number;
  level: RiskLevel;
  findings: HeuristicFinding[];
}

/** Payload sent from the content script to the background worker for AI analysis. */
export interface AnalyzeRequest {
  kind: "analyze";
  url: string;
  title: string;
  /** Trimmed visible text of the page */
  textSample: string;
  /** What the local heuristics already found */
  heuristics: HeuristicReport;
}

/** AI verdict produced by Claude (structured output). */
export interface AiVerdict {
  risk: RiskLevel;
  /** One-sentence plain-language explanation for a non-technical person */
  explanation: string;
  /** One-sentence concrete advice: what should the person do right now */
  advice: string;
  /** Specific red flags the model spotted, short phrases */
  red_flags: string[];
}

export type AnalyzeResponse =
  | { ok: true; verdict: AiVerdict }
  | { ok: false; error: string };

export interface Settings {
  apiKey: string;
  /** Enable the Claude-powered second layer */
  aiEnabled: boolean;
  model: string;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  aiEnabled: true,
  model: "claude-opus-4-8",
};
