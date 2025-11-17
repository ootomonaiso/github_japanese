# GitHub Japanese Translator - Chrome Extension Project

## Project Overview
GitHubのページ全体を日本語に翻訳するChrome拡張機能。リアルタイムでUIテキストを日本語化し、ユーザーフレンドリーな操作を提供。

## 主要機能
- GitHubの主要UI要素（Issues、Pull requests、Code、Actions等）を日本語に翻訳
- リアルタイム翻訳（MutationObserverでDOM変更を監視）
- ポップアップから翻訳ON/OFF切り替え可能
- 翻訳状態をローカルストレージで永続化
- aria-label、title、placeholder属性も翻訳対応

## 初心者向けUI設計
- **わかりやすい言葉**: 専門用語を避け、平易な日本語を使用
- **視覚的なフィードバック**: 翻訳状態を色とアイコンで明示（緑=ON、グレー=OFF）
- **大きなボタン**: タップしやすい十分なサイズ
- **簡潔な説明**: 各機能に1行の説明文を追加
- **初回起動時のガイド**: 使い方を簡単に説明するウェルカムメッセージ
- **エラー時の親切な案内**: 問題が起きた時の対処法を表示

## 技術スタック
- Manifest V3（最新のChrome拡張機能仕様）
- Vanilla JavaScript（軽量・高速）
- Chrome Storage API（設定の永続化）
- MutationObserver API（動的コンテンツ対応）

## ファイル構成
```
github_japanese/
├── .github/
│   └── copilot-instructions.md
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json          # Chrome拡張機能の設定ファイル
├── content.js            # GitHubページに挿入されるスクリプト
├── popup.html            # 拡張機能のポップアップUI
├── popup.js              # ポップアップのロジック
├── styles.css            # ポップアップのスタイル
├── translations.json     # 英語→日本語の翻訳辞書
└── README.md             # プロジェクトドキュメント
```

## 開発タスク（優先順位順）
1. manifest.json - Chrome拡張機能の基本設定
2. translations.json - 翻訳辞書の作成
3. content.js（基本構造） - DOM監視とストレージ連携
4. content.js（翻訳ロジック） - テキスト置換処理
5. popup.html - UI構造
6. popup.js - ポップアップのロジック
7. styles.css - スタイリング
8. icons/ - アイコン画像
9. README.md - ドキュメント
10. 動作確認 - テストとデバッグ

## GitHub Copilot最適化のポイント
- 各タスクは単一責任で分割（ファイルごとに作業）
- 明確なコメントで意図を記述
- 翻訳辞書は段階的に拡充可能
- Manifest V3の最新仕様に準拠
- エラーハンドリングを各所に実装
