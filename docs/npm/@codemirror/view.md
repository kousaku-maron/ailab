# @codemirror/view

CodeMirrorエディタのDOM表示コンポーネントを提供するパッケージです。エディタのUI、イベント処理、レンダリングを担当します。

## 基本的な使い方

```typescript
import {EditorView} from "@codemirror/view"
import {EditorState} from "@codemirror/state"
import {basicSetup} from "codemirror"

// エディタの作成
const view = new EditorView({
  state: EditorState.create({
    doc: "Hello world",
    extensions: [basicSetup]
  }),
  parent: document.body // DOMに追加
})

// トランザクションのディスパッチ
view.dispatch({
  changes: {from: 0, to: 5, insert: "Good morning"}
})
```

## 主要なクラス

### EditorView

エディタのUI全体を表すクラスです。DOM要素の管理、イベント処理、状態の更新などを担当します。

```typescript
// 基本的な設定
const view = new EditorView({
  state: EditorState.create({...}),
  parent: document.querySelector("#editor"),
  dispatchTransactions: (trs, view) => {
    // カスタムトランザクション処理
    view.update(trs)
  }
})

// 状態の更新
view.setState(newState)

// トランザクションのディスパッチ
view.dispatch({
  changes: {from: 0, insert: "Hello"},
  selection: {anchor: 5}
})

// エディタの破棄
view.destroy()
```

#### 主要なプロパティとメソッド

- `view.state`: 現在のエディタ状態
- `view.dom`: エディタのルートDOM要素
- `view.contentDOM`: 編集可能なコンテンツを含むDOM要素
- `view.viewport`: 現在表示されている範囲
- `view.dispatch(tr)`: トランザクションをディスパッチ
- `view.focus()`: エディタにフォーカス
- `view.hasFocus`: エディタがフォーカスを持っているか
- `view.requestMeasure()`: レイアウト測定をスケジュール

### ViewUpdate

ビューの更新情報を表すクラスです。ViewPluginの`update`メソッドに渡されます。

```typescript
const plugin = ViewPlugin.define(view => {
  // プラグインの初期化
  return {
    update(update: ViewUpdate) {
      if (update.docChanged) {
        // ドキュメントが変更された
      }
      if (update.selectionSet) {
        // 選択範囲が変更された
      }
      if (update.viewportChanged) {
        // ビューポートが変更された
      }
    }
  }
})
```

### ViewPlugin

エディタビューに関連する状態と機能を提供するプラグインを定義します。

```typescript
// 単純なプラグイン
const simplePlugin = ViewPlugin.define(() => {
  return {
    update(update) {
      // 更新時の処理
    },
    destroy() {
      // クリーンアップ
    }
  }
})

// イベントハンドラを持つプラグイン
const clickCounterPlugin = ViewPlugin.define(view => {
  let count = 0
  return {
    update() { /* ... */ },
    count: () => count
  }
}, {
  eventHandlers: {
    click(e, view) {
      count++
      return false // イベントを伝播
    }
  }
})
```

## 装飾 (Decoration)

エディタのコンテンツにスタイルやウィジェットを追加するための機能です。

```typescript
import {Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate} from "@codemirror/view"
import {RangeSetBuilder} from "@codemirror/state"

// マーク装飾（テキストのスタイル変更）
const markDecoration = Decoration.mark({class: "highlight"})

// ウィジェット装飾（DOM要素の挿入）
const widgetDecoration = Decoration.widget({
  widget: new class extends WidgetType {
    toDOM() {
      const span = document.createElement("span")
      span.textContent = "!"
      return span
    }
  }
})

// 行装飾（行全体のスタイル変更）
const lineDecoration = Decoration.line({class: "highlighted-line"})

// 装飾を提供するプラグイン
const highlightPlugin = ViewPlugin.define(view => {
  return {
    update(update) {
      // 更新処理
    }
  }
}, {
  decorations: v => {
    const builder = new RangeSetBuilder<Decoration>()
    builder.add(10, 20, markDecoration)
    return builder.finish()
  }
})
```

### WidgetType

カスタムDOM要素をエディタに挿入するためのクラスです。

```typescript
class MyWidget extends WidgetType {
  constructor(readonly content: string) { super() }
  
  toDOM() {
    const element = document.createElement("span")
    element.className = "my-widget"
    element.textContent = this.content
    return element
  }
  
  eq(other: MyWidget) {
    return this.content === other.content
  }
  
  ignoreEvent(event: Event) {
    return event.type !== "click" // クリックイベントのみ処理
  }
}

// ウィジェットの使用
const widget = Decoration.widget({
  widget: new MyWidget("Hello"),
  side: 1 // カーソルの後ろに表示
})
```

