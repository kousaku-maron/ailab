# @codemirror/commands

CodeMirrorエディタのための編集コマンドのコレクションを提供するパッケージです。カーソル移動、選択、削除、履歴操作などの基本的な編集機能を実装しています。

## 基本的な使い方

```typescript
import {EditorView, keymap} from "@codemirror/view"
import {standardKeymap, selectLine} from "@codemirror/commands"

// 標準キーマップとカスタムキーバインディングを設定
const view = new EditorView({
  parent: document.body,
  extensions: [
    keymap.of([
      ...standardKeymap,
      {key: "Alt-l", mac: "Ctrl-l", run: selectLine}
    ])
  ]
})
```

## キーマップ

### standardKeymap

プラットフォーム標準に近いキーバインディングのセットです。

```typescript
import {standardKeymap} from "@codemirror/commands"

// エディタに標準キーマップを適用
const view = new EditorView({
  extensions: [keymap.of(standardKeymap)]
})
```

主なキーバインディング:
- 矢印キー: カーソル移動
- Shift+矢印キー: 選択範囲の拡張
- Ctrl+矢印キー: 単語単位の移動
- Home/End: 行頭/行末へ移動
- Backspace/Delete: 文字の削除
- Ctrl+Backspace/Delete: 単語の削除
- Enter: 改行と自動インデント

### defaultKeymap

標準キーマップに加えて、より多くの機能を持つキーマップです。

```typescript
import {defaultKeymap} from "@codemirror/commands"

// エディタにデフォルトキーマップを適用
const view = new EditorView({
  extensions: [keymap.of(defaultKeymap)]
})
```

追加のキーバインディング:
- Alt+矢印上/下: 行の移動
- Shift+Alt+矢印上/下: 行のコピー
- Ctrl+/: コメントのトグル
- Ctrl+[/]: インデント減少/増加
- Ctrl+Enter: 空行の挿入

### historyKeymap

履歴操作（元に戻す/やり直し）のためのキーマップです。

```typescript
import {historyKeymap} from "@codemirror/commands"

// 履歴操作のキーマップを適用
const view = new EditorView({
  extensions: [keymap.of(historyKeymap)]
})
```

キーバインディング:
- Ctrl+z: 元に戻す
- Ctrl+y (macOSではCmd+Shift+z): やり直し
- Ctrl+u: 選択範囲の変更を元に戻す
- Alt+u (macOSではCmd+Shift+u): 選択範囲の変更をやり直し

## カーソル移動コマンド

```typescript
import {
  cursorCharLeft, cursorCharRight,
  cursorLineUp, cursorLineDown,
  cursorPageUp, cursorPageDown,
  cursorLineStart, cursorLineEnd,
  cursorDocStart, cursorDocEnd,
  cursorGroupLeft, cursorGroupRight,
  cursorSyntaxLeft, cursorSyntaxRight
} from "@codemirror/commands"

// カスタムキーマップでコマンドを使用
const myKeymap = keymap.of([
  {key: "Ctrl-Home", run: cursorDocStart},
  {key: "Ctrl-End", run: cursorDocEnd}
])
```

主なカーソル移動コマンド:
- `cursorCharLeft/Right`: 1文字左/右に移動
- `cursorLineUp/Down`: 1行上/下に移動
- `cursorPageUp/Down`: 1ページ上/下に移動
- `cursorLineStart/End`: 行頭/行末に移動
- `cursorDocStart/End`: ドキュメントの先頭/末尾に移動
- `cursorGroupLeft/Right`: 単語単位で左/右に移動
- `cursorSyntaxLeft/Right`: 構文要素単位で左/右に移動

## 選択コマンド

```typescript
import {
  selectAll, selectLine,
  selectCharLeft, selectCharRight,
  selectLineUp, selectLineDown,
  selectParentSyntax
} from "@codemirror/commands"

// 選択コマンドの使用例
const selectCommands = keymap.of([
  {key: "Ctrl-a", run: selectAll},
  {key: "Alt-l", run: selectLine}
])
```

主な選択コマンド:
- `selectAll`: ドキュメント全体を選択
- `selectLine`: 現在の行を選択
- `selectCharLeft/Right`: 選択範囲を1文字左/右に拡張
- `selectLineUp/Down`: 選択範囲を1行上/下に拡張
- `selectParentSyntax`: 現在の選択範囲を含む構文要素を選択

