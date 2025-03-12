# @notionhq/client

Notion API の公式 JavaScript/TypeScript クライアントライブラリです。

## インストール

```bash
npm install @notionhq/client
```

## 基本的な使い方

### クライアントの初期化

```typescript
import { Client } from "@notionhq/client";

// API キーを使用して初期化
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
```

### ページの取得

```typescript
// ページIDを指定してページを取得
const getPage = async (pageId: string) => {
  const response = await notion.pages.retrieve({
    page_id: pageId,
  });
  return response;
};
```

### ページの作成

```typescript
// データベース内に新しいページを作成
const createPage = async (databaseId: string, properties: any) => {
  const response = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: properties,
  });
  return response;
};
```

### ページの更新

```typescript
// ページのプロパティを更新
const updatePage = async (pageId: string, properties: any) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties: properties,
  });
  return response;
};
```

### データベースの取得

```typescript
// データベースIDを指定してデータベースを取得
const getDatabase = async (databaseId: string) => {
  const response = await notion.databases.retrieve({
    database_id: databaseId,
  });
  return response;
};
```

### データベースのクエリ

```typescript
// データベースの内容をクエリ
const queryDatabase = async (databaseId: string, filter?: any, sorts?: any) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: filter,
    sorts: sorts,
  });
  return response;
};
```

### データベースの作成

```typescript
// 親ページ内に新しいデータベースを作成
const createDatabase = async (parentPageId: string, title: string, properties: any) => {
  const response = await notion.databases.create({
    parent: {
      page_id: parentPageId,
    },
    title: [
      {
        type: "text",
        text: {
          content: title,
        },
      },
    ],
    properties: properties,
  });
  return response;
};
```

### ブロックの取得

```typescript
// ブロックIDを指定してブロックを取得
const getBlock = async (blockId: string) => {
  const response = await notion.blocks.retrieve({
    block_id: blockId,
  });
  return response;
};
```

### ブロックの子要素を取得

```typescript
// ブロックの子要素を取得
const getBlockChildren = async (blockId: string) => {
  const response = await notion.blocks.children.list({
    block_id: blockId,
  });
  return response;
};
```

### ブロックの追加

```typescript
// ブロックに子要素を追加
const appendBlockChildren = async (blockId: string, children: any[]) => {
  const response = await notion.blocks.children.append({
    block_id: blockId,
    children: children,
  });
  return response;
};
```

### ブロックの更新

```typescript
// ブロックを更新
const updateBlock = async (blockId: string, properties: any) => {
  const response = await notion.blocks.update({
    block_id: blockId,
    ...properties,
  });
  return response;
};
```

### ブロックの削除

```typescript
// ブロックを削除（アーカイブ）
const deleteBlock = async (blockId: string) => {
  const response = await notion.blocks.delete({
    block_id: blockId,
  });
  return response;
};
```

### ユーザーの取得

```typescript
// ユーザーIDを指定してユーザーを取得
const getUser = async (userId: string) => {
  const response = await notion.users.retrieve({
    user_id: userId,
  });
  return response;
};
```

### ユーザー一覧の取得

```typescript
// ユーザー一覧を取得
const listUsers = async () => {
  const response = await notion.users.list();
  return response;
};
```

### 検索

```typescript
// Notionワークスペース内を検索
const search = async (query: string) => {
  const response = await notion.search({
    query: query,
  });
  return response;
};
```

## ページネーション

Notion API はページネーションをサポートしています。`start_cursor` と `page_size` パラメータを使用して結果を制御できます。

```typescript
// ページネーションを使用してデータベースをクエリ
const queryDatabaseWithPagination = async (databaseId: string) => {
  let hasMore = true;
  let startCursor = undefined;
  const results = [];

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
    });

    results.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return results;
};
```

ヘルパー関数を使用する場合：

```typescript
import { collectPaginatedAPI } from "@notionhq/client";

// すべての結果を収集
const getAllDatabaseItems = async (databaseId: string) => {
  const results = await collectPaginatedAPI(notion.databases.query, {
    database_id: databaseId,
  });
  return results;
};
```

## フィルタリングとソート

### データベースのフィルタリング

