
## 環境
```bash
> npx
> create-hono notion-api-app

create-hono version 0.19.4
✔ Using target directory … notion-api-app
✔ Which template do you want to use? cloudflare-workers+vite
✔ Do you want to install project dependencies? Yes
✔ Which package manager do you want to use? npm

```

## セットアップ

### 1. Notion Integration の作成
1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「+ New integration」をクリック
3. 名前を入力し、「Submit」
4. 「Internal Integration Secret」をコピー（これがAPIキー）

### 2. Notionデータベースの共有
1. 作成したインテグレーションのアクセスタブをクリック
2. アクセス権限を編集をクリック
3. 該当するDBを選択

### 3. 環境変数の設定
```bash
# サンプルファイルをコピー
cp .dev.vars.example .dev.vars

# .dev.vars を編集して実際の値を入力
```

### 4. ローカル開発
```bash
npm run dev
```

## APIエンドポイント

### GET /books
書籍一覧を取得
```bash
curl http://localhost:5173/books
```

### POST /books
書籍を追加
```bash
curl -X POST http://localhost:5173/books \
  -H "Content-Type: application/json" \
  -d '{"name": "吾輩は猫である", "isbn": 9784101010014}'
```

## 実装
自前実装はmainのブランチ  
[main](https://github.com/Yanai1005/API-Noation-db/tree/main)


notionhqの実装はnotionhqのブランチ   
[notionhq](https://github.com/Yanai1005/API-Noation-db/tree/notionhq)



## デプロイ
wrangler.jsonc
下記にdata_sourcesのIDを記載
※APIKEYが流出しない限り大丈夫な認識
``` jsonc
  "vars": {
    "NOTION_DATABASE_ID": "data_sources"
  }
```
※ DATABASE_IDは公開されても問題ありませんが、Integrationと共有されていないと使用できません

本番デプロイ時
```bash
# シークレットを設定
npx wrangler secret put NOTION_API_KEY
```

## 参考
[Notion APIのデータベース操作APIに破壊的変更があったので、実装を修正してみる](https://zenn.dev/sui_water/articles/3cb3bfb88d4832)

[Upgrading to Version 2025-09-03](https://developers.notion.com/docs/upgrade-guide-2025-09-03)

[Cloudflare Workers環境で「Illegal invocation」エラーが起きたときに試したこと
](https://zenn.dev/sui_water/articles/3329c4b318d934)