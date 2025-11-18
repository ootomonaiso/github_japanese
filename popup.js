const STORAGE_KEY = "ghjp_translation_enabled";
const FIRST_RUN_KEY = "ghjp_first_run_complete";
const DEV_MODE_KEY = "ghjp_dev_mode";

const toggle = document.getElementById("toggle");
const toggleLabel = document.getElementById("toggleLabel");
const statusDot = document.querySelector(".status__dot");
const statusMessage = document.getElementById("statusMessage");
const translateButton = document.getElementById("translatePage");
const welcomeCard = document.getElementById("welcome");
const helpButton = document.getElementById("helpButton");
const helpDialog = document.getElementById("helpDialog");
const closeHelpButton = document.getElementById("closeHelp");
const devModeToggle = document.getElementById("devModeToggle");
const devModeLabel = document.getElementById("devModeLabel");

let currentTabId = null;
let isGitHubTab = false;

async function init() {
  await loadState();
  await hydrateTabInfo();
  registerEvents();
}

async function loadState() {
  const stored = await chrome.storage.local.get({
    [STORAGE_KEY]: true,
    [FIRST_RUN_KEY]: false,
    [DEV_MODE_KEY]: false
  });

  toggle.checked = Boolean(stored[STORAGE_KEY]);
  devModeToggle.checked = Boolean(stored[DEV_MODE_KEY]);
  updateToggleView();
  updateDevModeView();

  if (!stored[FIRST_RUN_KEY]) {
    welcomeCard.hidden = false;
    chrome.storage.local.set({ [FIRST_RUN_KEY]: true });
  }
}

async function hydrateTabInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    disableControls("アクティブなタブを取得できませんでした。");
    return;
  }

  currentTabId = tab.id;
  try {
    const url = new URL(tab.url);
    isGitHubTab = url.hostname.endsWith("github.com");
  } catch (error) {
    isGitHubTab = false;
  }

  if (!isGitHubTab) {
    disableControls("GitHubのタブを開いているときに使えます。");
    return;
  }

  statusMessage.textContent = "GitHubタブを検出しました。";
  toggle.disabled = false;
  translateButton.disabled = false;
  await syncWithContentScript();
}

function disableControls(message) {
  statusMessage.textContent = message;
  toggle.disabled = true;
  translateButton.disabled = true;
  document.body.classList.add("is-disabled");
}

function registerEvents() {
  toggle.addEventListener("change", async () => {
    updateToggleView();
    if (!isGitHubTab || currentTabId === null) return;

    chrome.storage.local.set({ [STORAGE_KEY]: toggle.checked });
    try {
      await sendMessage({ type: "GHJP_SET_STATE", enabled: toggle.checked });
      if (toggle.checked) {
        statusMessage.textContent = "日本語モードを有効にしました。";
      } else {
        statusMessage.textContent = "英語表示に戻しました。";
      }
    } catch (error) {
      statusMessage.textContent = "翻訳スクリプトに接続できませんでした。";
    }
  });

  translateButton.addEventListener("click", async () => {
    if (!isGitHubTab || currentTabId === null) return;
    try {
      await sendMessage({ type: "GHJP_TRANSLATE_NOW" });
      statusMessage.textContent = "このページを翻訳しました。";
    } catch (error) {
      statusMessage.textContent = "翻訳コマンドを送れませんでした。";
    }
  });

  helpButton.addEventListener("click", () => helpDialog.showModal());
  closeHelpButton.addEventListener("click", () => helpDialog.close());

  devModeToggle.addEventListener("change", async () => {
    updateDevModeView();
    if (!isGitHubTab || currentTabId === null) return;

    chrome.storage.local.set({ [DEV_MODE_KEY]: devModeToggle.checked });
    try {
      await sendMessage({ type: "GHJP_TOGGLE_DEV_MODE", enabled: devModeToggle.checked });
      if (devModeToggle.checked) {
        statusMessage.textContent = "開発モード有効。コンソールで ghjpDevTools を使えます。";
      } else {
        statusMessage.textContent = "開発モード無効。";
      }
    } catch (error) {
      statusMessage.textContent = "開発モード切り替えに失敗しました。";
    }
  });
}

async function syncWithContentScript() {
  try {
    const response = await sendMessage({ type: "GHJP_REQUEST_STATE" });
    if (typeof response?.enabled === "boolean") {
      toggle.checked = response.enabled;
      chrome.storage.local.set({ [STORAGE_KEY]: response.enabled });
      updateToggleView();
    }
  } catch (_error) {
    statusMessage.textContent = "翻訳スクリプトと通信できません。ページ更新後にお試しください。";
  }
}

function updateToggleView() {
  const enabled = toggle.checked;
  toggleLabel.textContent = enabled ? "翻訳中" : "停止中";
  statusDot.dataset.state = enabled ? "on" : "off";
  translateButton.classList.toggle("button--primary", enabled);
}

function sendMessage(payload) {
  return new Promise((resolve, reject) => {
    if (!currentTabId) {
      reject(new Error("No active tab"));
      return;
    }
    chrome.tabs.sendMessage(currentTabId, payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
}

init().catch((error) => {
  console.error("GHJP popup init failed", error);
  disableControls("読み込み中に問題が発生しました。");
});
