# バランスホイール ホワイトペーパー制作ガイド

## 構成ファイル

| ファイル | 役割 |
|---|---|
| **`whitepaper.html`** ⭐ | **本番ホワイトペーパー（HTML/CSS版・印刷でPDF化）** |
| `whitepaper-source.md` | Markdown原稿（HTML制作の元ネタ・他用途のバックアップ）|
| `whitepaper-source.docx` | Word版（Gamma等のAIツール経由用バックアップ）|
| `gpt-prompt.md` | GPT/AI ツール用プロンプト（バックアップ手段）|
| `screenshots/` | ツール画面・プレビュー画像 |
| `capture-screenshots.mjs` | ツール画面スクショ撮影スクリプト |
| `preview-render.mjs` | HTML プレビュー全体撮影 |
| `preview-pages.mjs` | HTML 各ページ個別撮影 |

## 推奨ワークフロー（HTML 経由）

### Step 1: ブラウザで開く
ファインダーで `whitepaper.html` をダブルクリック、または:

```bash
open /Users/reonakoizumi/Documents/MetaMentor/01_projects/balance-wheel-tool/whitepaper/whitepaper.html
```

### Step 2: PDF として保存
1. ブラウザ画面で **Cmd + P** で印刷ダイアログ
2. 左下の **「PDF」** ドロップダウン → **「PDFとして保存」**
3. 推奨ブラウザ: **Safari または Chrome**（Firefox はフォント描画が若干荒い）
4. 印刷オプション:
   - 用紙サイズ: **A4**
   - 余白: **デフォルト（または最小）**
   - **背景イメージ・カラーを印刷する** にチェック ⚠️ 重要

### Step 3: ファイル保存
- ファイル名: `balance-wheel-handbook-v1.pdf` 等
- 保存先: 任意

### Step 4: WordPress eBook 登録
- WP管理画面の eBook ダウンロードフォーム管理から新規登録
- PDF アップロード
- 配布用 URL を取得
- マガジン記事内の CTA-D ショートコードの遷移先を更新

## デザイン仕様

| 要素 | 値 |
|---|---|
| カラーパレット | ネイビー `#1F2D4F` / コーラル `#C9605A` / クリーム `#FAF7F0` / ゴールド `#B89556` / セージ `#8FA988` |
| 表示フォント | Inter（英数字・見出し） |
| 本文フォント | Source Serif 4 / Noto Serif JP |
| 本文サンセリフ | Noto Sans JP |
| 用紙サイズ | A4 ポートレート |
| 余白 | 22mm × 20mm |

## コンテンツ修正方法

`whitepaper.html` を直接編集:
- 文字の修正: HTML 内の該当部分を書き換え
- 色の変更: `<style>` 内の `:root` 変数を変更
- セクション追加: 既存の `<section class="page">...</section>` ブロックをコピーして編集
- 改ページ調整: `page-break-before: always` を含む CSS を追加

## トラブルシューティング

### フォントが英字フォントになって見える
- インターネット接続を確認（Google Fonts を読み込むため）
- ブラウザのキャッシュをクリアして再読み込み

### 印刷時に色が出ない
- 印刷ダイアログで **「背景グラフィック」** にチェック
- Safari の場合: 「カラーで印刷」を選択

### ページが大きすぎる/小さすぎる
- 印刷スケール 100% を確認
- 用紙サイズ A4 を確認

### スクショ画像が表示されない
- `screenshots/` フォルダがHTMLと同じ場所にあるか確認
- 画像の相対パス `screenshots/xxx.png` が正しいか確認

## 参考: ツール画面スクリーンショット（再撮影）

ツールに変更があったら以下で再撮影:

```bash
cd /Users/reonakoizumi/Documents/MetaMentor/01_projects/balance-wheel-tool/whitepaper
node capture-screenshots.mjs
```

## 参考: HTML プレビュー画像（再生成）

HTML を編集後、各ページのプレビュー画像を見たい場合:

```bash
cd /Users/reonakoizumi/Documents/MetaMentor/01_projects/balance-wheel-tool/whitepaper
node preview-pages.mjs
```

→ `screenshots/preview-page-XX.png` に各ページが保存されます。

## 失敗した試行（参考メモ）

- ❌ **GPT-5.5 Pro で .pptx 生成**: 出力品質が低く採用見送り
- ❌ **Gamma.app**: テンプレートが企業ホワイトペーパー風にならず、見送り
- ✅ **Claude Code が HTML/CSS 直接生成**: 完全制御 + 高品質、採用

## 配布前チェックリスト

- [ ] 全ページ順番が正しい
- [ ] URL（balance-wheel-tool.vercel.app）が最新
- [ ] 著者プロフィール・連絡先が最新
- [ ] スクリーンショット画像が表示されている
- [ ] 誤字脱字なし
- [ ] PDF 化したファイルサイズが適切（5-10MB 程度想定）
- [ ] PDF を異なるビューア（Preview / Adobe Reader）で開いて崩れがないか確認
