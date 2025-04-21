# @mendable/firecrawl-js

Firecrawlは、ウェブサイトをクロールしてLLM用のマークダウンや構造化データに変換するためのJavaScriptライブラリです。

## インストール

```bash
npm install @mendable/firecrawl-js
```

## 基本的な使い方

```typescript
import FirecrawlApp from '@mendable/firecrawl-js';

// APIキーを使用してクライアントを初期化
const app = new FirecrawlApp({
  apiKey: "fc-YOUR_API_KEY" // Firecrawl APIキー
});
```

## 主要な機能

### 単一URLのスクレイピング

```typescript
// 単一URLをスクレイピング
const scrapeResponse = await app.scrapeUrl('https://example.com', {
  formats: ["markdown", "html", "links"], // 出力形式を指定
  onlyMainContent: true // メインコンテンツのみを抽出
});

if (scrapeResponse.success) {
  console.log(scrapeResponse.markdown); // マークダウン形式のコンテンツ
  console.log(scrapeResponse.html); // HTML形式のコンテンツ
  console.log(scrapeResponse.links); // 抽出されたリンク
}
```

### ウェブサイトのクロール

```typescript
// ウェブサイト全体をクロール
const crawlResponse = await app.crawlUrl('https://example.com', {
  maxDepth: 3, // クロールの最大深度
  limit: 100, // 最大ページ数
  includePaths: ['/blog/*'], // 含めるパス（ワイルドカード対応）
  excludePaths: ['/admin/*'], // 除外するパス
  scrapeOptions: {
    formats: ["markdown"],
    onlyMainContent: true
  }
});

// クロールされたすべてのページにアクセス
if (crawlResponse.success) {
  crawlResponse.data.forEach(page => {
    console.log(page.url);
    console.log(page.markdown);
  });
}
```

### 非同期クロールとWebSocketによる監視

```typescript
// 非同期クロールを開始し、WebSocketで進捗を監視
const crawler = await app.crawlUrlAndWatch('https://example.com', {
  maxDepth: 2,
  limit: 50
});

// 各ドキュメントが処理されるたびにイベントを受信
crawler.addEventListener('document', (event) => {
  console.log(`Processed: ${event.detail.url}`);
});

// クロールが完了したときのイベント
crawler.addEventListener('done', (event) => {
  console.log('Crawl completed!');
  console.log(`Total pages: ${event.detail.data.length}`);
});

// エラーが発生した場合のイベント
crawler.addEventListener('error', (event) => {
  console.error(`Error: ${event.detail.error}`);
});
```

### バッチスクレイピング

```typescript
// 複数のURLを一度にスクレイピング
const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3'
];

const batchResponse = await app.batchScrapeUrls(urls, {
  formats: ["markdown", "html"],
  onlyMainContent: true
});

if (batchResponse.success) {
  batchResponse.data.forEach(page => {
    console.log(page.url);
    console.log(page.markdown);
  });
}
```

### 構造化データの抽出

```typescript
import { z } from 'zod'; // スキーマ検証用

// 抽出するデータのスキーマを定義
const productSchema = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string(),
  features: z.array(z.string())
});

// スキーマを使用してデータを抽出
const scrapeResponse = await app.scrapeUrl('https://example.com/product', {
  formats: ["extract"],
  extract: {
    prompt: "この製品ページから名前、価格、説明、機能リストを抽出してください",
    schema: productSchema
  }
});

if (scrapeResponse.success) {
  const product = scrapeResponse.extract;
  console.log(product.name);
  console.log(product.price);
  console.log(product.description);
  console.log(product.features);
}
```

### ブラウザアクション

```typescript
// ブラウザアクションを使用して複雑なインタラクションを実行
const scrapeResponse = await app.scrapeUrl('https://example.com', {
  actions: [
    { type: "wait", milliseconds: 1000 },
    { type: "click", selector: "#login-button" },
    { type: "wait", selector: "#username" },
    { type: "write", text: "myusername" },
    { type: "click", selector: "#password" },
    { type: "write", text: "mypassword" },
    { type: "click", selector: "#submit" },
    { type: "wait", milliseconds: 2000 },
    { type: "screenshot" }, // スクリーンショットを撮影
    { type: "scrape" } // コンテンツをスクレイピング
  ],
  formats: ["markdown", "html"]
});

// アクションの結果を取得
if (scrapeResponse.success) {
  console.log(scrapeResponse.markdown);
  console.log(scrapeResponse.actions.screenshots[0]); // Base64エンコードされたスクリーンショット
}
```

### 検索

