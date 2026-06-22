# MyColor（マイカラー）

> See the web in your own colors.

A Chrome extension that helps people with color vision deficiency make their daily web browsing more comfortable — on their own terms.

---

## Philosophy

The tool picks up areas that may be difficult to recognize. You decide what to change.

People with color vision deficiency see the world in their own way — and that's completely valid.  
Every color they see is their color. There's nothing to "fix."  
MyColor doesn't change colors automatically. Instead, it highlights areas that may be hard to recognize,  
and lets users change them to whatever works best for them.

---

## How to Use

1. Open a website — low-contrast areas are highlighted with a **yellow border**
2. The extension icon shows a **badge** with the number of detected issues
3. Change colors in one of two ways:

**Via the Check Panel:**
- Click the extension icon to open the Check Panel
- Hover over an item to preview it highlighted in red on the page
- Click an item to open the Color Change Panel directly

**Directly on the page:**
- **Alt+click** any highlighted element to open the Color Change Panel
- (Normal clicks still work as usual — links and buttons are not affected)

4. Choose a color from the Color Picker or suggested colors, then save
5. Your settings are saved per site and applied automatically on your next visit

> **Note:** Settings are stored in Chrome sync storage. They will be cleared if you uninstall the extension or clear your browser's site data.

---

## Visual States

| Outline | Meaning |
|---|---|
| Yellow border (`#FFD700`) | Low-contrast area detected |
| Red border (`#FF4500`) | Currently selected (hovered or panel open) |
| Green dashed border (`#1D9E75`) | Color change saved |

---

## Features

- Detects low-contrast text and UI elements (WCAG 1.4.3 / 1.4.11)
- Highlights problem areas with a yellow border
- Check Panel: lists all issues with contrast ratio values
- Color Change Panel: color picker + WCAG-compliant suggested colors
- Alt+click any highlighted element to change its color directly
- Saves settings per site automatically (chrome.storage.sync)
- Works on most websites including SPAs (MutationObserver)
- Background tabs are not scanned (optimized for performance)
- Japanese / English support

---

## Tech Stack

- Manifest V3
- [axe-core](https://github.com/dequelabs/axe-core) — contrast detection (MPL 2.0)
- [chroma.js](https://gka.github.io/chroma.js/) — suggested color calculation
- chrome.storage.sync — settings storage
- chrome.i18n — internationalization

---

## Security & Privacy

- All processing done client-side (no external communication)
- Minimal permissions: `activeTab`, `storage`, `scripting` only
- No use of `eval()` or remote script loading
- Libraries (axe-core, chroma.js) are bundled locally — no CDN
- Open source — anyone can verify the code

Privacy Policy: https://uni-star-001.github.io/mycolor/privacy.html

---

## Who It's For

People with color vision deficiency (Protan, Deutan, Tritan) who want to make their own browsing experience more comfortable.

---

## License

MIT License

---

---

# MyColor（マイカラー）— 日本語

> あなたの色で、あなたの世界を見る。

色覚特性のある人が、自分の日常ブラウジングを自分で快適にするChrome拡張機能。

---

## 設計哲学

ツールは認識しにくい可能性のある箇所をピックアップし、ユーザー自身が変える。

色覚特性のある人が見ている世界は間違っていない。  
すべての色がその人の色であり、すべて正解。  
ツールが勝手に色を変えるのではなく、認識しにくい可能性のある箇所をピックアップして、  
ユーザー自身が自分の見やすい色に変えられる設計です。

---

## 使い方

1. Webサイトを開くと、コントラスト不足の箇所が**黄色枠**でハイライト表示される
2. 拡張機能アイコンに検出件数が**バッジ**で表示される
3. 色を変更する方法は2つ：

**チェックパネル経由：**
- 拡張機能アイコンをクリックしてチェックパネルを開く
- 一覧をマウスオーバーすると、該当箇所が赤枠でプレビューされる
- 一覧をクリックすると、色変更パネルが直接開く

**ページ上で直接：**
- ハイライトされた箇所を**Alt+クリック**すると色変更パネルが開く
- （通常クリックはリンク・ボタンの動作をそのまま維持）

4. カラーピッカーまたは提案色から色を選んで「適用して保存」
5. 設定はサイトごとに保存され、次回アクセス時に自動適用される

> **注意：** 設定はChromeのsyncストレージに保存されます。拡張機能のアンインストールやブラウザのサイトデータのクリアで設定は消えます。

---

## 枠線の状態

| 枠線 | 意味 |
|---|---|
| 黄色枠（`#FFD700`） | コントラスト不足を検出 |
| 赤枠（`#FF4500`） | 選択中（ホバー中またはパネル表示中） |
| 緑の点線枠（`#1D9E75`） | 色変更を保存済み |

---

## 機能

- コントラスト不足のテキスト・UI要素を検出（WCAG 1.4.3 / 1.4.11）
- 問題箇所を黄色枠でハイライト表示
- チェックパネル：問題一覧とコントラスト比を表示
- 色変更パネル：カラーピッカー＋WCAG基準を満たす提案色
- Alt+クリックでページ上から直接色変更
- サイトごとに設定を自動保存（chrome.storage.sync）
- 動的コンテンツ対応（MutationObserver）
- バックグラウンドタブではスキャンをスキップ（パフォーマンス最適化）
- 日本語・英語対応

---

## セキュリティ・プライバシー

- すべての処理をクライアントサイドで完結（外部通信なし）
- 権限は`activeTab`・`storage`・`scripting`のみ
- `eval()`・リモートスクリプト読み込み不使用
- ライブラリ（axe-core・chroma.js）はローカルに同梱（CDN不使用）
- オープンソース公開済み（誰でもコードを確認できます）

プライバシーポリシー：https://uni-star-001.github.io/mycolor/privacy.html

---

## 対象ユーザー

色覚特性のある人本人（P型・D型・T型）

---

## ライセンス

MIT License