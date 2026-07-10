/**
 * Layer 1 — local heuristics. Instant, offline, zero-cost.
 * Each rule adds a weighted finding; the total score maps to a risk level.
 */
import type { HeuristicFinding, HeuristicReport, RiskLevel } from "./types";

/** Brands commonly impersonated in phishing campaigns. */
const POPULAR_BRANDS = [
  "google", "gmail", "youtube", "facebook", "instagram", "whatsapp",
  "amazon", "apple", "icloud", "microsoft", "outlook", "office365",
  "paypal", "netflix", "ebay", "chase", "wellsfargo", "bankofamerica",
  "coinbase", "binance", "dropbox", "linkedin", "twitter", "telegram",
];

const SUSPICIOUS_TLDS = [
  ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".xyz", ".club", ".work",
  ".zip", ".mov", ".click", ".link", ".loan", ".win", ".men", ".date",
  ".stream", ".racing", ".bid", ".rest",
];

/** Phrases typical for prize scams, fake virus alerts and tech-support scams. */
const SCAM_PHRASES: Array<{ re: RegExp; label: string; weight: number }> = [
  { re: /you (have )?w[oi]n|congratulations.*(prize|winner)|claim your (prize|reward)/i, label: "Fake prize claim ('you have won')", weight: 35 },
  { re: /your (computer|pc|device) (is|has been) (infected|compromised|blocked)/i, label: "Fake virus alert", weight: 45 },
  { re: /call (microsoft|apple|windows|amazon) (support|helpline)|toll[- ]?free.*(support|helpline)/i, label: "Tech-support scam phone number", weight: 45 },
  { re: /do not (close|restart|shut ?down) (this|your) (page|window|computer)/i, label: "Pressure not to close the page", weight: 30 },
  { re: /verify your (account|identity|payment)|account (has been |is )?(suspended|locked|limited)/i, label: "Account-suspension pressure", weight: 25 },
  { re: /(urgent|immediate) action required|within (24|48) hours|final (notice|warning)/i, label: "False urgency", weight: 20 },
  { re: /(social security|ssn|medicare) (number|benefits).*(suspend|expire|verify)/i, label: "Government-benefits scam", weight: 45 },
  { re: /gift ?card|itunes card|google play card.*(pay|payment|fine|fee)/i, label: "Gift-card payment request (classic scam)", weight: 40 },
  { re: /(bitcoin|crypto|usdt).*(double|guaranteed|profit|giveaway)/i, label: "Crypto giveaway/doubling scam", weight: 40 },
  { re: /remote (access|desktop)|install (anydesk|teamviewer|ultraviewer)/i, label: "Remote-access request", weight: 45 },
  { re: /(grandson|grandchild).*(arrested|hospital|bail)/i, label: "Family-emergency scam pattern", weight: 45 },
  { re: /refund.*(pending|owed|overcharged).*(bank|card|account)/i, label: "Fake refund scam", weight: 30 },
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

function checkUrl(url: URL, findings: HeuristicFinding[]) {
  const host = url.hostname.toLowerCase();

  // Raw IP address instead of a domain name
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    findings.push({ rule: "url.ip", detail: "The address is a raw IP number, not a real website name", weight: 35 });
  }

  // Punycode / homoglyph domains (аpple.com with cyrillic а → xn--...)
  if (host.includes("xn--")) {
    findings.push({ rule: "url.punycode", detail: "The address uses look-alike foreign characters to imitate a real site", weight: 45 });
  }

  // Suspicious TLD
  for (const tld of SUSPICIOUS_TLDS) {
    if (host.endsWith(tld)) {
      findings.push({ rule: "url.tld", detail: `Websites ending in "${tld}" are very often used for scams`, weight: 15 });
      break;
    }
  }

  // Excessive subdomains: paypal.com.secure-login.example.top
  const parts = host.split(".");
  if (parts.length >= 5) {
    findings.push({ rule: "url.subdomains", detail: "The address has an unusually long chain of dots — a common disguise", weight: 20 });
  }

  // Brand name buried in a subdomain of an unrelated domain
  const registrable = parts.slice(-2).join(".");
  for (const brand of POPULAR_BRANDS) {
    const inSub = parts.slice(0, -2).some((p) => p.includes(brand));
    if (inSub && !registrable.includes(brand)) {
      findings.push({ rule: "url.brand-subdomain", detail: `The address pretends to be "${brand}" but really belongs to ${registrable}`, weight: 45 });
      break;
    }
  }

  // Typosquatting on the registrable label: paypa1, gooogle, arnazon
  const label = parts.length >= 2 ? parts[parts.length - 2] : host;
  const LEGIT_COMPOUNDS = ["amazonaws", "googleapis", "googleusercontent", "googlesyndication", "microsoftonline", "windowsupdate", "whatsappbusiness"];
  for (const brand of POPULAR_BRANDS) {
    if (label === brand) break; // the real site
    const normalized = label.replace(/1/g, "l").replace(/0/g, "o").replace(/3/g, "e").replace(/-/g, "");
    const d = Math.min(levenshtein(label, brand), levenshtein(normalized, brand));
    if (d > 0 && d <= 2 && brand.length >= 5) {
      findings.push({ rule: "url.typosquat", detail: `The name "${label}" looks like a misspelling of "${brand}"`, weight: 45 });
      break;
    }
    // Brand buried inside an unrelated name: paypa1-verify, apple-support-id
    if (normalized.includes(brand) && !LEGIT_COMPOUNDS.includes(label.replace(/-/g, ""))) {
      findings.push({ rule: "url.brand-in-name", detail: `The name "${label}" uses "${brand}" but is not the real ${brand} website`, weight: 30 });
      break;
    }
  }

  // Credentials trick: https://paypal.com@evil.example
  if (url.username) {
    findings.push({ rule: "url.userinfo", detail: "The address hides the real destination behind an '@' sign", weight: 40 });
  }
}

