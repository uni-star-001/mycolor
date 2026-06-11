# MyColor（マイカラー）

> See the world in your colors.

A Chrome extension that helps people with color vision deficiency make their daily web browsing more comfortable — on their own terms.

## Philosophy

The tool picks up areas that may be difficult to recognize. You decide what to change.

People with color vision deficiency see the world in their own way — and that's completely valid.  
Every color they see is their color. There's nothing to "fix."  
MyColor doesn't change colors automatically. Instead, it picks up areas that may be hard to recognize,  
and lets users change them to whatever works best for them.

## Features (MVP)

- Highlights low-contrast areas with a yellow outline
- Shows issue count as a badge on the extension icon
- Lists issues in a popup
- Color picker to change any element to your preferred color
- Saves settings per site and applies them automatically
- Japanese / English support

## Tech Stack

- Manifest V3
- [axe-core](https://github.com/dequelabs/axe-core) — contrast detection
- [chroma.js](https://gka.github.io/chroma.js/) — suggested color calculation
- chrome.storage.sync — settings storage
- chrome.i18n — internationalization

## Security

- All processing done client-side (no external communication)
- Minimal permissions: `activeTab`, `storage`, `scripting` only
- No use of `eval()` or remote script loading
- Open source — anyone can verify the code

## Who It's For

People with color vision deficiency (Protan, Deutan, Tritan) who want to make their own browsing experience more comfortable.

## License

MIT License

---

# MyColor（マイカラー）— 日本語

> あなたの色で、あなたの世界を見る。

色覚特性のある人が、自分の日常ブラウジングを自分で快適にするChrome拡張機能。

## 設計哲学

ツールは認識しにくい可能性のある箇所をピックアップし、ユーザー自身が変える。

色覚特性のある人が見ている世界は間違っていない。  
すべての色がその人の色であり、すべて正解。  
ツールが勝手に色を変えるのではなく、認識しにくい可能性のある箇所をピックアップして、  
ユーザー自身が自分の見やすい色に変えられる設計です。

## 機能（MVP）

- コントラスト不足の箇所を黄色い枠線でハイライト表示
- 問題件数をアイコンバッジに表示
- ポップアップで問題一覧を確認
- カラーピッカーで自分の好きな色に変更
- サイト別に設定を保存・自動適用
- 日本語・英語対応

## セキュリティ

- すべての処理をクライアントサイドで完結（外部通信なし）
- 権限は`activeTab`・`storage`・`scripting`のみ
- eval()・リモートスクリプト読み込み不使用
- オープンソース公開済み（誰でもコードを確認できます）

## 対象ユーザー

色覚特性のある人本人（P型・D型・T型）

## ライセンス

MIT License