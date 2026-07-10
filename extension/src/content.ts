/**
 * Content script: runs local heuristics immediately, shows the banner,
 * then (optionally) upgrades the verdict with Claude via the background worker.
 */
import { runHeuristics } from "./heuristics";
import type { AiVerdict, AnalyzeRequest, AnalyzeResponse, HeuristicReport, RiskLevel } from "./types";

const BANNER_ID = "safesurf-banner";

const LEVEL_UI: Record<RiskLevel, { emoji: string; label: string; cls: string }> = {
  safe: { emoji: "✅", label: "This page looks safe", cls: "safesurf-safe" },
  suspicious: { emoji: "⚠️", label: "Be careful on this page", cls: "safesurf-warn" },
  dangerous: { emoji: "🛑", label: "DANGER — this looks like a scam", cls: "safesurf-danger" },
};

function renderBanner(level: RiskLevel, explanation: string, advice: string, aiPowered: boolean) {
  document.getElementById(BANNER_ID)?.remove();
  // Never nag on safe pages — only a brief, dismissible note if heuristics were borderline.
  if (level === "safe") return;

  const ui = LEVEL_UI[level];
  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.className = ui.cls;
  banner.innerHTML = `
    <div class="safesurf-row">
      <span class="safesurf-emoji">${ui.emoji}</span>
      <div class="safesurf-texts">
        <div class="safesurf-title">${ui.label}</div>
        <div class="safesurf-explain"></div>
        <div class="safesurf-advice"></div>
      </div>
      <button class="safesurf-close" title="Hide this warning">✕</button>
    </div>
    <div class="safesurf-footer">${aiPowered ? "Checked by SafeSurf AI" : "SafeSurf quick check"}</div>
  `;
  // textContent to avoid injecting model/page text as HTML
  (banner.querySelector(".safesurf-explain") as HTMLElement).textContent = explanation;
  (banner.querySelector(".safesurf-advice") as HTMLElement).textContent = "👉 " + advice;
  banner.querySelector(".safesurf-close")!.addEventListener("click", () => banner.remove());
  document.documentElement.appendChild(banner);
}

function heuristicExplanation(report: HeuristicReport): { explanation: string; advice: string } {
  const top = [...report.findings].sort((a, b) => b.weight - a.weight).slice(0, 2);
  const explanation = top.map((f) => f.detail).join(". ") + ".";
  const advice =
    report.level === "dangerous"
      ? "Close this page. Do not enter any passwords, card numbers or call any phone numbers from it."
      : "Take your time. Do not enter personal details unless you are sure this is the right website.";
  return { explanation, advice };
}

async function main() {
  const report = runHeuristics(document, location.href);

  // 1) Instant verdict from heuristics
  if (report.level !== "safe") {
    const { explanation, advice } = heuristicExplanation(report);
    renderBanner(report.level, explanation, advice, false);
  }

  // 2) AI upgrade — only when there is something worth double-checking
  if (report.level === "safe" && report.findings.length === 0) return;

  const textSample = (document.body?.innerText ?? "").replace(/\s+/g, " ").slice(0, 4000);
  const request: AnalyzeRequest = {
    kind: "analyze",
    url: location.href,
    title: document.title,
    textSample,
    heuristics: report,
  };

  try {
    const response = (await chrome.runtime.sendMessage(request)) as AnalyzeResponse;
    if (response?.ok) {
      const v: AiVerdict = response.verdict;
      renderBanner(v.risk, v.explanation, v.advice, true);
    }
    // On AI failure we silently keep the heuristic banner — fail-safe.
  } catch {
    /* background not reachable (e.g. extension reloaded) — keep heuristic banner */
  }
}

void main();
