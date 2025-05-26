# リポジトリ層設計

## 基本方針

リポジトリを実装する際は、以下の「ストレージタイプ集約アプローチ」に従ってください。このアプローチは、ストレージメカニズム（LocalStorage、PostgreSQL など）ごとに関連するコードを集約し、AI 駆動開発に最適化されています。

## リポジトリ組織化の原則

### 1. ストレージタイプベースのファイル構成

リポジトリは「エンティティ別」ではなく「ストレージタイプ別」にグループ化してください。特定のストレージメカニズムに関連するリポジトリ実装は、同じディレクトリに配置します。

**良い例:**

```
app/repositories/
├── index.ts          # メインエントリーポイント
├── types.ts          # 共有インターフェース
└── local/            # LocalStorage実装をまとめて配置
    └── index.ts
```

**避けるべき例:**

```
app/repositories/
├── noteRepository.ts
├── articleRepository.ts
└── baseRepository.ts
```

### 2. 新規ディレクトリ作成の基準

以下の場合にのみ新しいディレクトリを作成してください：

- 新しいストレージメカニズム（PostgreSQL、MongoDB など）を追加する場合
- 既存のストレージ実装が大きくなりすぎる（300〜400 行以上）場合
- 特定のストレージタイプに固有の複雑な設定や依存関係がある場合

### 3. インターフェースの扱い

共通のリポジトリインターフェースは `types.ts` に配置してください。以下の原則に従ってください：

- 基本的な CRUD 操作を定義する基底インターフェース
- エンティティ固有の操作を定義する拡張インターフェース
- 型安全性を確保するためのジェネリック型の活用

```typescript
// types.ts
export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  // ...
}

export interface NoteRepository extends Repository<Note> {
  getWithInterviewNotes(id: string): Promise<Note | null>;
  // ...
}
```

### 4. エントリーポイントの設計

`index.ts` をメインのエントリーポイントとして使用し、以下の原則に従ってください：

1. インターフェースと実装の再エクスポート
2. デフォルトのストレージ実装の提供
3. 実装の詳細を隠蔽

```typescript
// index.ts
export * from "./types";
export { noteRepository, articleRepository } from "./local";
```

## 実装ガイドライン

### 1. ストレージ実装

- 各ストレージタイプのディレクトリに `index.ts` を作成
- 関連するヘルパー関数やユーティリティを同じファイルに配置
- ストレージ固有の型や定数も同じファイル内で定義

```typescript
// local/index.ts
const localStorageHelpers = {
  getStorageData: <T>(key: string): T[] => { ... },
  setStorageData: <T>(key: string, data: T[]): void => { ... }
};

function createLocalStorageRepository<T>() { ... }

export const noteRepository = createNoteRepository();
export const articleRepository = createArticleRepository();
```

### 2. エラー処理

- 一貫したエラー処理パターンの使用
- ストレージ固有のエラーを共通のエラー型に変換
- 意味のあるエラーメッセージの提供

### 3. 非同期処理

- Promise ベースの API の一貫した使用
- エラーハンドリングを含む適切な非同期フロー制御
- パフォーマンスを考慮したバッチ処理の実装

## AI 駆動開発に適した実践

### 1. 明確な責任境界

- 各ストレージ実装の責任を明確に定義
- 説明的な関数名とエラーメッセージの使用
- 複雑なロジックには適切なコメントを追加

### 2. 関連コードの共存

- ストレージ固有のコードを同じファイルに保持
- ヘルパー関数は使用される場所の近くに配置
- 関連する型定義とエラー処理をグループ化

### 3. 一貫したパターン

- 同じストレージタイプ内で一貫したパターンを使用
- 共通のエラー処理とバリデーションパターン
- 標準的なメソッド名と引数の規則

### 4. ドキュメント

- 複雑な操作にはコメントを追加
- ストレージ固有の制限事項や注意点を文書化
- 使用例やベストプラクティスの提供

## 新しいストレージタイプの追加

新しいストレージタイプを追加する際は、以下の手順に従ってください：

1. **新しいディレクトリの作成**: ストレージタイプ用のディレクトリを作成
2. **インターフェースの実装**: `types.ts` で定義されたインターフェースの実装
3. **ヘルパー関数の作成**: ストレージ固有のユーティリティ関数の実装
4. **テストの作成**: 実装の正確性を確認するテストの追加
5. **エントリーポイントの更新**: `index.ts` での新しい実装の統合

### 実装例

```typescript
// postgresql/index.ts
import { Pool } from "pg";
import { Repository, NoteRepository } from "../types";
import { Note } from "../../types";

const pool = new Pool(/* 設定 */);

function createPostgresRepository<T>(): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      // PostgreSQL実装
    },
    // ... 他のメソッド
  };
}

// リポジトリの作成と設定
export const noteRepository = createNoteRepository();
export const articleRepository = createArticleRepository();
```

## 既存実装の修正時

1. ストレージメカニズム内での各リポジトリの役割を理解する
2. 既存のパターンと命名規則を維持する
3. 関連する機能を一緒に保持する
4. 同じファイル内の影響を受けるコードを更新する
5. インターフェースの互換性を維持する
