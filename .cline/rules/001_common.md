# AI 駆動開発のためのコーディングガイドライン

## 基本原則: コンテキスト最適化アプローチ

関連するコードを同じファイルに集約し、ファイル数を最小限に抑えることで、AI がコードを理解しやすくします。

- **コンテキスト依存の最小化**: 必要なファイル数を減らす
- **関連コードの集約**: 機能的に関連するコードを同じファイルに配置
- **明確な責任境界**: 各ファイルの役割と責任を明確に定義
- **一貫したパターン**: すべての層で同じ設計パターンを適用

## コンポーネント層設計

### 組織化原則

- **機能ベースのファイル構成**: コンポーネントは「タイプ別」ではなく「機能別」にグループ化
- **新規ファイル作成基準**: 独立した機能、大きすぎるファイル(500 行以上)、複数機能で使用される共通コードの場合のみ
- **共有コンポーネント**: 再利用可能なコンポーネントは`shared.tsx`に配置
- **ファイル内構造**: ヘルパーコンポーネント → メインコンポーネントの順で配置

### 実装パターン

```tsx
// app/components/feature-name.tsx

// 依存関係のインポート
import { useState } from "react";
import type { RequiredTypes } from "~/types";

// ヘルパーコンポーネント
function HelperComponent({ prop1, prop2 }) {
  // 実装
}

// メインコンポーネント
export function MainFeature() {
  // 状態管理
  const [state, setState] = useState(initialValue);

  // イベントハンドラ
  const handleEvent = () => {
    // 実装
  };

  // レンダリング
  return (
    <div>
      <HelperComponent prop1={value} prop2={value} />
    </div>
  );
}
```

## ストア層設計

### 組織化原則

- **ドメインベースのファイル構成**: ストアは「グローバル」ではなく「ドメイン別」に分割（例：`app/stores/status-bar.ts`）
- **明確な責任境界**: 各ストアは特定の機能ドメインに関連する状態のみを管理
- **Zustand の活用**: シンプルな API を活用した最小限のボイラープレート
- **必要最小限の状態**: 冗長な状態や導出可能な値は避ける
- **明確なアクション命名**: 動詞+名詞の形式で一貫した命名規則を使用

### 実装パターン

```tsx
// app/stores/domain-name.ts

// 型定義
interface DomainState {
  data: DataType;
  status: "idle" | "loading" | "success" | "error";

  // アクション
  setData: (data: DataType) => void;
  clearData: () => void;
}

// ストア作成
export const useDomainStore = create<DomainState>((set) => ({
  // 初期状態
  data: null,
  status: "idle",

  // アクション
  setData: (data) => set({ data, status: "success" }),
  clearData: () => set({ data: null, status: "idle" }),
}));

// 選択的サブスクリプション（パフォーマンス最適化）
export const useDomainStatus = () => useDomainStore((state) => state.status);
```

## リポジトリ層設計

### 組織化原則

- **ストレージタイプベースのファイル構成**: リポジトリは「エンティティ別」ではなく「ストレージタイプ別」にグループ化
- **共通インターフェース**: 共通のリポジトリインターフェースは`types.ts`に配置
- **エントリーポイント**: `index.ts`をメインのエントリーポイントとして使用
- **一貫したエラー処理**: ストレージ固有のエラーを共通のエラー型に変換

### 実装パターン

```tsx
// app/repositories/types.ts
export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  // 基本操作
}

// app/repositories/storage-type/index.ts
import { Repository } from "../types";

// ヘルパー関数
const storageHelpers = {
  getData: <T,>(key: string): T[] => {
    /* 実装 */
  },
  setData: <T,>(key: string, data: T[]): void => {
    /* 実装 */
  },
};

// リポジトリ実装
function createRepository<T>(): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      // 実装
    },
    // 他のメソッド
  };
}

// エクスポート
export const entityRepository = createRepository<EntityType>();
```

## 新機能実装のワークフロー

1. **機能の範囲を特定**: 新しいスタンドアロン機能か、既存機能の拡張かを判断
2. **適切なファイルを選択**: スタンドアロン機能には新しいファイル、拡張には既存ファイルを使用
3. **インターフェース設計**: 必要な型とインターフェースを定義
4. **実装**: ヘルパーから始めてメイン機能を構築
5. **共有要素の抽出**: 他の場所で再利用できる要素があれば、共有ファイルに移動

## AI 駆動開発のための最適化

- **関連コードの共存**: 使用される場所の近くに配置
- **パターン認識の促進**: 一貫したコード構造と命名規則
- **明示的な意図**: 説明的な変数名と適切なコメント
