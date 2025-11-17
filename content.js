const STORAGE_KEY = "ghjp_translation_enabled";
const TRANSLATED_ATTR = "data-ghjp-translated";

class TranslationDictionary {
  constructor() {
    this.entries = [];
  }

  async load() {
    if (this.entries.length > 0) return;
    const url = chrome.runtime.getURL("translations.json");
    const response = await fetch(url);
    const translations = await response.json();
    this.entries = Object.entries(translations).map(([source, target]) => ({
      source,
      target,
      pattern: new RegExp(`\\b${TranslationDictionary.escapeRegExp(source)}\\b`, "gi")
    }));
  }

  translate(text) {
    if (!text || typeof text !== "string") return text;
    let result = text;
    for (const entry of this.entries) {
      if (!entry.pattern.test(result)) continue;
      entry.pattern.lastIndex = 0;
      result = result.replace(entry.pattern, (match) => TranslationDictionary.applyCase(match, entry.target));
    }
    return result;
  }

  static escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  }

  static applyCase(source, target) {
    if (source === source.toUpperCase()) return target.toUpperCase();
    if (source === source.toLowerCase()) return target.toLowerCase();
    if (source[0] === source[0].toUpperCase()) {
      return target.charAt(0).toUpperCase() + target.slice(1);
    }
    return target;
  }
}

class GitHubTranslator {
  constructor() {
    this.enabled = true;
    this.dictionary = new TranslationDictionary();
    this.observer = null;
    this.attributeTargets = ["aria-label", "title", "placeholder", "value"];
    this.textOriginalKey = "__ghjpOriginalText";
  }

  async init() {
    await this.dictionary.load();
    const stored = await chrome.storage.local.get({ [STORAGE_KEY]: true });
    this.enabled = Boolean(stored[STORAGE_KEY]);

    if (this.enabled) {
      this.translateDocument(document.body);
      this.startObserver();
    }

    this.listenForMessages();
  }

  listenForMessages() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === "GHJP_SET_STATE") {
        this.toggle(Boolean(message.enabled));
        sendResponse({ success: true });
      }

      if (message?.type === "GHJP_REQUEST_STATE") {
        sendResponse({ enabled: this.enabled });
      }

      if (message?.type === "GHJP_TRANSLATE_NOW") {
        if (this.enabled) {
          this.translateDocument(document.body, true);
        }
        sendResponse({ success: true });
      }

      return true;
    });
  }

  toggle(nextState) {
    this.enabled = nextState;
    chrome.storage.local.set({ [STORAGE_KEY]: this.enabled });

    if (this.enabled) {
      this.translateDocument(document.body, true);
      this.startObserver();
    } else {
      this.disconnectObserver();
      this.resetTranslations();
    }
  }

  startObserver() {
    if (this.observer || !this.enabled) return;
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => this.translateNode(node));
        }
        if (mutation.type === "attributes" && this.attributeTargets.includes(mutation.attributeName)) {
          this.translateAttribute(mutation.target, mutation.attributeName);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: this.attributeTargets
    });
  }

  disconnectObserver() {
    if (!this.observer) return;
    this.observer.disconnect();
    this.observer = null;
  }

  translateDocument(root = document.body, force = false) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      this.translateTextNode(node, force);
    }

    if (root.querySelectorAll) {
      const elements = root.querySelectorAll("*[aria-label], *[title], *[placeholder], *[value]");
      elements.forEach((el) => {
        this.attributeTargets.forEach((attr) => this.translateAttribute(el, attr, force));
      });
    }
  }

  translateNode(node, force = false) {
    if (node.nodeType === Node.TEXT_NODE) {
      this.translateTextNode(node, force);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    this.attributeTargets.forEach((attr) => this.translateAttribute(node, attr, force));

    node.childNodes.forEach((child) => this.translateNode(child, force));
  }

  translateTextNode(node, force = false) {
    const parent = node.parentElement;
    if (!parent) return;
    if (!force && node[this.textOriginalKey]) return;

    const original = node.textContent;
    const translated = this.dictionary.translate(original);

    if (translated !== original) {
      if (!node[this.textOriginalKey]) {
        node[this.textOriginalKey] = original;
      }
      node.textContent = translated;
      parent.setAttribute(TRANSLATED_ATTR, "true");
    }
  }

  translateAttribute(element, attribute, force = false) {
    if (!element || !element.getAttribute) return;
    const current = element.getAttribute(attribute);
    if (!current) return;
    const originalAttr = `data-ghjp-original-${attribute}`;
    if (!force && element.hasAttribute(originalAttr)) return;

    const translated = this.dictionary.translate(current);
    if (translated !== current) {
      if (!element.hasAttribute(originalAttr)) {
        element.setAttribute(originalAttr, current);
      }
      element.setAttribute(attribute, translated);
      element.setAttribute(TRANSLATED_ATTR, "true");
    }
  }

  resetTranslations() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (node[this.textOriginalKey]) {
        node.textContent = node[this.textOriginalKey];
        delete node[this.textOriginalKey];
      }
    }

    const translatedElements = document.querySelectorAll(`[${TRANSLATED_ATTR}]`);
    translatedElements.forEach((element) => {
      this.attributeTargets.forEach((attr) => {
        const originalAttr = `data-ghjp-original-${attr}`;
        if (element.hasAttribute(originalAttr)) {
          element.setAttribute(attr, element.getAttribute(originalAttr));
          element.removeAttribute(originalAttr);
        }
      });
      element.removeAttribute(TRANSLATED_ATTR);
    });
  }
}

const translator = new GitHubTranslator();
translator.init().catch((error) => console.error("GHJP: 初期化に失敗しました", error));
