# ストア設計

## 基本方針

ストアを実装する際は、以下の「ドメイン集約アプローチ」に従ってください。このアプローチは、関連する状態とロジックを機能ドメインごとに集約し、AI 駆動開発に最適化されています。

## 必須の原則

以下の 5 つの原則は、良いストア実装のために必ず守るべき基本ルールです：

### 1. ドメインベースのファイル構成

ストアは「グローバル」ではなく「ドメイン別」にグループ化してください。特定の機能ドメインに関連する状態とロジックは、同じファイルに配置します。

**良い例:**

```
app/stores/
├── status-bar.ts     # ステータスバー関連の状態
├── notes.ts          # ノート関連の状態
└── editor.ts         # エディタ関連の状態
```

**避けるべき例:**

```
app/stores/
├── index.ts          # すべての状態を含む巨大なストア
└── types.ts          # すべての型定義
```

### 2. 明確な責任境界

各ストアファイルは明確な責任範囲を持ち、特定の機能ドメインに関連する状態のみを管理します。

- 各ストアの責任を明確に定義
- 説明的な関数名と型名の使用
- 複雑なロジックには適切なコメントを追加

### 3. Zustand の活用

Zustand のシンプルな API を活用し、最小限のボイラープレートでストアを実装します。

- シンプルな API を活用した最小限のボイラープレート
- 型安全性を確保するための適切な型定義

```typescript
import { create } from "zustand";

export const useEditorStore = create<EditorStore>((set) => ({
  // 状態とアクション
}));
```

### 4. 必要最小限の状態

ストアには必要最小限の状態のみを保持し、冗長な状態や導出可能な値は避けます。

- 必要最小限の状態のみを保持
- 計算可能な値は導出プロパティとして実装

### 5. 明確なアクション命名

アクションには明確で一貫した命名規則を使用します。

- 明確な命名規則（動詞 + 名詞）
- 状態更新の一貫したパターン

```typescript
export const useStatusBarStore = create<StatusBarState>((set) => ({
  // 状態
  file: undefined,
  autoSaveStatus: undefined,

  // アクション
  setStatusBarProps: (props) => set(props),
  clearStatusBar: () => set({ file: undefined, autoSaveStatus: undefined }),
}));
```

## 推奨プラクティス（オプション）

以下のプラクティスは、プロジェクトの規模や複雑さに応じて必要に応じて採用してください：

### 1. ストアの構造

各ストアファイルは以下の構造に従うと整理しやすくなります：

1. 型定義
2. 初期状態（オプション）
3. ストア作成
4. セレクタ関数（必要に応じて）

```typescript
// 型定義
interface StatusBarState {
  // 状態の型
}

// 初期状態（オプション）
const initialState: StatusBarState = {
  // 初期値
};

// ストア作成
export const useStatusBarStore = create<StatusBarState>((set) => ({
  ...(initialState || {}),
  // アクション
}));

// セレクタ（必要に応じて）
export const useStatusBarSelectors = {
  useStatus: () => useStatusBarStore((state) => state.status),
};
```

### 2. 共有状態の扱い

複数のドメインで共有される状態は、専用の共有ストアファイルに配置することを検討してください：

```typescript
// shared.ts
export const useSharedStore = create<SharedState>((set) => ({
  // 共有状態と操作
}));
```

### 3. セレクタの活用

パフォーマンスが重要な場合や複雑な導出値が必要な場合は、セレクタ関数の活用を検討してください：

```typescript
// カスタムセレクタフック
export function useEditorStatus() {
  const note = useStatusBarStore((state) => state.note);
  const currentTab = useStatusBarStore((state) => state.currentTab);

  // 導出値の計算
  const isEditing = Boolean(note && currentTab);

  return { note, currentTab, isEditing };
}
```

### 4. パフォーマンス最適化

アプリケーションが大規模になった場合は、以下のパフォーマンス最適化を検討してください：

- 選択的サブスクリプション
- メモ化の活用
- イミュータブルな更新パターン

```typescript
// 良い例
const status = useStatusBarStore((state) => state.autoSaveStatus);

// 避けるべき例
const state = useStatusBarStore();
const status = state.autoSaveStatus;
```

## 新しいストアの追加

新しいストアを追加する際は、以下の手順に従ってください：

1. **機能ドメインの特定**: 新しいストアが管理する機能ドメインを明確に定義
2. **型定義の作成**: 状態とアクションの型を定義
3. **ストアの実装**: 状態、アクション、必要に応じてセレクタを実装

## まとめ

Zustand を使用したストア設計は、シンプルさと柔軟性のバランスを取りながら、AI 駆動開発に最適化されたコードベースを実現します。ドメイン集約アプローチを採用し、関連する状態とロジックを同じファイルに配置することで、コンテキストの依存関係を最小化し、開発効率を向上させます。

必須の 5 原則を守りながら、プロジェクトの規模や複雑さに応じて推奨プラクティスを取り入れることで、メンテナンス性の高いストア実装を実現できます。
