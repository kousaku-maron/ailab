# @codemirror/lang-sql

CodeMirrorエディタのためのSQL言語サポートを提供するパッケージです。構文ハイライト、自動補完、複数のSQLダイアレクト（方言）をサポートしています。

## 基本的な使い方

```typescript
import {EditorView, basicSetup} from "codemirror"
import {sql} from "@codemirror/lang-sql"

// 基本的なSQLエディタの作成
const view = new EditorView({
  parent: document.body,
  doc: `SELECT * FROM users WHERE age > 20`,
  extensions: [basicSetup, sql()]
})
```

## ダイアレクト（SQL方言）

様々なSQLダイアレクトをサポートしています。デフォルトでは標準SQLが使用されます。

```typescript
import {
  sql,
  PostgreSQL,
  MySQL,
  MariaSQL,
  MSSQL,
  SQLite,
  Cassandra,
  PLSQL
} from "@codemirror/lang-sql"

// PostgreSQLダイアレクトを使用
const postgresEditor = new EditorView({
  extensions: [basicSetup, sql({dialect: PostgreSQL})]
})

// MySQLダイアレクトを使用
const mysqlEditor = new EditorView({
  extensions: [basicSetup, sql({dialect: MySQL})]
})
```

利用可能な主なダイアレクト:
- `StandardSQL`: 標準SQL（デフォルト）
- `PostgreSQL`: PostgreSQL
- `MySQL`: MySQL
- `MariaSQL`: MariaDB
- `MSSQL`: Microsoft SQL Server
- `SQLite`: SQLite
- `Cassandra`: Cassandraのクエリ言語
- `PLSQL`: Oracle PL/SQL

## スキーマベースの自動補完

テーブルやカラムの自動補完を設定できます。

```typescript
import {sql} from "@codemirror/lang-sql"

// スキーマ定義による自動補完
const editor = new EditorView({
  extensions: [
    basicSetup,
    sql({
      // スキーマ定義
      schema: {
        // users テーブル定義
        users: [
          "id",
          "username",
          "email",
          "created_at"
        ],
        // posts テーブル定義
        posts: [
          "id",
          "title",
          "content",
          "user_id",
          "published"
        ]
      },
      // デフォルトテーブル（テーブル名なしでカラム名を補完可能）
      defaultTable: "users"
    })
  ]
})
```

### 複雑なスキーマ定義

より詳細なスキーマ定義も可能です。

```typescript
import {sql} from "@codemirror/lang-sql"

const editor = new EditorView({
  extensions: [
    basicSetup,
    sql({
      schema: {
        // スキーマ定義
        public: {
          // テーブル定義
          users: [
            {label: "id", type: "int", detail: "primary key"},
            {label: "username", type: "varchar", detail: "not null"},
            {label: "email", type: "varchar", detail: "unique"}
          ],
          posts: [
            {label: "id", type: "int", detail: "primary key"},
            {label: "title", type: "varchar"},
            {label: "user_id", type: "int", detail: "foreign key"}
          ]
        },
        // 別のスキーマ
        auth: {
          permissions: [
            "id",
            "name",
            "description"
          ]
        }
      },
      // デフォルトスキーマ
      defaultSchema: "public"
    })
  ]
})
```

## カスタムダイアレクトの定義

独自のSQLダイアレクトを定義することもできます。

```typescript
import {SQLDialect, sql} from "@codemirror/lang-sql"

// カスタムダイアレクトの定義
const MyCustomSQL = SQLDialect.define({
  // キーワード
  keywords: "SELECT FROM WHERE INSERT UPDATE DELETE CREATE TABLE INDEX VIEW AS JOIN ON INNER LEFT RIGHT FULL OUTER",
  // 組み込み関数
  builtin: "COUNT SUM AVG MIN MAX",
  // データ型
  types: "INTEGER TEXT BOOLEAN DATE TIMESTAMP",
  // コメント記法
  hashComments: true,
  slashComments: false,
  // 文字列記法
  backslashEscapes: true,
  // 識別子の引用符
  identifierQuotes: "\"",
  // 大文字小文字の区別
  caseInsensitiveIdentifiers: false
})

// カスタムダイアレクトを使用
const editor = new EditorView({
  extensions: [basicSetup, sql({dialect: MyCustomSQL})]
})
```

## キーワード補完のカスタマイズ

キーワード補完の動作をカスタマイズできます。

```typescript
import {sql} from "@codemirror/lang-sql"

// 大文字のキーワード補完
const editor = new EditorView({
  extensions: [
    basicSetup,
    sql({
      // キーワードを大文字で補完
      upperCaseKeywords: true,
      
      // キーワード補完のカスタマイズ
      keywordCompletion: (label, type) => {
        return {
          label: label.toUpperCase(),
          type: type,
          boost: type === "keyword" ? 10 : undefined,
          info: `${type}: ${label}`
        }
      }
    })
  ]
})
```

## 補完ソースの直接使用

キーワード補完やスキーマ補完を個別に設定することもできます。

```typescript
import {EditorView, basicSetup} from "codemirror"
import {
  sql,
  PostgreSQL,
  keywordCompletionSource,
  schemaCompletionSource
} from "@codemirror/lang-sql"
import {autocompletion} from "@codemirror/autocomplete"

// 設定オブジェクト
const config = {
  dialect: PostgreSQL,
  schema: {
    users: ["id", "name", "email"],
    posts: ["id", "title", "content"]
  }
}

// 個別の補完ソースを使用
const editor = new EditorView({
  extensions: [
    basicSetup,
    sql(config),
    autocompletion({
      override: [
        // キーワード補完（大文字）
        keywordCompletionSource(PostgreSQL, true),
        // スキーマ補完
        schemaCompletionSource(config)
      ]
    })
  ]
})
```

## SQLDialectSpec オプション

`SQLDialect.define()`で使用できる主なオプション:

| オプション | 説明 |
|------------|------|
| `keywords` | ダイアレクトのキーワードをスペース区切りで指定 |
| `builtin` | 組み込み識別子をスペース区切りで指定 |
| `types` | データ型名をスペース区切りで指定 |
| `backslashEscapes` | 文字列内のバックスラッシュエスケープを許可するか |
| `hashComments` | `#`による行コメントを許可するか |
| `slashComments` | `//`による行コメントを許可するか |
| `spaceAfterDashes` | `--`コメントの後にスペースが必要か |
| `doubleDollarQuotedStrings` | `$$`で囲まれた文字列を許可するか |
| `doubleQuotedStrings` | ダブルクォートで囲まれた文字列を許可するか |
| `charSetCasts` | `_utf8'str'`や`N'str'`のような文字列を許可するか |
| `plsqlQuotingMechanism` | PL/SQLの`q'[str]'`構文を許可するか |
| `operatorChars` | 演算子を構成する文字セット（デフォルト: `"*+\\-%<>!=&|~^/"`） |
| `specialVar` | 特殊変数名の開始文字（デフォルト: `"?"`） |
| `identifierQuotes` | 識別子の引用に使用できる文字（デフォルト: `"\""`） |
| `caseInsensitiveIdentifiers` | 識別子の大文字小文字を区別しないか |
| `unquotedBitLiterals` | `0b1010`のようなビット値を許可するか |
| `treatBitsAsBytes` | ビット値に0と1以外の文字を含めるか |
