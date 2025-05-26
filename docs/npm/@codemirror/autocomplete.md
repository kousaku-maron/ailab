# @codemirror/autocomplete

CodeMirrorエディタのための自動補完機能を提供するパッケージです。キーワード補完、スニペット、括弧の自動閉じなどの機能を提供します。

## 基本的な使い方

```typescript
import {EditorView} from "@codemirror/view"
import {autocompletion} from "@codemirror/autocomplete"
import {jsonLanguage} from "@codemirror/lang-json"

// 自動補完機能を有効化
const view = new EditorView({
  parent: document.body,
  extensions: [
    jsonLanguage,
    autocompletion(),
    // 言語に補完候補を提供
    jsonLanguage.data.of({
      autocomplete: ["id", "name", "address"]
    })
  ]
})
```

## 自動補完の設定

```typescript
import {autocompletion} from "@codemirror/autocomplete"

// カスタム設定で自動補完を有効化
const completionExt = autocompletion({
  // 入力時に自動的に補完を開始するか
  activateOnTyping: true,
  // 補完を選択した後に再度補完を開始するか
  activateOnCompletion: completion => completion.type === "method",
  // 入力後に補完を開始するまでの遅延（ミリ秒）
  activateOnTypingDelay: 100,
  // 補完が開いたときに最初の候補を選択するか
  selectOnOpen: true,
  // 補完ソースを上書き
  override: [myCompletionSource],
  // エディタがフォーカスを失ったときに補完を閉じるか
  closeOnBlur: true,
  // レンダリングする最大オプション数
  maxRenderedOptions: 100,
  // デフォルトのキーマップを使用するか
  defaultKeymap: true,
  // カーソルの上に補完を表示するか
  aboveCursor: false,
  // 補完ダイアログに追加するCSSクラス
  tooltipClass: state => "my-completion-tooltip",
  // 補完オプションに追加するCSSクラス
  optionClass: completion => completion.type || "",
  // 補完タイプのアイコンを表示するか
  icons: true,
  // 厳密なフィルタリング（前方一致のみ）を使用するか
  filterStrict: false,
  // 補完が開いた直後のキー操作の遅延
  interactionDelay: 75
})
```

## 補完ソースの作成

補完ソースは、補完候補を提供する関数です。

```typescript
import {CompletionContext, CompletionResult, CompletionSource} from "@codemirror/autocomplete"

// 単純な補完ソース
const myCompletionSource: CompletionSource = (context: CompletionContext) => {
  // カーソル位置の前にある正規表現にマッチするテキストを取得
  const word = context.matchBefore(/\w+/)
  
  // マッチしなかった場合やカーソルが単語の途中にない場合
  if (!word || (word.from === word.to && !context.explicit)) return null
  
  // 補完候補を返す
  return {
    from: word.from,
    options: [
      {label: "option1", type: "keyword"},
      {label: "option2", type: "variable", info: "説明文"},
      {
        label: "option3", 
        type: "function",
        detail: "(param1, param2)",
        info: completion => {
          const div = document.createElement("div")
          div.innerHTML = "<strong>詳細情報</strong><br>関数の詳細説明"
          return div
        }
      }
    ]
  }
}
```

### 補完候補の定義

```typescript
import {Completion} from "@codemirror/autocomplete"

// 補完候補の定義
const completions: Completion[] = [
  {
    // 表示ラベル（必須）
    label: "forEach",
    
    // 表示用の代替ラベル
    displayLabel: "forEach()",
    
    // ラベルの後に表示される追加情報
    detail: "(callback)",
    
    // 選択時に表示される詳細情報
    info: "配列の各要素に対して関数を実行します",
    
    // 適用方法（文字列または関数）
    apply: "(element) => {\n\t\n}",
    
    // 補完のタイプ（アイコン表示に使用）
    type: "method",
    
    // 補完を確定する文字（この文字が入力されると補完が適用される）
    commitCharacters: ["(", "."],
    
    // 優先度調整（-99〜99）
    boost: 10,
    
    // セクション（グループ化）
    section: "配列メソッド"
  }
]
```

### 既存のリストからの補完

```typescript
import {completeFromList} from "@codemirror/autocomplete"

// 文字列の配列から補完ソースを作成
const keywordsSource = completeFromList([
  "if", "else", "while", "for", "function", "return"
])

// オブジェクトの配列から補完ソースを作成
const methodsSource = completeFromList([
  {label: "map", type: "method", info: "新しい配列を作成します"},
  {label: "filter", type: "method", info: "条件に合う要素を抽出します"},
  {label: "reduce", type: "method", info: "値を集約します"}
])
```

### 構文ノードに基づく補完

```typescript
import {ifIn, ifNotIn} from "@codemirror/autocomplete"

// 特定の構文ノード内でのみ有効な補完ソース
const inStringSource = ifIn(["String"], context => {
  return {
    from: context.pos,
    options: [
      {label: "\\n", detail: "改行"},
      {label: "\\t", detail: "タブ"},
      {label: "\\\"", detail: "引用符"}
    ]
  }
})

// 特定の構文ノード以外で有効な補完ソース
const notInCommentSource = ifNotIn(["Comment"], myCompletionSource)
```

## スニペット

スニペットは、プレースホルダを含むコードテンプレートです。

```typescript
import {snippet, snippetCompletion} from "@codemirror/autocomplete"

// スニペットの定義
const forSnippet = snippetCompletion("for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}", {
  label: "for",
  detail: "ループ",
  type: "keyword"
})

// 補完ソースでスニペットを使用
const snippetsSource = context => {
  return {
    from: context.pos,
    options: [
      // スニペット補完
      forSnippet,
      // インラインでスニペットを定義
      snippetCompletion("function ${name}(${params}) {\n\t${}\n}", {
        label: "function",
        detail: "関数定義",
        type: "keyword"
      }),
      // if文のスニペット
      snippetCompletion("if (${condition}) {\n\t${}\n}", {
        label: "if",
        type: "keyword"
      })
    ]
  }
}
```