## 削除コマンド

```typescript
import {
  deleteCharBackward, deleteCharForward,
  deleteGroupBackward, deleteGroupForward,
  deleteLine, deleteToLineEnd
} from "@codemirror/commands"

// 削除コマンドの使用例
const deleteCommands = keymap.of([
  {key: "Ctrl-d", run: deleteCharForward},
  {key: "Ctrl-Shift-k", run: deleteLine}
])
```

主な削除コマンド:
- `deleteCharBackward/Forward`: カーソルの前/後の文字を削除
- `deleteGroupBackward/Forward`: カーソルの前/後の単語を削除
- `deleteLine`: 現在の行を削除
- `deleteToLineEnd`: カーソルから行末までを削除

## 履歴操作

```typescript
import {history, undo, redo, undoSelection, redoSelection} from "@codemirror/commands"

// 履歴機能の設定
const editor = new EditorView({
  extensions: [
    history(),  // 履歴機能を有効化
    keymap.of([
      {key: "Ctrl-z", run: undo},
      {key: "Ctrl-y", run: redo}
    ])
  ]
})
```

履歴関連の機能:
- `history({minDepth, newGroupDelay})`: 履歴機能を設定
- `undo/redo`: 変更を元に戻す/やり直す
- `undoSelection/redoSelection`: 選択範囲の変更を元に戻す/やり直す
- `undoDepth/redoDepth`: 元に戻せる/やり直せる変更の数を取得

## インデント操作

```typescript
import {indentMore, indentLess, indentSelection} from "@codemirror/commands"

// インデントコマンドの使用例
const indentCommands = keymap.of([
  {key: "Tab", run: indentMore},
  {key: "Shift-Tab", run: indentLess},
  {key: "Ctrl-Alt-\\", run: indentSelection}
])
```

インデント関連のコマンド:
- `indentMore`: 選択範囲のインデントを増やす
- `indentLess`: 選択範囲のインデントを減らす
- `indentSelection`: 選択範囲を自動インデント
- `insertTab`: タブを挿入（選択範囲がある場合はインデント）

## 行操作

```typescript
import {
  insertNewline, insertNewlineAndIndent,
  splitLine, insertBlankLine,
  moveLineUp, moveLineDown,
  copyLineUp, copyLineDown
} from "@codemirror/commands"

// 行操作コマンドの使用例
const lineCommands = keymap.of([
  {key: "Enter", run: insertNewlineAndIndent},
  {key: "Alt-ArrowUp", run: moveLineUp},
  {key: "Alt-ArrowDown", run: moveLineDown}
])
```

行操作関連のコマンド:
- `insertNewline`: 改行を挿入
- `insertNewlineAndIndent`: 改行と自動インデントを挿入
- `splitLine`: 現在の行を分割
- `insertBlankLine`: 空行を挿入
- `moveLineUp/Down`: 選択行を上/下に移動
- `copyLineUp/Down`: 選択行を上/下にコピー

## コメント操作

```typescript
import {toggleComment, toggleLineComment, toggleBlockComment} from "@codemirror/commands"

// コメント操作コマンドの使用例
const commentCommands = keymap.of([
  {key: "Ctrl-/", run: toggleComment},
  {key: "Shift-Alt-a", run: toggleBlockComment}
])
```

コメント関連のコマンド:
- `toggleComment`: コメントのトグル（行コメントを優先）
- `toggleLineComment`: 行コメントのトグル
- `toggleBlockComment`: ブロックコメントのトグル
- `lineComment/lineUncomment`: 行コメントの追加/削除
- `blockComment/blockUncomment`: ブロックコメントの追加/削除

## その他のコマンド

```typescript
import {
  transposeChars,
  toggleTabFocusMode,
  simplifySelection,
  cursorMatchingBracket
} from "@codemirror/commands"

// その他のコマンドの使用例
const miscCommands = keymap.of([
  {key: "Ctrl-t", run: transposeChars},
  {key: "Ctrl-m", run: toggleTabFocusMode},
  {key: "Shift-Ctrl-\\", run: cursorMatchingBracket}
])
```

その他の便利なコマンド:
- `transposeChars`: カーソル前後の文字を入れ替え
- `toggleTabFocusMode`: タブフォーカスモードの切り替え
- `simplifySelection`: 選択範囲の簡略化
- `cursorMatchingBracket`: 対応する括弧にカーソルを移動
