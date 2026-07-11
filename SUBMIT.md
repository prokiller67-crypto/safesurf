# 🛡️ SafeSurf — Submission Kit (Brainwave 2026)

> Этот файл — всё, что нужно для сабмита. Продукт **готов и работает end-to-end**,
> осталось: записать видео (~15 мин) и заполнить форму на Devpost (~10 мин).
> **Дедлайн: 10 августа 2026, 2:30 AM IST** (= 9 августа ~21:00 UTC — не тяни до последнего часа).

---

## 0. Состояние проекта (если читаешь из новой сессии)

| Что | Где | Статус |
|---|---|---|
| Расширение Chrome MV3 | `extension/` (сборка: `cd extension && npm install && npm run build` → `dist/`) | ✅ готово |
| Слой 1: эвристики | `extension/src/heuristics.ts` | ✅ протестировано |
| Слой 2: AI-вердикт | `extension/src/background.ts` — без ключа идёт в hosted endpoint, с ключом — напрямую в Anthropic (Opus) | ✅ протестировано вживую |
| Hosted endpoint | `site/api/analyze.js` → https://safesurf-blush.vercel.app/api/analyze (Haiku 4.5, rate-limit 30/час/IP, 2000/день) | ✅ в проде, ключ в Vercel env (Production, Encrypted) |
| Лендинг + демо-страницы | `site/` → **https://safesurf-blush.vercel.app** | ✅ в проде |
| GitHub (публичный) | **https://github.com/prokiller67-crypto/safesurf** | ✅ запушено |
| Питч-дек | `pitch/deck.html` → PDF `pitch/SafeSurf-Brainwave2026.pdf` (10 слайдов, 364KB) | ✅ готов |
| Демо-видео | — | ⬜ записать (сценарий ниже) |
| Devpost-форма | https://brainwaves.devpost.com/ | ⬜ заполнить (тексты ниже) |

Технические заметки для новой сессии:
- Vercel: аккаунт `prokiller67` / team `virtbasket-9565s-projects`, проект `safesurf`, папка `site/` слинкована (`site/.vercel/`). Деплой: `cd site && vercel deploy --prod --yes`.
- Anthropic-ключ: `extension/.env.local` (gitignored) — оригинал в `~/Projects/Build_Beyond_Hackathon/chalk/.env.local`.
- PDF перегенерация: `cd pitch && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf=SafeSurf-Brainwave2026.pdf "file://$PWD/deck.html"`.
- Быстрый тест hosted endpoint: см. §4.

---

## 1. Демо-видео — сценарий (90 секунд)

**Подготовка:** установи расширение (`chrome://extensions` → Developer mode → Load unpacked → `extension/dist/`). Ключ вводить НЕ надо — работает hosted-режим. Открой заранее вкладки: лендинг, три демо, nytimes.com. Запись: QuickTime → New Screen Recording (или Cmd+Shift+5), микрофон включи. Говорить можно по-английски по титрам ниже или просто без слов — с музыкой.

| Время | Действие на экране | Голос / титр |
|---|---|---|
| 0:00–0:10 | Лендинг safesurf-blush.vercel.app, медленный скролл hero | "Seniors lose billions to online scams every year. Not because scams are undetectable — because warnings speak jargon." |
| 0:10–0:25 | Открой `demo/fake-virus.html` → красный баннер 🛑 выезжает сверху | "This is SafeSurf. A fake Microsoft virus alert — caught instantly. No jargon: plain words and one action: close the page." |
| 0:25–0:40 | Открой `demo/fake-prize.html` → баннер. Наведи курсор на red flags | "A prize scam with a fake countdown. SafeSurf explains exactly what's fake — in language a 75-year-old understands." |
| 0:40–0:55 | Открой `demo/phishing-bank.html` → баннер | "A pixel-perfect PayPal clone. Local heuristics flag it in 50 milliseconds, then Claude AI confirms and explains." |
| 0:55–1:10 | Открой nytimes.com (или другой сайт с подписочным баннером/таймером) — **тишина, баннера нет** | "And on real websites? Silence. SafeSurf's AI even overrides heuristic false alarms — it never cries wolf." |
| 1:10–1:25 | Popup расширения (клик по иконке): чекбокс Cloud + опциональный ключ | "Zero setup: install and it works. Power users can bring their own key." |
| 1:25–1:30 | Финал: лендинг, титр | "SafeSurf. The scam shield for the people you love. — Brainwave 2026" |

Загрузи на YouTube (unlisted достаточно) → ссылку в Devpost.

**Запасной вариант без микрофона:** запиши только экран по той же последовательности, титры Devpost возьмёт из описания.

---

## 2. Devpost — тексты формы (копипасть как есть)

**Project name:** `SafeSurf — AI Scam Shield for Seniors`

**Elevator pitch (tagline):**
```
A Chrome extension that catches phishing, fake virus alerts and scam pages in real time — and explains the danger in plain, friendly language a 75-year-old actually understands. Zero setup: local heuristics + Claude AI verdict out of the box.
```

**Links:**
- Try it out / Website: `https://safesurf-blush.vercel.app`
- Repository: `https://github.com/prokiller67-crypto/safesurf`
- Video: *(ссылка на YouTube после записи)*
- Presentation/Pitch deck: приложи файл `pitch/SafeSurf-Brainwave2026.pdf`

**Built with (теги):** `typescript`, `chrome-extension`, `anthropic`, `claude`, `vercel`, `serverless`, `esbuild`, `cybersecurity`, `accessibility`

