# バランスホイール ホワイトペーパー制作ガイド

## 構成ファイル

| ファイル | 用途 |
|---|---|
| `whitepaper-source.md` | ホワイトペーパー本文（Markdown 全文） |
| `gpt-prompt.md` | ChatGPT-5.5 Pro に投げるプロンプト一式 |
| `screenshots/` | ツール画面のスクリーンショット（後で .pptx に差し込む） |
| `README.md` | このファイル |

## 制作ワークフロー

### Step 1: ChatGPT-5.5 Pro で .pptx 生成

1. `gpt-prompt.md` の冒頭の「プロンプト本体」をコピー
2. ChatGPT-5.5 Pro を開いて新しい会話を開始
3. プロンプトを貼り付け、続けて `whitepaper-source.md` の中身を全部貼る
4. 送信 → GPT が .pptx ファイルを生成
5. ダウンロードして PowerPoint / Keynote / Google Slides で開く

### Step 2: スクリーンショットを差し込む

`whitepaper-source.md` 内に `[SCREENSHOT: ツールのメイン入力画面（PC表示）]` などのプレースホルダーがあります。`screenshots/` フォルダに保存された画像を、対応する位置に貼り替えます。

差し込む画像:
- `screenshots/desktop-main.png` → 「ツールのメイン入力画面（PC表示）」
- `screenshots/mobile-share-mode.png` → 「シェア表示モードの画面」

### Step 3: GPT に追加リクエスト（必要に応じて）

`gpt-prompt.md` の末尾に「想定される追加プロンプト」例があります:
- 表紙のヒーロー画像を作り直したい
- 全体的に文字を減らしたい
- 配色をリファインしたい
- 特定ページだけ作り直したい

### Step 4: 最終調整

- URL リンクがクリック可能か確認
- 著者プロフィール・連絡先を最新化
- 誤字脱字チェック
- ページ番号・目次のページ整合性

### Step 5: PDF エクスポート → WordPress eBook 登録

1. PowerPoint で「ファイル → エクスポート → PDF として保存」
2. ファイル名: `balance-wheel-handbook-v1.pdf`
3. WordPress の eBook ダウンロードフォーム管理画面で新規登録
4. 配布リンクを取得
5. マガジン記事内の CTA バナー（CTA-D 系ショートコード）の遷移先を更新

## 想定スケジュール

| 工程 | 担当 | 想定時間 |
|---|---|---|
| Markdown 執筆 | Claude Code | ✅ 完了 |
| スクショ撮影 | Claude Code | 30分 |
| GPT-5.5 Pro で .pptx 生成 | 小泉さん | 30分〜1時間 |
| スクショ差し込み | 小泉さん | 30分 |
| デザイン微調整 | 小泉さん | 1〜2時間 |
| PDF 化 + WordPress 登録 | 小泉さん | 30分 |
| **合計** | | **半日** |

## トラブルシューティング

### GPT が長すぎてタイムアウトする
原稿を Part 1〜2 と Part 3〜4 で分割。前半で .pptx を出させて、後半をスライドとして追加させる。

### .pptx の出力品質が低い
追加プロンプトで「ページごとに作り直して」を試す。または Gamma.app に切り替え。

### 画像生成が失敗する
プロンプトを英語に切り替えると成功率が上がる傾向。
例: `[IMAGE: ...]` の中身を英訳して再投入。

### フォントが崩れる
PowerPoint で開いたとき、日本語フォントがインストールされてないと崩れる場合あり。
`Yu Gothic UI` や `Hiragino Sans` を選び直す。

## 配布ツール側との整合性

ホワイトペーパー内で記載の URL は以下と一致:
- 配布ツール: https://balance-wheel-tool.vercel.app/
- MetaMentor: https://metamentor.tech/
- ウェルビーイング診断: https://wellbeing.metamentor.tech/
- マガジン: https://metamentor.tech/magazine/

ツールの URL 変更（独自ドメイン化等）があったら、`whitepaper-source.md` 内の URL を一括置換してから再生成。