### スニペットのナビゲーション

```typescript
import {
  nextSnippetField,
  prevSnippetField,
  clearSnippet,
  hasNextSnippetField,
  hasPrevSnippetField,
  snippetKeymap
} from "@codemirror/autocomplete"

// スニペットのキーマップをカスタマイズ
const customSnippetKeymap = snippetKeymap.of([
  {key: "Tab", run: nextSnippetField},
  {key: "Shift-Tab", run: prevSnippetField},
  {key: "Escape", run: clearSnippet}
])
```

## 括弧の自動閉じ

```typescript
import {closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete"

// 括弧の自動閉じを有効化
const bracketExt = closeBrackets()

// 言語ごとの設定（languageDataとして提供）
const bracketConfig = {
  closeBrackets: {
    // 閉じる括弧のペア
    brackets: ["(", "[", "{", "'", '"', "`"],
    // 括弧を自動閉じする文字の前
    before: ")]}:;>",
    // 文字列プレフィックス
    stringPrefixes: ["r", "f", "b"]
  }
}
```

## コマンド

```typescript
import {
  startCompletion,
  closeCompletion,
  acceptCompletion,
  moveCompletionSelection
} from "@codemirror/autocomplete"

// 補完を開始するコマンド
view.dispatch({
  effects: EditorView.focusChangeEffect.of(true)
})
startCompletion(view)

// 補完を閉じるコマンド
closeCompletion(view)

// 現在選択されている補完を適用するコマンド
acceptCompletion(view)

// 補完選択を移動するコマンド
moveCompletionSelection(true)(view) // 次の候補へ
moveCompletionSelection(false)(view) // 前の候補へ
moveCompletionSelection(true, "page")(view) // 次のページへ
```

## キーマップ

```typescript
import {completionKeymap} from "@codemirror/autocomplete"
import {keymap} from "@codemirror/view"

// デフォルトの補完キーマップを適用
const view = new EditorView({
  extensions: [
    keymap.of(completionKeymap)
  ]
})
```

デフォルトのキーバインディング:
- Ctrl-Space (macOSではAlt-`): 補完を開始
- Escape: 補完を閉じる
- ArrowDown: 次の候補を選択
- ArrowUp: 前の候補を選択
- PageDown/PageUp: ページ単位で候補を移動
- Enter: 選択中の候補を適用

## 補完状態の取得

```typescript
import {
  completionStatus,
  currentCompletions,
  selectedCompletion,
  selectedCompletionIndex,
  setSelectedCompletion
} from "@codemirror/autocomplete"

// 補完の状態を取得
const status = completionStatus(view.state) // "active", "pending", または null

// 現在の補完候補を取得
const completions = currentCompletions(view.state)

// 選択中の補完候補を取得
const selected = selectedCompletion(view.state)

// 選択中の補完候補のインデックスを取得
const index = selectedCompletionIndex(view.state)

// 選択中の補完候補を変更
view.dispatch({
  effects: setSelectedCompletion(2) // 3番目の候補を選択
})
```

## 汎用的な補完ソース

```typescript
import {completeAnyWord} from "@codemirror/autocomplete"

// ドキュメント内の単語を補完するソース
const wordCompletionExt = autocompletion({
  override: [completeAnyWord]
})
```

## 実用的な例

### カスタム補完ソースの組み合わせ

```typescript
import {autocompletion, CompletionContext, CompletionResult} from "@codemirror/autocomplete"

// HTMLタグの補完
const htmlTagsSource = (context: CompletionContext): CompletionResult | null => {
  const tagBefore = context.matchBefore(/<([a-zA-Z]*)$/)
  if (!tagBefore) return null
  
  return {
    from: tagBefore.from + 1, // '<'の後から
    options: [
      {label: "div", type: "tag"},
      {label: "span", type: "tag"},
      {label: "img", type: "tag"},
      {label: "a", type: "tag"}
    ],
    // 追加の入力が正規表現にマッチする限り、同じ補完リストを使用
    validFor: /^[a-zA-Z]*$/
  }
}

// HTML属性の補完
const htmlAttrsSource = (context: CompletionContext) => {
  const attrBefore = context.matchBefore(/\s([a-zA-Z]*)$/)
  if (!attrBefore || !context.tokenBefore(["Tag"])) return null
  
  return {
    from: attrBefore.from + 1,
    options: [
      {label: "class", type: "attribute"},
      {label: "id", type: "attribute"},
      {label: "style", type: "attribute"},
      {label: "href", type: "attribute"}
    ]
  }
}

// 複数の補完ソースを組み合わせる
const htmlCompletion = autocompletion({
  override: [htmlTagsSource, htmlAttrsSource]
})
```

### 非同期補完ソース

```typescript
import {CompletionContext, CompletionResult} from "@codemirror/autocomplete"

// APIから補完候補を取得する非同期ソース
const asyncCompletionSource = async (context: CompletionContext): Promise<CompletionResult | null> => {
  const word = context.matchBefore(/\w+/)
  if (!word) return null
  
  try {
    // APIリクエスト
    const response = await fetch(`https://api.example.com/completions?q=${word.text}`)
    const data = await response.json()
    
    // 補完候補を返す
    return {
      from: word.from,
      options: data.items.map(item => ({
        label: item.name,
        detail: item.type,
        info: item.description
      }))
    }
  } catch (error) {
    console.error("補完候補の取得に失敗:", error)
    return null
  }
}