## パネル (Panel)

エディタの上下に追加のUIを表示するための機能です。

```typescript
import {showPanel, Panel} from "@codemirror/view"

// パネルの作成
const myPanel = (view: EditorView): Panel => {
  const dom = document.createElement("div")
  dom.className = "my-panel"
  dom.textContent = "This is a panel"
  
  return {
    dom,
    top: true, // エディタの上部に表示
    update(update) {
      // 更新処理
    },
    destroy() {
      // クリーンアップ
    }
  }
}

// パネルを表示する拡張機能
const panelExtension = showPanel.of(myPanel)
```

## ガター (Gutter)

行番号などの行に関連する情報を表示するための機能です。

```typescript
import {gutter, GutterMarker} from "@codemirror/view"

// カスタムガターマーカー
class MyMarker extends GutterMarker {
  constructor(readonly content: string) { super() }
  
  toDOM() {
    const element = document.createElement("div")
    element.textContent = this.content
    return element
  }
}

// ガターの作成
const myGutter = gutter({
  class: "my-gutter",
  markers: view => {
    // マーカーを提供するロジック
    return RangeSet.of([
      {from: 10, to: 10, value: new MyMarker("*")}
    ])
  },
  initialSpacer: () => new MyMarker(""),
  domEventHandlers: {
    click: (view, line, event) => {
      console.log("Clicked on line", line.from)
      return false
    }
  }
})
```

## ツールチップ (Tooltip)

エディタ上に情報を表示するためのポップアップです。

```typescript
import {showTooltip, Tooltip} from "@codemirror/view"

// ツールチップの作成
const tooltip: Tooltip = {
  pos: 10, // 表示位置
  create(view) {
    const dom = document.createElement("div")
    dom.className = "my-tooltip"
    dom.textContent = "Tooltip content"
    
    return {
      dom,
      mount() {
        // DOMに追加された時
      },
      update(update) {
        // 更新処理
      },
      destroy() {
        // クリーンアップ
      }
    }
  }
}

// ツールチップを表示する拡張機能
const tooltipExtension = showTooltip.of(tooltip)
```

## イベント処理

エディタのDOMイベントを処理するための機能です。

```typescript
import {EditorView} from "@codemirror/view"

// イベントハンドラの登録
const eventHandlers = EditorView.domEventHandlers({
  click: (event, view) => {
    console.log("Click at", view.posAtCoords({x: event.clientX, y: event.clientY}))
    return false // イベントを伝播
  },
  keydown: (event, view) => {
    if (event.key === "Tab") {
      // Tabキーの処理
      return true // イベントを消費
    }
    return false
  }
})
```

## テーマとスタイル

エディタのスタイルをカスタマイズするための機能です。

```typescript
import {EditorView} from "@codemirror/view"

// テーマの定義
const myTheme = EditorView.theme({
  // 基本スタイル
  "&": {
    height: "400px",
    fontSize: "14px"
  },
  // アクティブ行のスタイル
  ".cm-activeLine": {
    backgroundColor: "#f0f0f0"
  },
  // カーソルのスタイル
  ".cm-cursor": {
    borderLeftColor: "#00f",
    borderLeftWidth: "2px"
  }
})

// ベーステーマの定義（ライト/ダークテーマ対応）
const myBaseTheme = EditorView.baseTheme({
  "&": {
    color: "#000"
  },
  "&dark": {
    color: "#fff"
  },
  "&light": {
    color: "#000"
  }
})
```

## 便利な拡張機能

```typescript
import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap
} from "@codemirror/view"

// 行番号を表示
const lineNumbersExt = lineNumbers()

// アクティブな行のガターをハイライト
const activeLineGutterExt = highlightActiveLineGutter()

// 特殊文字をハイライト
const specialCharsExt = highlightSpecialChars()

// 選択範囲の描画をカスタマイズ
const selectionExt = drawSelection()

// ドラッグ&ドロップ時のカーソル表示
const dropCursorExt = dropCursor()

// 矩形選択を有効化
const rectSelectionExt = rectangularSelection()

// 十字カーソルを表示
const crosshairExt = crosshairCursor()

// アクティブな行をハイライト
const activeLineExt = highlightActiveLine()

// キーマップの定義
const myKeymap = keymap.of([
  // キーバインディング
])
```

## コマンド

エディタの操作を実行する関数です。

```typescript
import {Command} from "@codemirror/view"

// カスタムコマンドの定義
const myCommand: Command = (view) => {
  // 何らかの操作を実行
  view.dispatch({
    changes: {from: 0, insert: "Hello"}
  })
  return true // コマンドが実行されたことを示す
}

// コマンドの実行
myCommand(view)
