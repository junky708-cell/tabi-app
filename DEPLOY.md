# TABI アプリ — デプロイガイド

## フォルダ構成
```
tabi-app/
├── index.html     ← メインアプリ
├── manifest.json  ← PWA設定
└── DEPLOY.md      ← このファイル
```

---

## Step 1: GitHubにアップロード（5分）

1. https://github.com にアクセス、アカウント作成（無料）
2. 右上の「＋」→「New repository」
3. Repository name: `tabi-app`
4. 「Public」を選択 → 「Create repository」
5. 「uploading an existing file」をクリック
6. `index.html` と `manifest.json` をドラッグ＆ドロップ
7. 「Commit changes」をクリック

---

## Step 2: Vercelで公開（3分）

1. https://vercel.com にアクセス
2. 「Sign Up」→「Continue with GitHub」でログイン
3. 「New Project」→ `tabi-app` を選択
4. 「Deploy」をクリック
5. 完了！ URLが発行されます（例: `tabi-app.vercel.app`）

---

## Step 3: バックエンド設定（APIキーを隠す）

現在のバージョンはデモ用にClaudeのAPIを直接使用しています。
本番公開前に以下の手順でAPIキーを保護してください。

### Vercel Functionsの作成

`api/generate.js` というファイルを作成：

```javascript
export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, lang } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY, // 環境変数から読む
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // コスト削減のためHaikuを推奨
      max_tokens: 2000,
      system: 'Return ONLY valid JSON.',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  res.json(data);
}
```

### Vercelの環境変数に登録

1. Vercelダッシュボード → プロジェクト設定
2. 「Environment Variables」
3. `ANTHROPIC_API_KEY` = `sk-ant-...` を追加

---

## コスト試算

| モデル | 1回あたり | 月1,000回 |
|--------|-----------|-----------|
| Claude Haiku | 約¥0.3 | 約¥300 |
| Claude Sonnet | 約¥2 | 約¥2,000 |

**最初はHaikuで十分です。**

---

## カスタムドメイン設定（任意）

例: `tabi-guide.com` を取得して設定
- お名前.com や Cloudflare Registrar で年¥1,500程度
- Vercelのダッシュボードから簡単に設定可能

---

## 次のフェーズ（将来）

- [ ] Supabaseでユーザー登録・ログイン
- [ ] Stripeで課金システム
- [ ] 旅程の保存・共有機能
- [ ] Google Maps連携
