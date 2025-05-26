# VS Code Theme Design Guidelines

このガイドラインは、VS Code のデザイン言語に基づいたアプリケーションの一貫したスタイリングを維持するためのものです。Tailwind CSS を使用して実装します。

## Tailwind 設定

### カラーパレット

```typescript
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        vscode: {
          // 背景色
          'bg-primary': '#1E1E1E',    // エディター領域の背景色
          'bg-secondary': '#252526',   // サイドバーの背景色
          'bg-tertiary': '#2D2D2D',    // ホバー時の背景色
          'bg-selected': '#37373D',    // 選択時の背景色
          'bg-base': '#181818',        // 基本UI要素（ActivityBar、非アクティブタブ、StatusBar）の背景色

          // テキストカラー
          'text-primary': '#D4D4D4',   // メインのテキスト色
          'text-secondary': '#CCCCCC', // セカンダリーテキスト色
          'text-inactive': '#808080',  // 非アクティブテキスト色

          // アクセントカラー
          'accent-primary': '#007ACC', // プライマリーアクセント色
          'accent-hover': '#1B8CD8',   // ホバー時のアクセント色
          'accent-bg': 'rgba(0, 122, 204, 0.1)', // フォーカス時の背景色（アクセントカラーを薄く）
          'focus-border': '#007ACC',   // フォーカス時のボーダー色

          // ボーダーカラー
          'border': '#2D2D2D',         // 境界線の色

          // ステータスカラー
          'success': '#388A34',        // 成功を示す色
          'success-hover': '#369432',  // 成功ホバー時の色
          'warning': '#DDB100',        // 警告を示す色
          'error': '#F14C4C',          // エラーを示す色

          // 入力フィールド
          'input-bg': '#3C3C3C',       // 入力フィールドの背景色
        }
      }
    }
  }
}
```

### フォントサイズ

```typescript
// tailwind.config.ts
{
  theme: {
    extend: {
      fontSize: {
        'vscode-base': ['12px', '1.6'],  // 基本テキストサイズ
        'vscode-small': ['11px', '1.4'],  // 小さいテキストサイズ（ステータスバーなど）
      }
    }
  }
}
```

### フォントファミリー

```typescript
// tailwind.config.ts
{
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        mono: [
          "SF Mono",
          "Monaco",
          "Menlo",
          "Consolas",
          "Ubuntu Mono",
          "monospace",
        ],
      }
    }
  }
}
```

## コンポーネントスタイリング

### タブ

```tsx
// アクティブなタブ
className={`
  group relative flex h-9 min-w-fit items-center border-r border-vscode-border px-4
  bg-vscode-bg-primary text-white
  before:absolute before:left-0 before:top-0 before:h-[2px]
  before:w-full before:bg-vscode-accent-primary
`}

// 非アクティブなタブ
className={`
  group relative flex h-9 min-w-fit items-center border-r border-vscode-border px-4
  bg-vscode-bg-base text-vscode-text-secondary hover:bg-vscode-bg-tertiary
`}

// タブコンテナ
className="flex h-9 bg-vscode-bg-base"

// タブ内のボタン
className="mr-2 whitespace-nowrap text-vscode-base"

// タブの閉じるボタン
className="ml-2 rounded p-1 text-base opacity-0 hover:bg-vscode-bg-tertiary group-hover:opacity-100"
```

### エディタ

```tsx
// エディタコンテナ
className = "flex h-full flex-col overflow-hidden bg-vscode-bg-primary";

// テキストエリア（プレーンテキスト用）
className =
  "h-full w-full resize-none border-none bg-vscode-bg-primary p-4 font-mono text-vscode-base text-vscode-text-primary focus:outline-none";

// プレースホルダー
placeholder = "# メモ書き\n\nマークダウン形式でメモを作成できます。";

// シンタックスハイライト用コンテナ
className = "h-full w-full overflow-auto";

// コードエディタ用テキストエリア
className =
  "absolute inset-0 h-full w-full resize-none border-none bg-transparent font-mono text-vscode-base text-transparent caret-white focus:outline-none";
```

