# VS Code Theme Design Guidelines

VS Code デザイン言語に基づいた Tailwind CSS 実装ガイドライン。

## カラーパレット

```
// 背景色
'bg-primary': '#1E1E1E'     // エディター領域
'bg-secondary': '#252526'   // サイドバー
'bg-tertiary': '#2D2D2D'    // ホバー時
'bg-selected': '#37373D'    // 選択時
'bg-base': '#181818'        // 基本UI要素

// テキストカラー
'text-primary': '#D4D4D4'   // メイン
'text-secondary': '#CCCCCC' // セカンダリー
'text-inactive': '#808080'  // 非アクティブ

// アクセントカラー
'accent-primary': '#007ACC' // プライマリー
'accent-hover': '#1B8CD8'   // ホバー時
'accent-bg': 'rgba(0, 122, 204, 0.1)' // フォーカス背景
'focus-border': '#007ACC'   // フォーカスボーダー

// ボーダー
'border': '#2D2D2D'

// ステータスカラー
'success': '#388A34'
'success-hover': '#369432'
'warning': '#DDB100'
'error': '#F14C4C'

// 入力フィールド
'input-bg': '#3C3C3C'
```

## フォント設定

```
// サイズ
'vscode-base': ['12px', '1.6']  // 基本
'vscode-small': ['11px', '1.4']  // 小（ステータスバー）

// ファミリー
sans: ["Inter", "ui-sans-serif", "system-ui", ...]
mono: ["SF Mono", "Monaco", "Menlo", ...]
```

## コンポーネントパターン

### タブ

```
// アクティブタブ
`bg-vscode-bg-primary text-white before:absolute before:left-0 before:top-0 before:h-[2px] before:w-full before:bg-vscode-accent-primary`

// 非アクティブタブ
`bg-vscode-bg-base text-vscode-text-secondary hover:bg-vscode-bg-tertiary`
```

### エディタ

```
// コンテナ
"flex h-full flex-col overflow-hidden bg-vscode-bg-primary"

// テキストエリア
"h-full w-full resize-none border-none bg-vscode-bg-primary p-4 font-mono text-vscode-base text-vscode-text-primary focus:outline-none"
```

### ボタン

```
// プライマリー
"rounded bg-vscode-accent-primary px-4 py-2 text-vscode-base text-white hover:bg-vscode-accent-hover focus:outline-none disabled:opacity-50"

// セカンダリー
"rounded bg-vscode-input-bg px-4 py-2 text-vscode-base text-vscode-text-primary hover:bg-vscode-bg-tertiary focus:outline-none disabled:opacity-50"
```

### ステータスバー

```
// コンテナ
"flex h-[22px] items-center justify-between border-t border-vscode-border bg-vscode-bg-base px-2 text-vscode-small text-vscode-text-secondary"

// ステータスアイテム
"flex items-center border-l border-vscode-border pl-3"
```

### アクティビティバー

```
// コンテナ
"flex w-12 flex-col border-r border-vscode-border bg-vscode-bg-base"

// アクティブボタン
"text-white before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-vscode-accent-primary"

// 非アクティブボタン
"text-vscode-text-inactive hover:text-white"
```

### サイドバーアイテム

```
// フォーカス状態
'bg-vscode-accent-bg text-white outline outline-1 outline-vscode-focus-border'

// 通常状態
'text-vscode-text-secondary hover:bg-vscode-bg-tertiary'
```

## ベストプラクティス

- フォーカス要素: `focus:outline-none focus:ring-2 focus:ring-vscode-accent-primary`
- 重要情報: `text-vscode-text-primary`
- 補助情報: `text-vscode-text-secondary`
- 非アクティブ: `text-vscode-text-inactive`
- 動的スタイル: `clsx()` または条件付きテンプレートリテラル
- スクロールバー非表示: `scrollbar-none` または `::-webkit-scrollbar { display: none; }`
