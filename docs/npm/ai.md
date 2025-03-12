# Vercel AI SDK

Vercel AI SDKは、TypeScriptで書かれたAIアプリケーション構築のためのツールキットです。Next.js、React、Svelte、Vue、SolidJSなどのフレームワークと、OpenAI、Anthropic、Google、Mistralなどの様々なAIプロバイダーをサポートしています。

最新バージョン（4.1）では、ミドルウェアシステム、PDF対応、画像生成機能、ノンブロッキングデータストリーミング、ツール呼び出しの改善などが追加されています。

## インストール

```bash
npm install ai
```

特定のモデルプロバイダーを使用する場合は、対応するパッケージもインストールします：

```bash
npm install @ai-sdk/openai  # OpenAIを使用する場合
npm install @ai-sdk/anthropic  # Anthropicを使用する場合
npm install @ai-sdk/google  # Google AIを使用する場合
```

## 主要なモジュール

Vercel AI SDKは主に2つのモジュールで構成されています：

1. **AI SDK Core**: 様々なAIモデルプロバイダーと統一されたAPIで対話するための機能を提供
2. **AI SDK UI**: チャットボットや生成UIを構築するためのフレームワーク非依存のフックを提供

## 最新機能 (v4.1)

### ミドルウェアシステム

言語モデルの動作をカスタマイズするためのミドルウェアシステムが追加されました。

```typescript
import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { openai } from '@ai-sdk/openai';

// 推論プロセスを抽出するミドルウェアを作成
const modelWithReasoning = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: extractReasoningMiddleware({
    tagName: 'reasoning',
  }),
});

// ミドルウェアを適用したモデルを使用
const { text, reasoning } = await generateText({
  model: modelWithReasoning,
  prompt: 'What is the capital of France?',
});

console.log('Answer:', text);
console.log('Reasoning:', reasoning);
```

### PDF対応

PDFファイルを処理するための機能が追加されました。

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';

const pdfData = fs.readFileSync('document.pdf');

const { textStream } = await streamText({
  model: openai('gpt-4o'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Summarize this PDF document' },
        {
          type: 'file',
          data: pdfData,
          mimeType: 'application/pdf'
        }
      ]
    }
  ],
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

### ノンブロッキングデータストリーミング

データストリームを作成して、非同期でデータを送信する機能が追加されました。

```typescript
import { createDataStream, createDataStreamResponse } from 'ai';

// データストリームの作成
const stream = createDataStream({
  execute: async (dataStream) => {
    // テキストデータの送信
    dataStream.write({ type: 'text', text: 'Hello, ' });
    
    // 非同期処理
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // さらにデータを送信
    dataStream.write({ type: 'text', text: 'world!' });
    
    // JSONデータの送信
    dataStream.writeData({
      status: 'complete',
      timestamp: new Date().toISOString()
    });
  }
});

// HTTP応答としてストリームを返す
const response = createDataStreamResponse({
  status: 200,
  headers: {
    'Content-Type': 'text/plain; charset=utf-8'
  },
  execute: async (dataStream) => {
    // データストリームの処理
    // ...
  }
});
```

### 改善されたツール呼び出し

ツール呼び出しの機能が強化され、ストリーミングサポートが改善されました。

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { textStream, toolCalls, toolResults } = await streamText({
  model: openai('gpt-4o'),
  messages: [
    { role: 'user', content: 'What is the weather in Tokyo and New York?' }
  ],
  // ツール呼び出しのストリーミングを有効化
  toolCallStreaming: true,
  tools: {
    getWeather: {
      description: 'Get the current weather in a location',
      parameters: z.object({
        location: z.string().describe('The city and state, e.g. San Francisco, CA'),
      }),
      execute: async ({ location }) => {
        // 実際のAPIを呼び出す代わりにモックデータを返す
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          temperature: location.includes('Tokyo') ? 22 : 18,
          condition: 'sunny',
          humidity: 65
        };
      },
    },
  },
});