### ボタン

```tsx
// プライマリーボタン
className =
  "rounded bg-vscode-accent-primary px-4 py-2 text-vscode-base text-white hover:bg-vscode-accent-hover focus:outline-none disabled:opacity-50";

// セカンダリーボタン
className =
  "rounded bg-vscode-input-bg px-4 py-2 text-vscode-base text-vscode-text-primary hover:bg-vscode-bg-tertiary focus:outline-none disabled:opacity-50";

// 成功ボタン
className =
  "rounded bg-vscode-success px-4 py-2 text-vscode-base text-white hover:bg-vscode-success-hover focus:outline-none disabled:opacity-50";
```

### 入力フィールド

```tsx
// テキスト入力
className =
  "flex-1 resize-none rounded border border-vscode-input-bg bg-vscode-input-bg p-2 text-vscode-base text-vscode-text-primary placeholder-vscode-text-inactive focus:border-vscode-accent-primary focus:outline-none";
```

### ステータスバー

```tsx
// ステータスバーコンテナ
className="fixed bottom-0 left-0 right-0 z-50 flex h-[22px] items-center justify-between border-t border-vscode-border bg-vscode-bg-base px-2 text-vscode-small text-vscode-text-secondary"

// ステータスアイテム（区切り線付き）
className="flex items-center border-l border-vscode-border pl-3"
className="flex items-center border-r border-vscode-border pr-3"

// ステータスカラー
className={`
  ${status === "saving" && "text-vscode-warning"}
  ${status === "saved" && "text-vscode-success"}
  ${status === "error" && "text-vscode-error"}
`}
```

### アクティビティバー

```tsx
// アクティビティバーコンテナ
className="flex w-12 flex-col border-r border-vscode-border bg-vscode-bg-base"

// アクティビティバーボタン
className={`relative flex h-12 w-full items-center justify-center ${
  isActive
    ? "text-white before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-vscode-accent-primary"
    : "text-vscode-text-inactive hover:text-white"
}`}
```

### サイドバーアイテム

```tsx
// サイドバーアイテム（フォーカス状態）
className={clsx(
  'group relative w-full rounded p-2',
  isFocused
    ? 'bg-vscode-accent-bg text-white outline outline-1 outline-vscode-focus-border'
    : 'text-vscode-text-secondary hover:bg-vscode-bg-tertiary'
)}
```

## アクセシビリティとベストプラクティス

### フォーカス管理

- すべてのインタラクティブ要素に`focus:outline-none`を適用
- カスタムフォーカススタイルには`focus:ring`を使用

```tsx
className =
  "focus:outline-none focus:ring-2 focus:ring-vscode-accent-primary focus:ring-offset-2";
```

### コントラスト比

- テキストカラーは WCAG 2.1 AA 基準（4.5:1）を満たすように設定済み
- 重要な情報には`text-vscode-text-primary`を使用
- 補助的な情報には`text-vscode-text-secondary`を使用
- 非アクティブ要素には`text-vscode-text-inactive`を使用

### レスポンシブデザイン

```tsx
// レスポンシブなコンテナ
className = "flex w-full flex-col md:flex-row lg:space-x-4";

// レスポンシブなサイドバー
className = "w-full md:w-64 lg:w-72";
```

### パフォーマンス

- 動的なスタイルには`@apply`ディレクティブを避け、直接 Tailwind クラスを使用
- 共通のスタイルパターンはコンポーネント化
- 条件付きクラスには`clsx`や`classnames`ライブラリを使用

```tsx
import clsx from 'clsx';

className={clsx(
  'base-classes',
  {
    'bg-vscode-success text-white': isSuccess,
    'bg-vscode-error text-white': isError,
  }
)}
```

## 使用例

### タブナビゲーションの実装例