```typescript
// タイトルプロパティでフィルタリング
const filterByTitle = async (databaseId: string, titleValue: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Title",
      title: {
        equals: titleValue,
      },
    },
  });
  return response;
};

// 複数条件でフィルタリング (AND)
const filterWithAnd = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Status",
          select: {
            equals: "Done",
          },
        },
        {
          property: "Priority",
          select: {
            equals: "High",
          },
        },
      ],
    },
  });
  return response;
};

// 複数条件でフィルタリング (OR)
const filterWithOr = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        {
          property: "Status",
          select: {
            equals: "In progress",
          },
        },
        {
          property: "Status",
          select: {
            equals: "Not started",
          },
        },
      ],
    },
  });
  return response;
};
```

### データベースのソート

```typescript
// プロパティでソート
const sortByProperty = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Due Date",
        direction: "ascending",
      },
    ],
  });
  return response;
};

// 複数プロパティでソート
const sortByMultipleProperties = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Priority",
        direction: "descending",
      },
      {
        property: "Due Date",
        direction: "ascending",
      },
    ],
  });
  return response;
};

// タイムスタンプでソート
const sortByTimestamp = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        timestamp: "created_time",
        direction: "descending",
      },
    ],
  });
  return response;
};
```

## リッチテキストの作成

```typescript
// リッチテキストオブジェクトの作成
const createRichText = (content: string) => {
  return [
    {
      type: "text",
      text: {
        content: content,
      },
    },
  ];
};

// スタイル付きリッチテキストの作成
const createStyledRichText = (content: string) => {
  return [
    {
      type: "text",
      text: {
        content: content,
      },
      annotations: {
        bold: true,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "blue",
      },
    },
  ];
};

// リンク付きリッチテキストの作成
const createLinkRichText = (content: string, url: string) => {
  return [
    {
      type: "text",
      text: {
        content: content,
        link: {
          url: url,
        },
      },
    },
  ];
};
```

## ブロックコンテンツの作成

```typescript
// 段落ブロックの作成
const createParagraphBlock = (text: string) => {
  return {
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: {
            content: text,
          },
        },
      ],
    },
  };
};

// 見出しブロックの作成
const createHeadingBlock = (text: string, level: 1 | 2 | 3) => {
  const type = `heading_${level}`;
  return {
    type,
    [type]: {
      rich_text: [
        {
          type: "text",
          text: {
            content: text,
          },
        },
      ],
    },
  };
};

// リストブロックの作成
const createBulletedListBlock = (items: string[]) => {
  return items.map((item) => ({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: {
            content: item,
          },
        },
      ],
    },
  }));
};

// ToDoブロックの作成
const createToDoBlock = (text: string, checked: boolean = false) => {
  return {
    type: "to_do",
    to_do: {
      rich_text: [
        {
          type: "text",
          text: {
            content: text,
          },
        },
      ],
      checked: checked,
    },
  };
};

// コードブロックの作成
const createCodeBlock = (code: string, language: string = "javascript") => {
  return {
    type: "code",
    code: {
      rich_text: [
        {
          type: "text",
          text: {
            content: code,
          },
        },
      ],
      language: language,
    },
  };
};
```

## エラーハンドリング

```typescript
import { APIResponseError } from "@notionhq/client";

const safeApiCall = async (apiCall: () => Promise<any>) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof APIResponseError) {
      console.error(`Notion API Error: ${error.code}`);
      console.error(`Message: ${error.message}`);
      
      // エラーコードに基づいた処理
      switch (error.code) {
        case "unauthorized":
          console.error("API キーが無効または期限切れです");
          break;
        case "restricted_resource":
          console.error("このリソースへのアクセス権がありません");
          break;
        case "object_not_found":
          console.error("指定されたオブジェクトが見つかりません");
          break;
        case "rate_limited":
          console.error("レート制限に達しました。しばらく待ってから再試行してください");
          break;
        default:
          console.error("その他のエラーが発生しました");
      }
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
};
```

## 参考リンク

- [Notion API 公式ドキュメント](https://developers.notion.com/docs)
- [Notion JavaScript SDK GitHub](https://github.com/makenotion/notion-sdk-js)
- [Notion API リファレンス](https://developers.notion.com/reference/intro)
