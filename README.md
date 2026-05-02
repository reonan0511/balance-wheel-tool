# Balance Wheel Tool（人生の輪）

MetaMentor 配布用のバランスホイール セルフチェックツール。
コーチがクライアントに「次回セッションまでに埋めてみて」と渡す前提で設計。

- アカウント不要・登録不要
- LocalStorage 自動保存
- 印刷 / PDF 保存対応
- スマホ・PC レスポンシブ対応

## ローカル開発

```bash
npm install
npm run dev
```

→ `http://localhost:5173` で起動。

## ビルド

```bash
npm run build      # → dist/
npm run preview    # ビルド結果のローカルプレビュー
```

## Vercel デプロイ

1. このディレクトリを GitHub リポジトリにプッシュ
   ```bash
   git init
   git add .
   git commit -m "Initial: Balance Wheel V1"
   git remote add origin git@github.com:reonan0511/balance-wheel-tool.git
   git push -u origin main
   ```
2. [Vercel](https://vercel.com/new) → Import Repository → リポジトリ選択
3. Framework は **Vite** が自動検出される。そのまま Deploy
4. デプロイ後、Settings → Domains から独自ドメイン設定（推奨: `tool.metamentor.tech`）

## ロゴ画像の配置

`public/metamentor-logo.png` に MetaMentor ロゴ画像（透過PNG推奨）を配置してください。
ヘッダーに表示されます。配置されていないと壊れた画像アイコンが表示されます。

## カスタマイズ箇所

`src/BalanceWheel.tsx`:

- `DEFAULT_CATEGORIES`: 8項目のデフォルト名・初期スコア
- `COLORS`: チャート上の各点の色
- コーチ向けCTA セクション: リンク先URL（CRM・SM・eBook）
- フッター: バグ報告フォームURL

`tailwind.config.js`:

- `brand.navy`: `#002B69`
- `brand.coral`: `#EE4D5E`

## 設計メモ

- **クライアント側はメアド・登録不要**（守秘義務 + 拡散性 + ノイズ回避のため）
- **コーチからのフィードバックは既存の問い合わせフォームに集約**（リード窓口を分散させない）
- **ホワイトペーパー経由でのみ URL 配布する想定**（マガジン記事内には直接リンクを置かない）

詳細は MetaMentor リポジトリ `HANDOVER.md` の「Vercel アプリ検討」セクション参照。