```tsx
function TabNavigation({ currentTab, onTabChange }) {
  return (
    <div className="flex h-9 items-center bg-vscode-bg-base text-vscode-text-secondary">
      <button
        onClick={() => onTabChange("tab1")}
        className={clsx(
          "relative h-full px-4 text-vscode-base border-r border-vscode-border",
          currentTab === "tab1"
            ? "bg-vscode-bg-primary text-white before:absolute before:top-0 before:left-0 before:h-[2px] before:w-full before:bg-vscode-accent-primary"
            : "bg-vscode-bg-base hover:bg-vscode-bg-tertiary"
        )}
      >
        Tab 1
      </button>
    </div>
  );
}
```

### エディタタブの実装例

```tsx
function EditorTab({ label, isActive, onClose, onClick }) {
  return (
    <div
      className={`
        group relative flex h-9 min-w-fit items-center border-r border-vscode-border px-4
        ${
          isActive
            ? "bg-vscode-bg-primary text-white before:absolute before:left-0 before:top-0 before:h-[2px] before:w-full before:bg-vscode-accent-primary"
            : "bg-vscode-bg-base text-vscode-text-secondary hover:bg-vscode-bg-tertiary"
        }
      `}
    >
      <button
        className="mr-2 whitespace-nowrap text-vscode-base"
        onClick={onClick}
      >
        {label}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="ml-2 rounded p-1 text-base opacity-0 hover:bg-vscode-bg-tertiary group-hover:opacity-100"
      >
        <FiX />
      </button>
    </div>
  );
}
```

### ステータスバーの実装例

```tsx
function StatusBarItem({ children, borderPosition = "left" }) {
  return (
    <div
      className={`flex items-center border-${borderPosition} border-vscode-border p${
        borderPosition === "left" ? "l" : "r"
      }-3`}
    >
      {children}
    </div>
  );
}

function StatusBar() {
  const { file, autoSaveStatus, language } = useStatusBarStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[22px] items-center justify-between border-t border-vscode-border bg-vscode-bg-base px-2 text-vscode-small text-vscode-text-secondary">
      <div className="flex items-center space-x-3">
        {autoSaveStatus && (
          <StatusBarItem>
            <span
              className={`
                ${autoSaveStatus === "saving" && "text-vscode-warning"}
                ${autoSaveStatus === "saved" && "text-vscode-success"}
                ${autoSaveStatus === "error" && "text-vscode-error"}
              `}
            >
              {autoSaveStatus === "saving"
                ? "保存中..."
                : autoSaveStatus === "saved"
                ? "保存済み"
                : "保存エラー"}
            </span>
          </StatusBarItem>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {language && (
          <StatusBarItem>
            <span>{language}</span>
          </StatusBarItem>
        )}
        {file && (
          <StatusBarItem>
            <span>文字数: {file.content.length}</span>
          </StatusBarItem>
        )}
      </div>
    </div>
  );
}
```

### アクティビティバーの実装例

```tsx
function ActivityBarLink({ children, to, isActive = false }) {
  return (
    <Link
      to={to}
      className={`relative flex h-12 w-full items-center justify-center ${
        isActive
          ? "text-white before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-vscode-accent-primary"
          : "text-vscode-text-inactive hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function ActivityBar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex w-12 flex-col border-r border-vscode-border bg-vscode-bg-base">
      <ActivityBarLink
        to="/files"
        isActive={pathname === "/" || pathname === "/files"}
      >
        <FiFolder className="h-6 w-6" />
      </ActivityBarLink>
      <ActivityBarLink to="/search" isActive={pathname === "/search"}>
        <FiSearch className="h-6 w-6" />
      </ActivityBarLink>
    </div>
  );
}
```

このガイドラインは、アプリケーション全体で一貫したデザインを維持するための基準として使用してください。新しいコンポーネントを作成する際や既存のコンポーネントを修正する際は、必ずこのガイドラインを参照してください。
