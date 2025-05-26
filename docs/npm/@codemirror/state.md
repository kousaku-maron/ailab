# @codemirror/state

CodeMirrorエディタの状態管理のためのデータ構造を提供するパッケージです。

## 基本概念

CodeMirrorの状態は不変（イミュータブル）なデータ構造です。状態を更新するには、トランザクションを作成し、それを適用して新しい状態を生成します。

```typescript
// 新しいエディタ状態の作成
const state = EditorState.create({
  doc: "hello world",
  extensions: [/* 拡張機能 */]
});

// トランザクションを作成して状態を更新
const transaction = state.update({
  changes: {from: 6, to: 11, insert: "editor"}
});

// 新しい状態を取得
const newState = transaction.state;
console.log(newState.doc.toString()); // "hello editor"
```

## 主要なクラス

### EditorState

エディタの状態を表すイミュータブルなデータ構造。

```typescript
// 新しい状態の作成
const state = EditorState.create({
  doc: "hello world",
  selection: EditorSelection.single(5, 5),
  extensions: [/* 拡張機能 */]
});

// 状態からドキュメントの一部を取得
const text = state.sliceDoc(0, 5); // "hello"

// ファセットの値を取得
const tabSize = state.facet(EditorState.tabSize);

// 状態フィールドの値を取得
const historyField = state.field(history.field);
```

### Transaction

状態の変更を表すオブジェクト。

```typescript
// トランザクションの作成
const tr = state.update({
  changes: {from: 0, to: 5, insert: "hi"},
  selection: EditorSelection.single(2, 2),
  effects: [/* 状態エフェクト */],
  annotations: [/* アノテーション */]
});

// トランザクションの情報
console.log(tr.docChanged); // ドキュメントが変更されたか
console.log(tr.newDoc); // 新しいドキュメント
console.log(tr.newSelection); // 新しい選択範囲
```

### Text

ドキュメントのテキストを表すイミュータブルなデータ構造。

```typescript
// テキストの作成
const text = Text.of(["line 1", "line 2", "line 3"]);

// テキストの操作
const line = text.line(2); // 2行目の情報
const slice = text.slice(0, 10); // 0から10の範囲のテキスト
const replaced = text.replace(0, 6, Text.of(["replaced"])); // テキストの置換
```

### EditorSelection

エディタの選択範囲を表すクラス。

```typescript
// 単一の選択範囲を作成
const selection = EditorSelection.single(10, 15);

// 複数の選択範囲を作成
const multiSelection = EditorSelection.create([
  EditorSelection.range(0, 5),
  EditorSelection.range(10, 15)
]);

// カーソル位置（選択なし）
const cursor = EditorSelection.cursor(10);
```

### ChangeSet

ドキュメントの変更を表すクラス。

```typescript
// 変更セットの作成
const changes = ChangeSet.of([
  {from: 0, to: 5, insert: "hello"},
  {from: 10, to: 15, insert: "world"}
], docLength);

// 変更の適用
const newDoc = changes.apply(doc);

// 変更の合成
const combined = changes.compose(otherChanges);
```

## 拡張機能

### Facet

設定値や機能を提供するための仕組み。

```typescript
// ファセットの定義
const myFacet = Facet.define<number, number>({
  combine: values => values.reduce((a, b) => a + b, 0)
});

// ファセットの使用
const extension = myFacet.of(42);
const state = EditorState.create({extensions: [extension]});
const value = state.facet(myFacet); // 42
```

### StateField

状態に追加のデータを保持するためのフィールド。

```typescript
// 状態フィールドの定義
const countField = StateField.define<number>({
  create: () => 0,
  update: (value, tr) => tr.docChanged ? value + 1 : value
});

// フィールドの使用
const state = EditorState.create({extensions: [countField]});
const count = state.field(countField); // 0
```

### Compartment

動的に設定を変更するためのコンパートメント。

```typescript
// コンパートメントの作成
const themeCompartment = new Compartment();

// 初期状態での使用
const state = EditorState.create({
  extensions: [themeCompartment.of(lightTheme)]
});

// コンパートメントの再設定
const tr = state.update({
  effects: themeCompartment.reconfigure(darkTheme)
});
```

### StateEffect

トランザクションに付随する副作用。

```typescript
// 状態エフェクトの定義
const toggleEffect = StateEffect.define<boolean>();

// エフェクトの使用
const tr = state.update({
  effects: toggleEffect.of(true)
});
```

## 範囲セット (RangeSet)

範囲に関連付けられた値を効率的に管理するためのデータ構造。

```typescript
// 範囲値の定義
class MyMarker extends RangeValue {
  constructor(readonly color: string) { super(); }
  eq(other: MyMarker) { return other.color === this.color; }
}

// 範囲セットの作成
const ranges = RangeSet.of([
  new MyMarker("red").range(0, 10),
  new MyMarker("blue").range(20, 30)
]);

// 範囲セットの更新
const updated = ranges.update({
  add: [new MyMarker("green").range(40, 50)],
  filter: (from, to) => from > 15
});
```

## ユーティリティ

### 文字とクラスタ

```typescript
// コードポイントの取得
const code = codePointAt("😀", 0); // 128512

// コードポイントからの文字列生成
const char = fromCodePoint(128512); // "😀"

// グラフェムクラスタの境界を見つける
const nextCluster = findClusterBreak("a😀b", 0); // 1
```

### 列の計算

```typescript
// 列位置の計算
const cols = countColumn("  hello", 4); // 6 (タブサイズ4の場合)

// 列位置からオフセットを見つける
const offset = findColumn("  hello", 6, 4); // 4
```

## 参考リンク

- [公式ドキュメント](https://codemirror.net/docs/ref/#state)
- [GitHub](https://github.com/codemirror/state)
