# 認証できないときのチェックリスト

## 今回の修正内容
- `js/auth.js`: 予備のSHA-256実装が間違った値を返していたため修正（http/file:// で開くと必ず「無効なトークン」になっていた）
- `bot/index.js`: 全角文字・特殊なハイフン・空白・引用符・`token:` 付きで貼り付けても通るように正規化
- `bot/index.js`: サーバー外実行のガード、エラーメッセージ改善、`/link` の結果をログ出力
- `render.yaml`: Webhook URL を削除（環境変数で設定）、healthCheckPath 追加
- `bot/.env` と `.idea/` をzipから除外（`.env.example` を追加）

## Render側の必須設定（Dashboard → Environment）
- `DISCORD_TOKEN` : Developer Portal の Bot トークン
- `WEBHOOK_URL`   : 新しく作り直した Webhook URL（任意）

## Discord側の必須設定
1. Developer Portal → Bot → **SERVER MEMBERS INTENT** をON（GuildMembers を使用）
2. サーバー設定 → ロール で **Botのロールを、付与するロールより上**に配置
3. Botに「ロールの管理」権限を付与

## 無料プランのスリープ対策
Render無料プランは15分アクセスがないと停止します。
UptimeRobot 等で `https://<あなたのRenderURL>/health` を5分おきに監視してください。

## 動作確認
- `https://<RenderURL>/health` が `{"status":"ok","botOnline":true,...}` を返す
- RenderのLogsに `Successfully registered all slash commands!` が出ている
- Discordで `/link` を入力すると `token` 欄が出る
