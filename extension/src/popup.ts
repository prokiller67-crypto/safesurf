import { DEFAULT_SETTINGS } from "./types";

const apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
const aiEnabledInput = document.getElementById("aiEnabled") as HTMLInputElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

async function load() {
  const s = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  apiKeyInput.value = s.apiKey ?? "";
  aiEnabledInput.checked = s.aiEnabled ?? true;
}

saveButton.addEventListener("click", async () => {
  await chrome.storage.sync.set({
    apiKey: apiKeyInput.value.trim(),
    aiEnabled: aiEnabledInput.checked,
  });
  statusEl.textContent = "Saved ✓";
  setTimeout(() => (statusEl.textContent = ""), 2000);
});

void load();
