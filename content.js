const STORAGE_KEY = "ghjp_translation_enabled";
const TRANSLATED_ATTR = "data-ghjp-translated";

class TranslationDictionary {
  constructor() {
    this.entries = [];
    this.loading = null;
  }

  async load() {
    if (this.entries.length > 0) return;
    if (this.loading) return this.loading;

    const selectors = [
      ".application-main .Layout .Layout-main",
      "main .flex-auto"
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }

    return document.querySelector(".application-main") || document.querySelector("main") || document.body;
  }

  composeContent() {
    const isDashboard = window.location.pathname === "/" || window.location.pathname === "/dashboard";
    const stats = this.collectStats();
    const contextEyebrow = isDashboard ? "ダッシュボードガイド" : "プロフィールガイド";
    const title = isDashboard ? "まずは今日のゴールを確認しましょう" : "プロフィールをわかりやすく伝えましょう";
    const description = isDashboard
      ? "やることを3ステップで整理すれば、迷わず作業を始められます。"
      : "自己紹介や活動履歴を整えると、コラボのきっかけが増えます。";

    return `
      <div class="ghjp-helper__header">
        <div>
          <p class="ghjp-helper__eyebrow">${contextEyebrow}</p>
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        <div class="ghjp-helper__tag">初心者モード</div>
      </div>
      <div class="ghjp-helper__grid">
        <article class="ghjp-helper__card">
          <h3>1. 状況をつかむ</h3>
          <ul>
            <li>通知ベルから未読をチェック</li>
            <li>リポジトリタブで作業中のブランチを確認</li>
            <li>スターやフォロワーの増減を振り返りましょう</li>
          </ul>
        </article>
        <article class="ghjp-helper__card">
          <h3>2. 次の一歩</h3>
          <div class="ghjp-helper__actions">
            <a class="ghjp-helper__button" href="https://github.com/new" target="_blank" rel="noopener">リポジトリ作成</a>
            <a class="ghjp-helper__button" href="https://github.com/issues" target="_blank" rel="noopener">Issueを見る</a>
            <a class="ghjp-helper__button" href="https://github.com/settings/profile" target="_blank" rel="noopener">プロフィール編集</a>
          </div>
        </article>
        <article class="ghjp-helper__card ghjp-helper__card--status">
          <h3>現在のステータス</h3>
          <dl>
            <div><dt>フォロワー</dt><dd>${stats.followers}</dd></div>
            <div><dt>フォロー中</dt><dd>${stats.following}</dd></div>
            <div><dt>スター</dt><dd>${stats.stars}</dd></div>
          </dl>
          <p class="ghjp-helper__hint">数字はページに表示されている値をそのまま読み取っています。</p>
        </article>
      </div>
      <footer class="ghjp-helper__footer">
        <p>翻訳ボタンで日本語/英語を切り替えながら、少しずつ慣れていきましょう。</p>
      </footer>
    `;
  }

  collectStats() {
    return {
      followers: this.extractNumber('a[href$="?tab=followers"] .Counter, a[href$="?tab=followers"], span[data-hovercard-url*="followers"]'),
      following: this.extractNumber('a[href$="?tab=following"] .Counter, a[href$="?tab=following"]'),
      stars: this.extractNumber('a[href$="?tab=stars"] .Counter, a[href$="?tab=stars"]')
    };
  }

  extractNumber(selector) {
    const element = document.querySelector(selector);
    if (!element) return "--";
    const text = element.textContent || "";
    const match = text.replace(/[,\s]/g, "").match(/\d+/);
    return match ? match[0] : text.trim() || "--";
  }

  injectStyles() {
    if (document.getElementById(this.styleId)) return;
    const style = document.createElement("style");
    style.id = this.styleId;
    style.textContent = `
      #${this.panelId} {
        border: 1px solid rgba(110, 118, 129, 0.4);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.25rem;
        background: rgba(46, 160, 67, 0.08);
        color: inherit;
        width: 100%;
        box-sizing: border-box;
      }

      .ghjp-helper__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .ghjp-helper__eyebrow {
        margin: 0;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        color: rgba(31, 35, 40, 0.7);
        text-transform: uppercase;
      }

      .ghjp-helper__tag {
        align-self: flex-start;
        background: #24292f;
        color: #fff;
        padding: 0.4rem 0.9rem;
        border-radius: 999px;
        font-size: 0.85rem;
      }

      .ghjp-helper__grid {
        margin-top: 1rem;
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .ghjp-helper__card {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid rgba(110, 118, 129, 0.3);
      }

      .ghjp-helper__card h3 {
        margin-top: 0;
        margin-bottom: 0.75rem;
        font-size: 1rem;
      }

      .ghjp-helper__card ul {
        margin: 0;
        padding-left: 1.1rem;
        color: rgba(31, 35, 40, 0.8);
      }

      .ghjp-helper__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .ghjp-helper__button {
        border-radius: 999px;
        border: 1px solid rgba(46, 160, 67, 0.4);
        padding: 0.45rem 0.9rem;
        text-decoration: none;
        font-weight: 600;
        color: inherit;
        background: #fff;
      }

      .ghjp-helper__button:hover {
        background: rgba(46, 160, 67, 0.15);
      }

      .ghjp-helper__card--status dl {
        margin: 0;
        display: grid;
        gap: 0.35rem;
      }

      .ghjp-helper__card--status dt {
        font-weight: 600;
      }

      .ghjp-helper__card--status dd {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
      }

      .ghjp-helper__hint {
        font-size: 0.8rem;
        color: rgba(31, 35, 40, 0.7);
        margin-top: 0.75rem;
      }

      .ghjp-helper__footer {
        margin-top: 1.25rem;
        font-size: 0.9rem;
        color: rgba(31, 35, 40, 0.8);
      }

      @media (prefers-color-scheme: dark) {
        #${this.panelId} {
          background: rgba(20, 83, 45, 0.9);
          border-color: rgba(80, 200, 120, 0.35);
        }

        .ghjp-helper__card {
          background: rgba(13, 17, 23, 0.9);
          border-color: rgba(110, 118, 129, 0.6);
        }

        .ghjp-helper__eyebrow {
          color: rgba(255, 255, 255, 0.7);
        }

        .ghjp-helper__button {
          background: rgba(255, 255, 255, 0.08);
          color: #e6edf3;
          border-color: rgba(46, 160, 67, 0.6);
        }

        .ghjp-helper__button:hover {
          background: rgba(46, 160, 67, 0.25);
        }

        .ghjp-helper__hint,
        .ghjp-helper__footer {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    `;

    document.head?.appendChild(style);
  }
}

const translator = new GitHubTranslator();
translator.init().catch((error) => console.error("GHJP: 初期化に失敗しました", error));

const helperPanel = new GitHubHelperPanel();
helperPanel.init();
