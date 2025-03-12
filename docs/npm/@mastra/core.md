# @mastra/core

Mastraは、AI駆動アプリケーションを構築するためのTypeScriptフレームワークです。`@mastra/core`はMastraフレームワークの中核となるパッケージで、AIエージェント、ワークフロー、ツール、メモリ管理などの基本機能を提供します。

## インストール

```bash
npm install @mastra/core
```

## 主要コンポーネント

### Agent

AIエージェントを作成・管理するためのクラス。LLMを使用して、ユーザーの入力に応答したり、ツールを使用したりします。

```typescript
import { Agent } from "@mastra/core/agent";
import { openai } from "@mastra/core/llm";

// 基本的なエージェントの作成
const agent = new Agent({
  name: "my-agent",
  instructions: "あなたは役立つアシスタントです。",
  model: openai("gpt-4o-mini"), // OpenAIのモデルを使用
});

// エージェントを使用してテキストを生成
const result = await agent.generate("こんにちは、今日の天気は？");
console.log(result.text);

// ストリーミングレスポンスの取得
const stream = await agent.stream("こんにちは、今日の天気は？");
for await (const chunk of stream) {
  console.log(chunk.text);
}
```

### Tool

エージェントが使用できるツールを作成するための機能。

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// ツールの作成
const weatherTool = createTool({
  id: "weatherTool",
  description: "特定の場所の現在の天気データを取得します",
  inputSchema: z.object({
    location: z.string().describe("都市名と州、例：東京都"),
  }),
  async execute({ context }) {
    const { location } = context;
    // 実際のアプリケーションでは、ここで天気APIを呼び出します
    return {
      temperature: 22,
      conditions: "晴れ",
      humidity: 45,
      windSpeed: 8,
      location,
    };
  },
});

// ツールをエージェントに追加
const weatherAgent = new Agent({
  name: "weather-agent",
  instructions: `あなたは天気アシスタントです。
  
  回答する際は:
  - 場所が提供されていない場合は常に場所を尋ねてください
  - 湿度、風の状態、降水量などの関連詳細を含めてください
  - 回答は簡潔で情報量が多いようにしてください
  
  weatherToolを使用して現在の天気データを取得してください。`,
  model: openai("gpt-4o-mini"),
  tools: { weatherTool },
});
```

### Workflow

複雑なプロセスを調整するためのワークフローを作成・管理するための機能。

```typescript
import { Workflow } from "@mastra/core/workflow";
import { createStep } from "@mastra/core/workflow";
import { z } from "zod";

// ステップの作成
const fetchDataStep = createStep({
  id: "fetchData",
  description: "データを取得するステップ",
  inputSchema: z.object({
    userId: z.string(),
  }),
  async execute({ context }) {
    const { userId } = context;
    // データ取得ロジック
    return { userData: { name: "ユーザー", id: userId } };
  },
});

const processDataStep = createStep({
  id: "processData",
  description: "データを処理するステップ",
  inputSchema: z.object({
    userData: z.object({
      name: z.string(),
      id: z.string(),
    }),
  }),
  async execute({ context }) {
    const { userData } = context;
    // データ処理ロジック
    return { result: `処理完了: ${userData.name}` };
  },
});

// ワークフローの作成
const myWorkflow = new Workflow({
  name: "data-workflow",
  triggerSchema: z.object({
    userId: z.string(),
  }),
});

// ワークフローにステップを追加
myWorkflow.step(fetchDataStep)
  .then(processDataStep)
  .commit();

// ワークフローの実行
const run = myWorkflow.createRun();
const result = await run.start({
  triggerData: { userId: "123" },
});
```

### Memory

会話履歴や文脈情報を保存・取得するためのメモリシステム。

```typescript
import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";

// メモリの作成
const memory = new Memory({
  name: "conversation-memory",
});

// メモリをエージェントに追加
const agentWithMemory = new Agent({
  name: "memory-agent",
  instructions: "あなたは過去の会話を覚えているアシスタントです。",
  model: openai("gpt-4o-mini"),
  memory: memory,
});

// スレッドIDとリソースIDを指定して会話を継続
const result = await agentWithMemory.generate("こんにちは", {
  resourceId: "user-123",
  threadId: "conversation-1",
});
```

### Vector

ベクトル検索と埋め込みを管理するための機能。RAG（Retrieval Augmented Generation）システムの構築に使用されます。

```typescript
import { MastraVector } from "@mastra/core/vector";
import { LibSQLVector } from "@mastra/vector-libsql";

// ベクトルストアの作成
const vectorStore = new LibSQLVector({
  connectionUrl: "libsql://localhost:8080",
});

// インデックスの作成
await vectorStore.createIndex({
  indexName: "documents",
  dimension: 1536, // OpenAI埋め込みの次元数
});

// ベクトルの追加
await vectorStore.upsert({
  indexName: "documents",
  vectors: [[0.1, 0.2, ...]], // 埋め込みベクトル
  metadata: [{ title: "ドキュメント1", content: "テキスト内容..." }],
  ids: ["doc-1"],
});

// ベクトル検索
const results = await vectorStore.query({
  indexName: "documents",
  queryVector: [0.1, 0.2, ...], // クエリベクトル
  topK: 5,
});
```

### Telemetry

テレメトリデータを収集・管理するための機能。OpenTelemetryと統合されています。

```typescript
import { Telemetry } from "@mastra/core/telemetry";

// テレメトリの初期化
const telemetry = Telemetry.init({
  serviceName: "my-ai-service",
  sampling: {
    type: "always_on",
  },
  export: {
    type: "console", // コンソールに出力
  },
});

// テレメトリをクラスに適用
telemetry.traceClass(myInstance, {
  spanNamePrefix: "my-service",
  attributes: { service: "ai-assistant" },
});
```

## 主要な型定義

- `Agent`: AIエージェントのインターフェース
- `AgentConfig`: エージェントの設定オプション
- `AgentContext`: エージェントハンドラに渡されるコンテキストオブジェクト
- `AgentMessage`: エージェント通信用のメッセージオブジェクト
- `AgentTool`: エージェント機能を拡張するためのツールインターフェース
- `LLM`: 大規模言語モデルのインターフェース
- `MemoryManager`: 会話メモリを管理するためのインターフェース
- `VectorStore`: ベクトルストレージと検索のインターフェース
- `Workflow`: ワークフローを定義するためのクラス
- `Step`: ワークフローのステップを定義するためのクラス

## 主要な関数

- `createAgent`: エージェントインスタンスを作成する関数
- `createTool`: ツールを作成する関数
- `createStep`: ワークフローステップを作成する関数
- `createLogger`: ロガーを作成する関数
- `createMemoryManager`: メモリマネージャーを作成する関数
- `createVectorStore`: ベクトルストアを作成する関数

## 詳細情報

- [Mastra公式ドキュメント](https://mastra.ai/docs)
- [GitHub リポジトリ](https://github.com/mastra-ai/mastra)