```typescript
// ウェブ検索を実行
const searchResponse = await app.search("firecrawl web scraping", {
  limit: 10, // 結果の最大数
  scrapeOptions: {
    formats: ["markdown"]
  }
});

if (searchResponse.success) {
  searchResponse.data.forEach(result => {
    console.log(result.url);
    console.log(result.markdown);
  });
}
```

### ディープリサーチ

```typescript
// 特定のトピックに関する深い調査を実行
const researchResponse = await app.deepResearch("人工知能の倫理的課題", {
  maxDepth: 5, // 最大調査深度
  maxUrls: 20, // 分析する最大URL数
  timeLimit: 180 // 秒単位の時間制限
}, 
// 活動更新のコールバック
(activity) => {
  console.log(`${activity.type}: ${activity.message}`);
},
// ソース更新のコールバック
(source) => {
  console.log(`Found source: ${source.url} - ${source.title}`);
});

if (researchResponse.success) {
  console.log(researchResponse.data.finalAnalysis); // 最終分析
  console.log(researchResponse.sources); // 使用されたソース
}
```

### LLMs.txtの生成

```typescript
// LLMs.txtファイルを生成
const llmsResponse = await app.generateLLMsText("https://example.com", {
  maxUrls: 50, // 処理する最大URL数
  showFullText: true // 完全なテキストを表示
});

if (llmsResponse.success) {
  console.log(llmsResponse.data.llmstxt); // LLMs.txt形式
  console.log(llmsResponse.data.llmsfulltxt); // 完全なテキスト
}
```

## 主要な型定義

### FirecrawlAppConfig

```typescript
interface FirecrawlAppConfig {
  apiKey?: string | null; // Firecrawl APIキー
  apiUrl?: string | null; // APIのベースURL（デフォルト: 'https://api.firecrawl.dev'）
}
```

### CrawlParams

```typescript
interface CrawlParams {
  includePaths?: string[]; // 含めるパス（ワイルドカード対応）
  excludePaths?: string[]; // 除外するパス
  maxDepth?: number; // クロールの最大深度
  maxDiscoveryDepth?: number; // 発見の最大深度
  limit?: number; // 最大ページ数
  allowBackwardLinks?: boolean; // 後方リンクを許可するか
  allowExternalLinks?: boolean; // 外部リンクを許可するか
  ignoreSitemap?: boolean; // サイトマップを無視するか
  scrapeOptions?: CrawlScrapeOptions; // スクレイピングオプション
  webhook?: string | { /* webhook設定 */ }; // Webhook設定
  deduplicateSimilarURLs?: boolean; // 類似URLを重複排除するか
  ignoreQueryParameters?: boolean; // クエリパラメータを無視するか
  regexOnFullURL?: boolean; // 完全URLに正規表現を適用するか
}
```

### ScrapeParams

```typescript
interface ScrapeParams<LLMSchema extends zt.ZodSchema = any, ActionsSchema extends (Action[] | undefined) = undefined> extends CrawlScrapeOptions {
  extract?: {
    prompt?: string; // 抽出プロンプト
    schema?: LLMSchema; // 抽出スキーマ
    systemPrompt?: string; // システムプロンプト
  };
  jsonOptions?: {
    prompt?: string; // JSON抽出プロンプト
    schema?: LLMSchema; // JSON抽出スキーマ
    systemPrompt?: string; // システムプロンプト
  };
  actions?: ActionsSchema; // ブラウザアクション
}
```

### Action

```typescript
type Action = 
  | { type: "wait"; milliseconds?: number; selector?: string; }
  | { type: "click"; selector: string; }
  | { type: "screenshot"; fullPage?: boolean; }
  | { type: "write"; text: string; }
  | { type: "press"; key: string; }
  | { type: "scroll"; direction?: "up" | "down"; selector?: string; }
  | { type: "scrape"; }
  | { type: "executeJavascript"; script: string; };
```

### FirecrawlDocument

```typescript
interface FirecrawlDocument<T = any, ActionsSchema extends (ActionsResult | never) = never> {
  url?: string; // ドキュメントのURL
  markdown?: string; // マークダウン形式のコンテンツ
  html?: string; // HTML形式のコンテンツ
  rawHtml?: string; // 生のHTML
  links?: string[]; // 抽出されたリンク
  extract?: T; // 抽出されたデータ
  json?: T; // JSON形式のデータ
  screenshot?: string; // スクリーンショット（Base64エンコード）
  metadata?: FirecrawlDocumentMetadata; // メタデータ
  actions: ActionsSchema; // アクション結果
  title?: string; // ページタイトル
  description?: string; // ページ説明
}
```

## 参考リンク

- [公式ドキュメント](https://docs.firecrawl.dev/sdks/node)
- [GitHub](https://github.com/mendableai/firecrawl)
- [npm](https://www.npmjs.com/package/@mendable/firecrawl-js)