function checkPage(doc: Document, url: URL, findings: HeuristicFinding[]) {
  const isLocalDemo = url.protocol === "file:";
  // Sensitive input fields on an insecure connection
  if (url.protocol === "http:" || isLocalDemo) {
    const sensitive = doc.querySelector(
      'input[type="password"], input[autocomplete*="cc-"], input[name*="card" i], input[name*="ssn" i]',
    );
    if (sensitive && url.protocol === "http:") {
      findings.push({ rule: "page.insecure-form", detail: "This page asks for a password or card number over an unprotected connection", weight: 45 });
    }
  }

  // Scam phrase scan over the visible text
  const text = (doc.body?.innerText ?? "").slice(0, 20000);
  for (const { re, label, weight } of SCAM_PHRASES) {
    if (re.test(text)) {
      findings.push({ rule: "page.phrase", detail: label, weight });
    }
  }

  // Countdown timers = manufactured urgency (dark pattern)
  const countdown = doc.querySelector('[class*="countdown" i], [id*="countdown" i], [class*="timer" i]');
  if (countdown && /(offer|expires|left|hurry|only)/i.test(text)) {
    findings.push({ rule: "page.countdown", detail: "A countdown timer pressures you to act without thinking", weight: 20 });
  }

  // Full-screen scare overlays typical for fake virus pages
  if (/(microsoft|windows) (defender|security)/i.test(text) && /(call|phone|helpline)/i.test(text)) {
    findings.push({ rule: "page.fake-alert", detail: "Pretends to be an official Microsoft/Windows security warning", weight: 45 });
  }
}

export function runHeuristics(doc: Document, href: string): HeuristicReport {
  const findings: HeuristicFinding[] = [];
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") checkUrl(url, findings);
    checkPage(doc, url, findings);
  } catch {
    // Unparseable URL — ignore
  }

  const score = Math.min(100, findings.reduce((s, f) => s + f.weight, 0));
  const level: RiskLevel = score >= 45 ? "dangerous" : score >= 20 ? "suspicious" : "safe";
  return { score, level, findings };
}