// ストリーミングされたテキストを処理
for await (const chunk of textStream) {
  process.stdout.write(chunk);
}

// ツール呼び出しと結果を確認
console.log('Tool calls:', await toolCalls);
console.log('Tool results:', await toolResults);
```

## AI SDK Core の主要機能

### テキスト生成 (generateText / streamText)

```typescript
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// 非ストリーミング版
const { text } = await generateText({
  model: openai('gpt-4o'),
  system: 'You are a helpful assistant.',
  prompt: 'Why is the sky blue?',
});

console.log(text);

// ストリーミング版
const { textStream } = await streamText({
  model: openai('gpt-4o'),
  system: 'You are a helpful assistant.',
  prompt: 'Why is the sky blue?',
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

### 構造化データ生成 (generateObject / streamObject)

```typescript
import { generateObject, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// 非ストリーミング版
const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
  }),
  prompt: 'Write a blog post about the ocean.',
});

console.log(object);
// {
//   title: 'The Majestic Ocean: Earth\'s Final Frontier',
//   content: '...',
//   tags: ['ocean', 'nature', 'environment']
// }

// ストリーミング版
const { partialObjectStream } = await streamObject({
  model: openai('gpt-4o'),
  schema: z.object({
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
  }),
  prompt: 'Write a blog post about the ocean.',
});

for await (const partialObject of partialObjectStream) {
  console.log(partialObject);
}
```

### ツール呼び出し (Tool Calling)

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { textStream } = await streamText({
  model: openai('gpt-4o'),
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the weather in San Francisco?' },
  ],
  tools: {
    getWeather: {
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => {
        return { temperature: 72, condition: 'sunny' };
      },
    },
  },
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

### 埋め込み生成 (embed / embedMany)

```typescript
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// 単一テキストの埋め込み
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'Hello, world!',
});

// 複数テキストの埋め込み
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: ['Hello, world!', 'How are you?'],
});
```

### 画像生成 (generateImage)

```typescript
import { generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'A cat sitting on a beach watching the sunset',
});

console.log(image.base64); // Base64エンコードされた画像データ
```

## AI SDK UI の主要機能

### React Hooks

```tsx
'use client';

import { useChat, useCompletion } from 'ai/react';

// チャットインターフェース用
export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      <ul>
        {messages.map((message, i) => (
          <li key={i}>
            {message.role}: {message.content}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// テキスト補完用
export function CompletionComponent() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion();

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Write a prompt..."
        />
        <button type="submit">Generate</button>
      </form>
      <div>{completion}</div>
    </div>
  );
}
```

### Next.js App Router との統合

```tsx
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

### React Server Components (RSC) との統合

```tsx
// app/page.tsx
import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

export async function generateUI() {
  return streamUI({
    model: openai('gpt-4o'),
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a poem about the ocean.' },
    ],
    text: ({ content, delta, done }) => {
      if (done) {
        return <div className="poem">{content}</div>;
      }

      return (
        <div className="poem">
          {content}
          <span className="cursor" />
        </div>
      );
    },
  });
}
```

## サポートされているプロバイダー

- OpenAI
- Anthropic
- Google AI (Gemini)
- Mistral AI
- Cohere
- Fireworks
- その他多数

## サポートされているフレームワーク

- React
- Next.js
- Svelte
- Vue
- Solid
- Node.js

## 参考リンク

- [公式ドキュメント](https://sdk.vercel.ai/docs)
- [GitHub リポジトリ](https://github.com/vercel/ai)
- [API リファレンス](https://sdk.vercel.ai/docs/reference)
- [AI SDK Core ドキュメント](https://sdk.vercel.ai/docs/ai-sdk-core)
- [AI SDK UI ドキュメント](https://sdk.vercel.ai/docs/ai-sdk-ui/overview)
- [AI SDK 4.1 の新機能](https://vercel.com/blog/ai-sdk-4-1)
- [サンプルテンプレート](https://vercel.com/templates?type=ai)
