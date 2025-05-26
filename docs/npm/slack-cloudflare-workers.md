# slack-cloudflare-workers チートシート

`slack-cloudflare-workers` は、[slack-edge](https://github.com/slack-edge/slack-edge) をベースに、Cloudflare Workers 環境で Slack アプリケーションを開発するためのフレームワークです。Cloudflare KV を利用して、OAuth フローに必要な Installation Store と State Store を簡単に実装できます。

## 目次

- [インストール](#インストール)
- [主要コンポーネント](#主要コンポーネント)
  - [KVInstallationStore](#1-kvinstallationstore)
  - [KVStateStore](#2-kvstatestore)
- [基本的な使い方](#基本的な使い方)
- [SlackApp 設定メソッド](#slackapp-設定メソッド)
- [イベントハンドラーでの context オブジェクト](#イベントハンドラーでの-context-オブジェクト)
- [スレッドの操作](#スレッドの操作)
- [主要な概念と型](#主要な概念と型)
- [注意点](#注意点)
- [参考リンク](#参考リンク)

## インストール

```bash
npm install slack-cloudflare-workers
# slack-edge も必要です
npm install slack-edge
```

## 主要コンポーネント

`slack-cloudflare-workers` は主に `slack-edge` の機能を継承・拡張しています。ここでは Cloudflare Workers 固有の機能に焦点を当てます。

### 1. KVInstallationStore

Cloudflare KV を使用して Slack アプリのインストール情報（トークンなど）を永続化します。

**型:** `KVInstallationStore<E extends SlackOAuthEnv>` (slack-edge の `InstallationStore<E>` を実装)

**主なメソッド:**

- `save(installation: Installation, request?: Request): Promise<void>` - インストール情報を保存
- `findBotInstallation(query: InstallationStoreQuery): Promise<Installation | undefined>` - ボットトークンに関連するインストール情報を検索
- `findUserInstallation(query: InstallationStoreQuery): Promise<Installation | undefined>` - ユーザートークンに関連するインストール情報を検索
- `deleteBotInstallation(query: InstallationStoreQuery): Promise<void>` - ボットのインストール情報を削除
- `deleteUserInstallation(query: InstallationStoreQuery): Promise<void>` - ユーザーのインストール情報を削除
- `deleteAll(query: InstallationStoreQuery): Promise<void>` - 関連する全てのインストール情報を削除
- `toAuthorize(): Authorize<E>` - `slack-edge` の認証ミドルウェアで使用される Authorize 関数を返す

### 2. KVStateStore

Cloudflare KV を使用して OAuth 2.0 フローの `state` パラメータを管理し、CSRF 攻撃を防ぎます。

**型:** `KVStateStore` (slack-edge の `StateStore` を実装)

**主なメソッド:**

- `issueNewState(): Promise<string>` - 新しい `state` 値を生成し、KV に保存して返す
- `consume(state: string): Promise<boolean>` - 提供された `state` 値が KV に存在するか検証し、存在すれば削除して `true` を返す

## 基本的な使い方

```typescript
import { SlackApp } from "slack-edge";
import { KVInstallationStore, KVStateStore } from "slack-cloudflare-workers";
import { KVNamespace } from "@cloudflare/workers-types";

// Cloudflare Worker の環境変数や KVNamespace を想定
declare const SLACK_SIGNING_SECRET: string;
declare const SLACK_BOT_TOKEN: string; // シングルワークスペース用、またはフォールバック
declare const SLACK_CLIENT_ID: string;
declare const SLACK_CLIENT_SECRET: string;
declare const SLACK_BOT_SCOPES: string;
declare const INSTALLATIONS_KV: KVNamespace; // KV Namespace のバインディング名

// 環境変数を型付け
interface Env {
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN: string;
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_BOT_SCOPES: string;
  INSTALLATIONS_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Installation Store を KV で初期化
    const installationStore = new KVInstallationStore(env, env.INSTALLATIONS_KV);
    // State Store も KV で初期化
    const stateStore = new KVStateStore(env.INSTALLATIONS_KV); // 同じ KV Namespace を使用可能

    const app = new SlackApp({
      env: {
        SLACK_SIGNING_SECRET: env.SLACK_SIGNING_SECRET,
        SLACK_BOT_TOKEN: env.SLACK_BOT_TOKEN, // オプショナル: シングルワークスペース用
        SLACK_CLIENT_ID: env.SLACK_CLIENT_ID,
        SLACK_CLIENT_SECRET: env.SLACK_CLIENT_SECRET,
        SLACK_BOT_SCOPES: env.SLACK_BOT_SCOPES,
        // slack-edge が InstallationStore と StateStore を認識
        installationStore,
        stateStore,
      },
      // ... 他の slack-edge 設定 (event handlers, commands, etc.)
    });

    return await app.run(request, ctx);
  },
};
```

## SlackApp 設定メソッド

`SlackApp` インスタンス (`new SlackApp({...})`) の後に、以下のメソッドをチェインしてイベントハンドラやミドルウェアを設定できます。

### 認証とミドルウェア

| メソッド | 説明 | 型 |
|---------|------|-----|
| `.beforeAuthorize(middleware)` | 認証処理の*前*に実行されるミドルウェアを追加 | `(req: PreAuthorizeSlackMiddlewareRequest<E>) => Promise<SlackResponse \| void>` |
| `.middleware(middleware)` / `.use(middleware)` / `.afterAuthorize(middleware)` | 認証処理の*後*に実行されるミドルウェアを追加 | `(req: SlackMiddlewareRequest<E>) => Promise<SlackResponse \| void>` |

### コマンドとイベント

| メソッド | 説明 | パラメータ |
|---------|------|------------|
| `.command(pattern, ack, lazy?)` | スラッシュコマンドのハンドラを追加 | `pattern`: コマンド名<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |
| `.function(callbackId, lazy)` | Workflow Builder のカスタム関数実行イベントのハンドラを追加 | `callbackId`: 関数の callback_id<br>`lazy`: 非同期処理 |
| `.event(eventType, lazy)` | 指定された Events API イベントのハンドラを追加 | `eventType`: イベントタイプ<br>`lazy`: 非同期処理 |

### Assistant 関連

| メソッド | 説明 | パラメータ |
|---------|------|------------|
| `.assistant(assistant)` | Slack Assistant 機能のハンドラ群をまとめて登録 | `assistant`: `Assistant<E>` インスタンス |
| `.assistantThreadStarted(lazy)` | Assistant スレッド開始イベントのハンドラを追加 | `lazy`: イベントハンドラ関数 |
| `.assistantThreadContextChanged(lazy)` | Assistant スレッドコンテキスト変更イベントのハンドラを追加 | `lazy`: イベントハンドラ関数 |
| `.assistantUserMessage(lazy)` | Assistant スレッド内のユーザーメッセージイベントのハンドラを追加 | `lazy`: イベントハンドラ関数 |
| `.assistantBotMessage(lazy)` | Assistant スレッド内のボットメッセージイベントのハンドラを追加 | `lazy`: イベントハンドラ関数 |

### メッセージ関連

| メソッド | 説明 | パラメータ |
|---------|------|------------|
| `.anyMessage(lazy)` | すべてのメッセージイベントのハンドラを追加 | `lazy`: イベントハンドラ関数 |
| `.message(pattern, lazy)` | 特定のパターンにマッチするメッセージイベントのハンドラを追加 | `pattern`: メッセージテキストのパターン<br>`lazy`: イベントハンドラ関数 |

### ショートカットとアクション

| メソッド | 説明 | パラメータ |
|---------|------|------------|
| `.shortcut(callbackId, ack, lazy?)` | グローバルショートカットまたはメッセージショートカットのハンドラを追加 | `callbackId`: ショートカットの callback_id<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |
| `.globalShortcut(callbackId, ack, lazy?)` | グローバルショートカットのハンドラを追加 | `callbackId`: ショートカットの callback_id<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |
| `.messageShortcut(callbackId, ack, lazy?)` | メッセージショートカットのハンドラを追加 | `callbackId`: ショートカットの callback_id<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |
| `.action(constraints, ack, lazy?)` | Block Kit のインタラクションのハンドラを追加 | `constraints`: action_id または block_id/action_id<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |
| `.options(constraints, ack)` | Block Kit の外部データソース選択メニューのハンドラを追加 | `constraints`: action_id または block_id/action_id<br>`ack`: 同期処理 |

### ビュー関連

| メソッド | 説明 | パラメータ |
|---------|------|------------|
| `.view(callbackId, ack, lazy?)` | モーダルビューの送信またはクローズイベントのハンドラを追加 | `callbackId`: ビューの callback_id<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |
| `.viewSubmission(callbackId, ack, lazy?)` | モーダルビューの送信イベントのハンドラを追加 | `callbackId`: ビューの callback_id<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |
| `.viewClosed(callbackId, ack, lazy?)` | モーダルビューのクローズイベントのハンドラを追加 | `callbackId`: ビューの callback_id<br>`ack`: 同期処理<br>`lazy`: 非同期処理(任意) |

## イベントハンドラーでの context オブジェクト

イベントハンドラー（例: `.event('app_mention', async ({ context }) => { ... })`）で利用できる `context` オブジェクトには、Slack APIとのやり取りに役立つ様々なプロパティとメソッドが含まれています。

### 主要なプロパティとメソッド

イベントタイプに応じて、以下のプロパティとメソッドが利用可能です：

#### 基本プロパティ（すべてのイベント）

- `client: SlackAPIClient` - Slack API呼び出しのためのクライアント
- `botToken: string` - ボットのアクセストークン
- `botId: string` - ボットのID
- `botUserId: string` - ボットのユーザーID
- `userToken?: string` - ユーザーのアクセストークン（存在する場合）
- `authorizeResult: AuthorizeResult` - 認証結果
- `teamId?: string` - チームID
- `enterpriseId?: string` - エンタープライズID（存在する場合）
- `userId?: string` - ユーザーID
- `channelId?: string` - チャンネルID（存在する場合）
- `threadTs?: string` - スレッドのタイムスタンプ（存在する場合）
- `custom: { [key: string]: any }` - カスタムデータを格納できるオブジェクト

#### チャンネルIDを持つイベント（app_mention, message など）

- `channelId: string` - イベントが発生したチャンネルのID
- `say: (params: Omit<ChatPostMessageRequest, "channel">) => Promise<ChatPostMessageResponse>` - チャンネルにメッセージを送信するためのユーティリティ関数

#### response_url を持つイベント（スラッシュコマンドなど）

## スレッドの操作

### メンションに対してスレッドを作成して返信する

ユーザーからのメンションに対して、スレッドを作成して返信するには、`thread_ts` パラメータを使用します。メンションイベントのタイムスタンプ（`ts`）をスレッドの親として指定することで、そのメッセージに対するスレッドを作成できます。

```typescript
app.event('app_mention', async ({ context, payload }) => {
  // メンションメッセージのタイムスタンプを取得
  const mentionTs = payload.event.ts;
  
  // メンションに対してスレッドを作成して返信
  await context.say({
    text: "こんにちは！このスレッドで会話を続けましょう。",
    thread_ts: mentionTs // メンションメッセージをスレッドの親として指定
  });
  
  // 追加の返信も同じスレッドに送信
  await context.say({
    text: "何かお手伝いできることはありますか？",
    thread_ts: mentionTs
  });
});
```

### スレッド内での会話を継続する

スレッド内でユーザーからの返信を受け取った場合、同じスレッド内で会話を継続するには、`context.threadTs` を使用します。

```typescript
app.event('message', async ({ context, payload }) => {
  // スレッド内のメッセージかどうかを確認
  if (context.threadTs) {
    // スレッド内のメッセージの場合
    await context.say({
      text: "スレッド内での返信を受け取りました！",
      thread_ts: context.threadTs // 同じスレッドに返信
    });
  }
});
```

### スレッドを使った会話の完全な例

以下は、メンションに対してスレッドを作成し、そのスレッド内で会話を継続する完全な例です：

```typescript
import { SlackApp } from "slack-edge";
import { KVInstallationStore, KVStateStore } from "slack-cloudflare-workers";

// アプリの初期化
const app = new SlackApp({
  env: {
    // 環境変数など
  }
});

// メンションイベントのハンドラー
app.event('app_mention', async ({ context, payload }) => {
  // メンションメッセージのタイムスタンプを取得
  const mentionTs = payload.event.ts;
  
  // メンションに対してスレッドを作成して返信
  await context.say({
    text: "こんにちは！このスレッドで会話を続けましょう。",
    thread_ts: mentionTs
  });
  
  // スレッド内の会話を追跡するために、メッセージIDを保存することもできます
  // 例: データベースやKVストアに保存
});

// スレッド内のメッセージを処理するハンドラー
app.message(/.+/, async ({ context, payload }) => {
  // スレッド内のメッセージかどうかを確認
  if (context.threadTs && !payload.bot_id) {
    // ユーザーからのスレッド内メッセージの場合
    
    // メッセージの内容に基づいて処理
    const messageText = payload.text.toLowerCase();
    
    if (messageText.includes('ヘルプ')) {
      await context.say({
        text: "以下のコマンドが利用できます：\n- ヘルプ: このメッセージを表示\n- 情報: アプリについての情報\n- 終了: 会話を終了",
        thread_ts: context.threadTs
      });
    } else if (messageText.includes('情報')) {
      await context.say({
        text: "このアプリはslack-cloudflare-workersを使用して作成されています。",
        thread_ts: context.threadTs
      });
    } else if (messageText.includes('終了')) {
      await context.say({
        text: "会話を終了します。また何かあればメンションしてください！",
        thread_ts: context.threadTs
      });
    } else {
      // その他のメッセージに対する応答
      await context.say({
        text: `「${payload.text}」というメッセージを受け取りました。何かお手伝いできることはありますか？`,
        thread_ts: context.threadTs
      });
    }
  }
});
```
- `respond: (params: WebhookParams) => Promise<Response>` - response_url を使用してメッセージを送信するためのユーティリティ関数

### スレッドのメッセージ一覧を取得する

`context.client` を使用して、スレッド内のメッセージ一覧を取得できます。`conversations.replies` メソッドを使用します：

```typescript
app.event('app_mention', async ({ context, payload }) => {
  // スレッド内のメッセージを取得
  if (context.threadTs) {
    // スレッド内のメンションの場合
    const threadTs = context.threadTs;
    
    // conversations.replies APIを呼び出してスレッド内のメッセージを取得
    const result = await context.client.conversations.replies({
      channel: context.channelId,
      ts: threadTs,
      // オプションでメッセージ数を制限できます
      limit: 100
    });
    
    // 取得したメッセージを処理
    const messages = result.messages;
    console.log(`スレッド内のメッセージ数: ${messages?.length}`);
    
    // メッセージの内容に基づいて処理を行う
    // 例: 最新の5つのメッセージのテキストを取得
    const recentMessages = messages?.slice(-5).map(msg => msg.text);
    
    // 返信する
    await context.say({
      text: `このスレッドの最近のメッセージ: ${recentMessages?.join(' | ')}`,
      thread_ts: threadTs // 同じスレッドに返信
    });
  } else {
    // スレッド外のメンションの場合
    // 新しいスレッドを開始する返信
    await context.say({
      text: "これは新しいスレッドの開始です",
      thread_ts: payload.event.ts // メンションメッセージをスレッドの親にする
    });
  }
});
```

### ページネーションを使用した大量のメッセージの取得

スレッド内のメッセージが多い場合は、ページネーションを使用して全てのメッセージを取得できます：

```typescript
async function getAllThreadMessages(client, channelId, threadTs) {
  let allMessages = [];
  let cursor = undefined;
  
  do {
    // APIを呼び出してメッセージを取得
    const result = await client.conversations.replies({
      channel: channelId,
      ts: threadTs,
      limit: 100,
      cursor: cursor
    });
    
    // 取得したメッセージを追加
    if (result.messages) {
      allMessages = allMessages.concat(result.messages);
    }
    
    // 次のページがあるか確認
    cursor = result.response_metadata?.next_cursor;
  } while (cursor);
  
  return allMessages;
}

app.event('app_mention', async ({ context }) => {
  if (context.threadTs) {
    // 全てのスレッドメッセージを取得
    const allMessages = await getAllThreadMessages(
      context.client, 
      context.channelId, 
      context.threadTs
    );
    
    // メッセージを処理
    console.log(`スレッド内の全メッセージ数: ${allMessages.length}`);
    
    // 返信
    await context.say({
      text: `このスレッドには合計 ${allMessages.length} 件のメッセージがあります`,
      thread_ts: context.threadTs
    });
  }
});
```

### メッセージの送信者を判別する

`conversations.replies` で取得したメッセージが、ユーザーからのものかアプリ（ボット）からのものかを判別するには、メッセージオブジェクトのプロパティを確認します：

```typescript
app.event('app_mention', async ({ context }) => {
  if (context.threadTs) {
    // スレッド内のメッセージを取得
    const result = await context.client.conversations.replies({
      channel: context.channelId,
      ts: context.threadTs
    });
    
    if (result.messages) {
      // メッセージを送信者タイプ別に分類
      const userMessages = [];
      const botMessages = [];
      const appMessages = [];
      const systemMessages = [];
      
      for (const message of result.messages) {
        // ユーザーからのメッセージ
        if (message.user && !message.bot_id && !message.subtype) {
          userMessages.push(message);
        }
        // ボットからのメッセージ (subtype: bot_message)
        else if (message.subtype === 'bot_message') {
          botMessages.push(message);
        }
        // アプリからのメッセージ (bot_id あり)
        else if (message.bot_id) {
          // 自分のアプリからのメッセージかチェック
          if (message.bot_id === context.botId) {
            appMessages.push(message);
          } else {
            // 他のアプリからのメッセージ
            botMessages.push(message);
          }
        }
        // システムメッセージ (その他の subtype)
        else if (message.subtype) {
          systemMessages.push(message);
        }
      }
      
      // 結果を表示
      await context.say({
        text: `このスレッドには:\n` +
              `- ユーザーからのメッセージ: ${userMessages.length}件\n` +
              `- ボットからのメッセージ: ${botMessages.length}件\n` +
              `- このアプリからのメッセージ: ${appMessages.length}件\n` +
              `- システムメッセージ: ${systemMessages.length}件`,
        thread_ts: context.threadTs
      });
    }
  }
});
```

### メッセージオブジェクトの主要なプロパティ

メッセージの送信者を判別するために重要なプロパティ：

| プロパティ | 説明 |
|----------|------|
| `user` | メッセージを送信したユーザーのID。通常のユーザーが送信した場合に存在します。 |
| `bot_id` | メッセージを送信したボット（アプリ）のID。ボットが送信した場合に存在します。 |
| `subtype` | メッセージのサブタイプ。`bot_message`の場合はボットからのメッセージです。その他にも`channel_join`（チャンネル参加）、`file_share`（ファイル共有）などがあります。 |
| `username` | ボットメッセージの場合に表示される名前。 |
| `app_id` | メッセージを送信したアプリのID。 |
| `team` | メッセージが送信されたチームのID。 |
| `ts` | メッセージのタイムスタンプ（一意の識別子としても機能）。 |
| `thread_ts` | メッセージがスレッド内の場合、親メッセージのタイムスタンプ。 |
| `text` | メッセージのテキスト内容。 |

### 特定のユーザーのメッセージのみを抽出する例

```typescript
app.event('app_mention', async ({ context }) => {
  if (context.threadTs) {
    const messages = await getAllThreadMessages(
      context.client, 
      context.channelId, 
      context.threadTs
    );
    
    // 特定のユーザーのメッセージのみを抽出
    const targetUserId = 'U12345678';
    const userMessages = messages.filter(msg => msg.user === targetUserId);
    
    // 自分のアプリのメッセージのみを抽出
    const myAppMessages = messages.filter(msg => msg.bot_id === context.botId);
    
    // 時系列順にメッセージを処理（古い順）
    const chronologicalMessages = messages.sort((a, b) => {
      return parseFloat(a.ts) - parseFloat(b.ts);
    });
    
    // 最新のユーザーメッセージを取得
    const latestUserMessage = messages
      .filter(msg => msg.user && !msg.bot_id)
      .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts))[0];
    
    if (latestUserMessage) {
      await context.say({
        text: `最新のユーザーメッセージ: ${latestUserMessage.text}`,
        thread_ts: context.threadTs
      });
    }
  }
});
```

### 使用例

```typescript
// app_mention イベントハンドラーの例
app.event('app_mention', async ({ context }) => {
  // context.client を使用して Slack API を呼び出す
  await context.client.chat.postMessage({
    channel: context.channelId,
    text: "メンションありがとうございます！",
    thread_ts: context.threadTs // スレッド内の場合はスレッドに返信
  });
  
  // または context.say を使用して簡潔に書くこともできる
  await context.say({
    text: "context.say を使った返信です",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Block Kit* を使った返信もできます"
        }
      }
    ]
  });
});

// スラッシュコマンドハンドラーの例
app.command('/hello', 
  async (req) => {
    // ack 関数（3秒以内に応答する必要がある）
    return "こんにちは！";
  },
  async ({ context }) => {
    // lazy 関数（時間のかかる処理を行える）
    // context.respond を使用して非同期で返信
    await context.respond({
      text: "これは非同期の返信です",
      response_type: "in_channel" // チャンネル内に表示
    });
  }
);
```

## 主要な概念と型

- **`InstallationStore<E>` (`slack-edge`):** Slack アプリのインストール情報を永続化するためのインターフェース
  - **`Installation` (`slack-edge`):** 個々のインストール情報を表すオブジェクト
  - **`InstallationStoreQuery` (`slack-edge`):** インストール情報を検索するためのクエリ条件
  - **`SlackOAuthEnv` (`slack-edge`):** Slack OAuth に必要な環境変数の型定義

- **`StateStore` (`slack-edge`):** OAuth フローの `state` パラメータを管理するためのインターフェース

- **`KVNamespace` (`@cloudflare/workers-types`):** Cloudflare KV ストアへのアクセスを提供するインターフェース

- **`SlackApp` (`slack-edge`):** Slack アプリケーションの本体。イベントハンドラ、コマンド、インタラクションなどを設定し、リクエストを処理

## 注意点

- `slack-cloudflare-workers` は `slack-edge` に依存しています。`slack-edge` のドキュメントも合わせて参照してください。
- Cloudflare Workers の KV Namespace を事前に作成し、Worker にバインドしておく必要があります。
- KV のキー設計は `KVInstallationStore` 内部で行われますが、必要に応じて `toBotInstallationQuery`, `toUserInstallationQuery`, `toBotInstallationKey`, `toUserInstallationKey` 関数を利用してキーを確認できます。

## 参考リンク

- **GitHub Repository:** [https://github.com/slack-edge/slack-cloudflare-workers](https://github.com/slack-edge/slack-cloudflare-workers)
- **npm Package:** [https://www.npmjs.com/package/slack-cloudflare-workers](https://www.npmjs.com/package/slack-cloudflare-workers)
- **Base Framework (slack-edge):** [https://github.com/slack-edge/slack-edge](https://github.com/slack-edge/slack-edge)
