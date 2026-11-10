# ArchMC Discord Auth & Moderation Bot

ArchMC JP/EN コミュニティ専用のDiscord認証・管理Botです。

## 🛠️ 主な機能

1. **Webサイト（GitHub Pages）連携**:
   - Webサイトの認証フォームからMinecraft名とDiscordユーザー名が送信されると、Botがサーバー内の該当メンバーを検索して**ロール（Role ID: `1568130111243554868`）を自動付与**します。
2. **`/link <mc_name>` コマンド**:
   - Discordサーバー内で直接実行可能。Minecraft名を入力するだけで即座にロールが付与されます。
3. **`/unlink` コマンド**:
   - 一般ユーザー自身が自分の連携を解除し、**ロールを自動削除**します。
4. **`/unlinkadmin <name>` コマンド（運営専用）**:
   - 運営（ロール管理権限者）が実行可能。指定したMinecraft IDまたはDiscordユーザー名の**連携を強制解除し、ロールを自動剥奪**します。
5. **`/wholink <discord_name>` コマンド（運営専用）**:
   - 運営（ロール管理権限者）が実行可能。指定したDiscordユーザー名（またはメンション、ID、MCID）から、**Discord名と連携中のMinecraft ID（スキン画像付き）を検索・照会**します。
6. **`/linkinfo` コマンド**:
   - 自分の連携状態と登録Minecraft IDを確認できます。
7. **`/linklist` コマンド（運営専用）**:
   - 現在サーバーで連携されているプレイヤーの一覧を確認できます。
8. **`/giveaway` コマンド（運営専用）**:
   - 画像通りのGUIポップアップ（モーダル）が開き、期間（Duration）、当選者数（Number of Winners）、景品（Prize）、説明（Description）に加えて、**サーバーのロールをGUIで複数選択（複数ロール条件対応）** してギブアウェイを開始・自動抽選できます。

---

## 🚀 起動方法（ローカルPC）

1. `bot/start-bot.bat` をダブルクリックするだけで、必要なパッケージが自動インストールされ、Botが起動します。
2. コマンドプロンプトに以下が表示されたら起動完了です：
   ```
   =========================================
    ArchMC Auth Bot is Online as ArchMC Bot#0000
    Target Role ID: 1568130111243554868
   =========================================
   ✅ Successfully registered all slash commands!
   API Server running on port 3000
   ```

---

## 🌐 24時間無料稼働させる場合（Render / Railway 等）

GitHubにリポジトリをプッシュ後、無料ホスティングサービスに連携するだけでPCを閉じていても24時間稼働できます：

1. [Render.com](https://render.com) で無料アカウントを作成
2. **New Web Service** を作成し、GitHubリポジトリを接続
3. Root Directory に `bot` を指定
4. Build Command: `npm install`
5. Start Command: `node index.js`
6. Environment Variables（環境変数）に `.env` の内容を設定
7. 発行されたURL（例: `https://archmc-bot.onrender.com`）をWebサイト（`js/auth.js` の `BOT_API_URL`）に設定

