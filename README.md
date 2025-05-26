# AI Lab

AIラボは、AIアシスタントとの対話を強化するためのツールとサーバーを提供するプロジェクトです。

## 概要

このプロジェクトは以下の主要コンポーネントで構成されています：

1. **CLIツール** - AIアシスタント用の設定ファイルを生成
2. **MCPサーバー** - AIアシスタントに追加機能を提供するModel Context Protocol（MCP）サーバー

## CLIツール

CLIツールは、Markdownファイルから以下の設定ファイルを生成します：

- `.roomodes` - AIアシスタントのモード設定
- `.clinerules` - AIアシスタントのルール設定
- `.claude_preferences` - Claude AIアシスタントの設定

### 使用方法

```bash
# ビルド
cd cli
npm run build

# 実行
npm start
```

設定ファイルは以下のディレクトリから生成されます：

- モード: `../.cline/roomodes/`
- ルール: `../.cline/rules/`
- Claude設定: `../.claude/`

テンプレート変数は `variables.json` ファイルで定義できます。

## MCPサーバー

Model Context Protocol（MCP）サーバーは、AIアシスタントに追加機能を提供します。

### 利用可能なサーバー

- **note-search** - note.comの記事を検索・取得
- **notion** - Notionデータベースとの連携
- **npm-search** - npmパッケージの検索・情報取得
- **web-search** - Web検索機能の提供

### サーバーのビルドと実行

```bash
# 例：note-searchサーバーのビルド
cd mcp/servers/note-search
npm run build
```

## ドキュメント

`docs` ディレクトリには、以下のドキュメントが含まれています：

- `docs/note/` - note.comのクリエイターに関する情報
- `docs/npm/` - npmパッケージの使用方法に関するチートシート

## カスタムモード

このプロジェクトには以下のカスタムモードが定義されています：

- **note-creator-researcher** - note.comのクリエイターのライティングスタイルを分析・模倣
- **npm-researcher** - npmライブラリの使用方法を簡潔に要約

## 開発

### 前提条件

- Node.js
- npm または pnpm

### セットアップ

```bash
# CLIツールのセットアップ
cd cli
npm install

# MCPサーバーのセットアップ（例：note-search）
cd mcp/servers/note-search
npm install
```

### 変数の設定

`variables.example.json` を `variables.json` にコピーして、必要な変数を設定します。

```json
{
  "directory": {
    "ai_workspace": {
      "name": "AI_Workspace",
      "full_path": "~/Users/username/AI_Workspace"
    },
    "ai_memory": {
      "name": "LLM Memory",
      "full_path": "~/Users/username/AI_Workspace/LLM Memory"
    },
    "alias": [
      {
        "name": "Workspace",
        "full_path": "~/Users/username/Workspace"
      }
    ]
  }
}
```

## ライセンス

このプロジェクトは独自のライセンスの下で提供されています。詳細については、プロジェクト管理者にお問い合わせください。