**About the project (полное описание):**
```markdown
## Inspiration

Americans over 60 lost $4.8 billion to online fraud in 2024 (FBI IC3) — the fastest-growing group of victims, losing ~4× more per incident than people under 30. The uncomfortable truth: detection isn't the gap. Communication is. Security tools say "NET::ERR_CERT_AUTHORITY_INVALID" — and a scared senior clicks "Continue anyway". We built the tool we wish our own grandparents had.

## What it does

SafeSurf is a Chrome extension that watches every page and shows a big, high-contrast traffic-light banner the moment something is wrong:

🛑 **"This page pretends to be your bank. Close it and don't type your password. If unsure, call your family."**

No jargon — ever. One plain-language explanation, one concrete action, huge type designed for older eyes. On safe pages: total silence.

## How we built it

**Two detection layers, fail-safe by design:**

1. **Local heuristics (instant, offline, private):** typosquatting (paypa1.com), look-alike unicode domains, brand-in-address tricks (paypal.com.evil.xyz), 12 scam-script patterns (fake prizes, fake virus alerts, tech-support phone numbers, gift-card payments, remote-access requests), dark patterns (countdown timers, "do not close this window"), card/password fields on insecure connections. Verdict in <50 ms.
2. **Claude AI second opinion:** fires only when Layer 1 flags something. Claude receives the URL, page text and heuristic evidence, and returns a schema-validated structured verdict (risk / explanation / advice / red flags) written for a non-technical senior. Page text is fenced as untrusted content to resist prompt injection.

**Zero setup:** the extension ships with SafeSurf Cloud — a rate-limited Vercel serverless proxy (Claude Haiku 4.5) — so it works out of the box. Power users can plug in their own Anthropic key (then analysis runs with Claude Opus directly from the browser; the key never leaves their machine).

**Stack:** Chrome Manifest V3, TypeScript, esbuild, official Anthropic SDK with structured outputs, Vercel serverless functions. Even the typography is mission-driven: body text is Atkinson Hyperlegible, a typeface designed for low-vision readers.

## Challenges we ran into

- **False positives are as harmful as misses** — scaring a senior off their real bank teaches them to ignore warnings. Our fix: the AI layer can override heuristic false alarms (a news site's subscription countdown triggers the heuristic, and Claude correctly rules it safe).
- **Making an LLM decisive.** Default LLM behavior hedges ("this might be suspicious…"). We prompt-engineered for decisiveness and constrained the output with a JSON schema so the banner always gets exactly one risk level, ≤2-sentence explanation, and one action.
- **Trust boundary:** scam pages could try to prompt-inject the analyzer, so page text is explicitly fenced as untrusted content.

## Accomplishments that we're proud of

- End-to-end working product: extension + hosted AI + live demo site, all deployed and testable by judges in under a minute — no API key required.
- The NYT test: heuristics raise a false alarm on a subscription countdown, and the AI layer correctly overrides it. Both layers doing their job.
- Accessibility as the product, not a feature: plain language, huge type, a low-vision typeface, silence on safe pages.

## What we learned

Security UX for non-technical users is a translation problem. The same detection wrapped in human words changes behavior: "fake website" works where "phishing domain" fails.

## What's next for SafeSurf

- **Family Guardian dashboard:** gentle alerts to a trusted contact on "danger" events ("Mom just opened a fake bank page")
- Multilingual verdicts (ES, RU, HI…), Firefox/Edge ports
- Email & SMS scam scanning; on-device small model for a zero-cloud mode
- Partnerships with banks and senior-care organizations

**Unit economics scale:** heuristics are free; AI calls happen only on flagged pages (<2% of browsing) — pennies per user per month.
```

**Try-it-out инструкция для судей (если форма спросит):**
```
1. Open https://safesurf-blush.vercel.app — live demos work in any browser (the scam pages themselves).
2. To see SafeSurf catch them: clone https://github.com/prokiller67-crypto/safesurf, run `npm install && npm run build` in extension/, load extension/dist via chrome://extensions (Developer mode → Load unpacked).
3. No API key needed — AI analysis works out of the box via SafeSurf Cloud.
4. Open any demo page from the site and watch the banner.
```

---

## 3. Чеклист сабмита (по порядку)

- [ ] Записать видео по сценарию §1, залить на YouTube (unlisted), скопировать ссылку
- [ ] Зайти на https://brainwaves.devpost.com/ → Register/Join hackathon (email: virtbasket@gmail.com)
- [ ] Create project → вставить тексты из §2
- [ ] Приложить `pitch/SafeSurf-Brainwave2026.pdf` (≤10 слайдов — правило соблюдено: ровно 10)
- [ ] Вставить ссылку на видео
- [ ] Проверить, что репо публичный и открывается в инкогнито: https://github.com/prokiller67-crypto/safesurf
- [ ] Проверить лендинг в инкогнито: https://safesurf-blush.vercel.app
- [ ] Submit ✅

---

## 4. Быстрая проверка, что всё живо (перед сабмитом)

```bash
# Hosted AI endpoint отвечает вердиктом:
curl -s -X POST https://safesurf-blush.vercel.app/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"url":"http://test.top","title":"t","textSample":"You have won an iPhone! Call support now.","heuristics":{"score":50,"level":"dangerous","findings":[]}}' \
  | python3 -m json.tool
# Ожидаем: {"ok": true, "verdict": {"risk": "dangerous", ...}}

# Расширение собирается:
cd extension && npm run build   # → "Done"
```

Если endpoint отвечает ошибкой про ключ — в Vercel пропала env-переменная:
`cd site && vercel env ls production` (должна быть ANTHROPIC_API_KEY) → после добавления `vercel deploy --prod --yes`.

---

## 5. После хакатона (не забыть)

- [ ] Выключить/ограничить hosted endpoint, чтобы ключ не тратился: удалить env (`cd site && vercel env rm ANTHROPIC_API_KEY production`) и передеплоить — или снизить капы в `site/api/analyze.js`
- [ ] Если выиграли 🏆 — обновить README и лендинг бейджем
