# 🛡️ SafeSurf — AI Scam Shield for Seniors

**Brainwave 2026 hackathon project.** A Chrome extension that protects elderly,
non-technical people from online scams — phishing, fake virus alerts,
tech-support scams, prize scams and manipulative dark patterns — and explains
the danger in **plain, friendly language** instead of technical jargon.

> Every year seniors lose **$3.4B+ to online fraud** (FBI IC3). Existing
> blockers say "Blocked: ERR_PHISHING_DETECTED". SafeSurf says:
> *"This page pretends to be your bank. Close it and don't type your password."*

## How it works

Two detection layers:

1. **Instant local heuristics** (offline, private, zero-cost):
   - URL analysis: typosquatting (`paypa1.com`), look-alike punycode domains,
     brand-in-subdomain tricks (`paypal.com.evil.xyz`), raw IPs, scammy TLDs
   - Page analysis: scam phrases (fake prizes, fake virus alerts, tech-support
     phone numbers, gift-card payments, remote-access requests), countdown-timer
     dark patterns, card/password fields on insecure connections
2. **AI verdict (Claude)**: page context + heuristic findings go to the
   Claude API (structured outputs) → a decisive verdict with a one-sentence
   explanation and one concrete action, written for a 75-year-old.

The verdict is shown as a big, high-contrast **traffic-light banner**
(🛑 danger / ⚠️ caution) with large fonts designed for older eyes.

## Repo layout

```
extension/    Chrome MV3 extension (TypeScript + esbuild + @anthropic-ai/sdk)
demo-sites/   Fake scam pages for the demo (open as file:// or serve locally)
pitch/        Pitch deck (≤10 slides, per hackathon rules)
```

## Run it

```bash
cd extension
npm install
npm run build
```

1. Open `chrome://extensions`, enable **Developer mode**, click
   **Load unpacked**, select `extension/dist/`.
2. Click the SafeSurf icon → paste your Anthropic API key → Save.
3. Open any page in `demo-sites/` (e.g. `fake-virus.html`) — watch the banner.

Without an API key the extension still works using the heuristic layer only.

## Privacy

- The API key is stored only in the user's own browser (`chrome.storage.sync`).
- Page text is sent to the Claude API **only** when heuristics flag something
  suspicious — normal browsing never leaves the machine.
