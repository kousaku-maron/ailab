# Playwright

Playwrightは、Microsoftが開発したブラウザ自動化ライブラリで、Chromium、Firefox、WebKitなどの主要ブラウザを自動化するためのAPIを提供します。

- [公式ドキュメント](https://playwright.dev/docs/intro)
- [GitHub](https://github.com/microsoft/playwright)

## インストール

### プロジェクトの初期化

```bash
# 既存のプロジェクトにPlaywrightをインストール
npm init playwright@latest

# または新しいプロジェクトを作成
npm init playwright@latest new-project
```

### 手動インストール

```bash
npm install -D @playwright/test
# ブラウザをインストール
npx playwright install
```

## 基本的な使い方

### テストファイルの作成

```typescript
// tests/example.spec.ts
import { test, expect } from '@playwright/test';

test('基本的なテスト', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // タイトルの検証
  await expect(page).toHaveTitle(/Playwright/);
  
  // 要素のクリック
  await page.getByRole('link', { name: 'Get started' }).click();
  
  // URLの検証
  await expect(page).toHaveURL(/.*intro/);
});
```

### テストの実行

```bash
# すべてのテストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test example.spec.ts

# UIモードで実行
npx playwright test --ui

# 特定のブラウザでのみ実行
npx playwright test --project=chromium

# デバッグモードで実行
npx playwright test --debug
```

## ブラウザの操作

### ブラウザの起動

```typescript
import { chromium } from 'playwright';

// ブラウザの起動
const browser = await chromium.launch({ headless: false });

// コンテキストの作成
const context = await browser.newContext();

// ページの作成
const page = await context.newPage();

// 操作後のクリーンアップ
await context.close();
await browser.close();
```

### ページのナビゲーション

```typescript
// URLへの移動
await page.goto('https://example.com');

// 戻る・進む
await page.goBack();
await page.goForward();

// リロード
await page.reload();

// URLの取得
const url = page.url();
```

## 要素の操作

### 要素の選択

```typescript
// テキストで要素を選択
const getStarted = page.getByText('Get Started');

// ロールで要素を選択
const button = page.getByRole('button', { name: 'Submit' });

// ラベルで要素を選択
const nameInput = page.getByLabel('Name');

// プレースホルダーで要素を選択
const searchInput = page.getByPlaceholder('Search');

// テストIDで要素を選択
const element = page.getByTestId('submit-button');

// CSSセレクタで要素を選択
const logo = page.locator('.logo');

// XPathで要素を選択
const header = page.locator('//h1');
```

### 要素の操作

```typescript
// クリック
await page.getByRole('button').click();

// テキスト入力
await page.getByRole('textbox').fill('テキスト');

// チェックボックスの操作
await page.getByRole('checkbox').check();
await page.getByRole('checkbox').uncheck();

// セレクトボックスの操作
await page.getByRole('combobox').selectOption('オプション');

// ファイルのアップロード
await page.getByLabel('Upload').setInputFiles('path/to/file.jpg');

// ドラッグ&ドロップ
await page.getByText('ドラッグ要素').dragTo(page.getByText('ドロップ先'));

// ホバー
await page.getByRole('link').hover();

// キーボード操作
await page.keyboard.press('Enter');
await page.keyboard.type('テキスト');
```

## アサーション

```typescript
// ページのタイトル検証
await expect(page).toHaveTitle('Playwright');

// URL検証
await expect(page).toHaveURL('https://playwright.dev/');

// 要素の可視性検証
await expect(page.getByText('Welcome')).toBeVisible();

// 要素のテキスト検証
await expect(page.getByRole('heading')).toHaveText('Playwright');

// 要素の属性検証
await expect(page.getByRole('button')).toHaveAttribute('disabled', '');

// 要素の数検証
await expect(page.getByRole('listitem')).toHaveCount(5);

// スクリーンショット比較
await expect(page).toHaveScreenshot();
```

## 高度な機能

### ネットワークのインターセプト

```typescript
// リクエストのインターセプト
await page.route('**/api/users', route => route.fulfill({
  status: 200,
  body: JSON.stringify([{ name: 'John' }])
}));

// リクエストのブロック
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());

// レスポンスの監視
page.on('response', response => {
  if (response.url().includes('/api/')) {
    console.log(`${response.status()} ${response.url()}`);
  }
});
```

### ダイアログの処理

```typescript
// ダイアログを自動的に処理
page.on('dialog', dialog => dialog.accept());

// または特定の値で処理
page.on('dialog', dialog => {
  if (dialog.type() === 'prompt') {
    dialog.accept('入力値');
  } else {
    dialog.dismiss();
  }
});
```

### 認証

```typescript
// 認証情報の設定
const context = await browser.newContext({
  httpCredentials: {
    username: 'user',
    password: 'pass'
  }
});

// 認証状態の保存
await context.storageState({ path: 'auth.json' });

// 認証状態の読み込み
const authenticatedContext = await browser.newContext({
  storageState: 'auth.json'
});
```

## テスト設定

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### フィクスチャの使用

```typescript
import { test as base } from '@playwright/test';

// カスタムフィクスチャの定義
type MyFixtures = {
  loggedInPage: Page;
};

// テストの拡張
const test = base.extend<MyFixtures>({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('user');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');
    
    // フィクスチャを使用
    await use(page);
    
    // クリーンアップ
    await page.getByRole('button', { name: 'Logout' }).click();
  },
});

// テストでの使用
test('ログイン後のテスト', async ({ loggedInPage }) => {
  await expect(loggedInPage.getByText('Welcome')).toBeVisible();
});
```

### テストのグループ化とスキップ

```typescript
import { test, expect } from '@playwright/test';

// テストのグループ化
test.describe('ユーザー管理', () => {
  test('ユーザーの作成', async ({ page }) => {
    // ...
  });
  
  test('ユーザーの編集', async ({ page }) => {
    // ...
  });
});

// 条件付きスキップ
test('特定の環境でスキップ', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKitではこの機能はサポートされていません');
  // ...
});

// 特定のテストだけを実行
test.only('このテストだけ実行', async ({ page }) => {
  // ...
});

// 修正予定のテスト
test.fixme('後で修正するテスト', async ({ page }) => {
  // ...
});
```

## APIリクエスト

```typescript
import { test, expect } from '@playwright/test';

test('APIリクエストのテスト', async ({ request }) => {
  // GETリクエスト
  const getResponse = await request.get('https://api.example.com/users');
  expect(getResponse.ok()).toBeTruthy();
  const users = await getResponse.json();
  expect(users.length).toBeGreaterThan(0);
  
  // POSTリクエスト
  const postResponse = await request.post('https://api.example.com/users', {
    data: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
  expect(postResponse.status()).toBe(201);
  
  // PUTリクエスト
  const putResponse = await request.put('https://api.example.com/users/1', {
    data: {
      name: 'Updated Name'
    }
  });
  expect(putResponse.status()).toBe(200);
  
  // DELETEリクエスト
  const deleteResponse = await request.delete('https://api.example.com/users/1');
  expect(deleteResponse.status()).toBe(204);
});
```

## コードカバレッジ

```bash
# コードカバレッジを有効にしてテスト実行
npx playwright test --coverage
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ...
  use: {
    // ...
    launchOptions: {
      args: ['--enable-coverage']
    }
  },
  // ...
});
```

## VS Code拡張機能

PlaywrightはVS Code拡張機能を提供しており、テストの作成、実行、デバッグを効率的に行うことができます。

### インストール

1. VS Codeの拡張機能パネルを開く（Ctrl+Shift+X / Cmd+Shift+X）
2. 「Playwright」を検索
3. 「Playwright Test for VSCode」をインストール

### 拡張機能の機能

#### テストの実行と管理

```
- テストエクスプローラーでテストの一覧表示と実行
- 特定のテストファイル、テストケース、プロジェクトの選択実行
- テスト結果の詳細表示
- テストレポートの表示
```

![VS Code拡張機能のテストエクスプローラー](https://playwright.dev/img/docs/test-explorer.png)

#### テストの作成

拡張機能には、ブラウザでの操作を記録してテストを自動生成する機能があります。

1. コマンドパレットを開く（Ctrl+Shift+P / Cmd+Shift+P）
2. 「Playwright: Record new」を選択
3. 使用するブラウザを選択
4. ブラウザでの操作を記録
5. 記録が完了したら「記録を終了」ボタンをクリック

生成されたコードは自動的にテストファイルに挿入されます。

#### テストのデバッグ

1. テストファイル内のブレークポイントを設定
2. テストエクスプローラーからテストを右クリック
3. 「Debug Test」を選択

または、コードエディタのテスト関数の横に表示される「Debug」ボタンをクリックします。

デバッグ中は以下の機能が利用できます：
- 変数の監視
- コールスタックの確認
- ステップ実行
- ブラウザウィンドウでの状態確認

#### トレースビューア

テスト実行時に記録されたトレースを表示して、テストの実行状況を詳細に確認できます。

1. テスト実行後、テスト結果の「Trace」リンクをクリック
2. または、コマンドパレットから「Playwright: Show Trace Viewer」を選択

トレースビューアでは以下の情報を確認できます：
- タイムライン表示
- スクリーンショット
- DOM構造
- ネットワークリクエスト
- コンソールログ

### 設定

VS Code拡張機能の設定は、VS Codeの設定から変更できます：

1. 設定を開く（Ctrl+, / Cmd+,）
2. 「Playwright」で検索

主な設定項目：
- テスト実行時のブラウザの表示/非表示
- テストレポートの自動表示
- トレース記録の設定

## Chrome拡張機能

Playwrightには、Chrome拡張機能との連携に関する2つの側面があります：テスト記録用の拡張機能と、Chrome拡張機能自体のテスト方法です。

### テスト記録用のChrome拡張機能

#### Playwright Chrome Recorder

Chrome DevToolsと連携して、ユーザーの操作を記録しPlaywrightのテストコードを生成する拡張機能です。

1. [Chrome Web Store](https://chromewebstore.google.com/detail/playwright-chrome-recorde/bfnbgoehgplaehdceponclakmhlgjlpd)からインストール
2. Chrome DevToolsを開く（F12またはCtrl+Shift+I / Cmd+Option+I）
3. 「Recorder」タブを選択
4. 記録を開始し、ウェブサイトで操作を行う
5. 記録を停止し、「Export」ボタンをクリック
6. 「Playwright」を選択してコードを生成

#### Playwright CRX

DevToolsのRecorderパネルからPlaywrightテストを直接エクスポートできる拡張機能です。

1. [Chrome Web Store](https://chromewebstore.google.com/detail/playwright-crx/jambeljnbnfbkcpnoiaedcabbgmnnlcd)からインストール
2. Chrome DevToolsのRecorderパネルで記録を作成
3. エクスポートオプションからPlaywright形式を選択

### Chrome拡張機能のテスト

PlaywrightでChrome拡張機能自体をテストすることも可能です。

#### 拡張機能のロード

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ...
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // Chrome拡張機能のパスを指定
        launchOptions: {
          args: [
            `--disable-extensions-except=/path/to/extension`,
            `--load-extension=/path/to/extension`
          ]
        }
      }
    }
  ]
});
```

#### 拡張機能のテスト

```typescript
import { test, expect } from '@playwright/test';

// 拡張機能のIDを取得するヘルパー関数
async function getExtensionId(page) {
  await page.goto('chrome://extensions');
  const id = await page.evaluate(() => {
    const extensions = document.querySelector('extensions-manager').shadowRoot
      .querySelector('extensions-item-list').shadowRoot
      .querySelectorAll('extensions-item');
    for (const extension of extensions) {
      if (extension.shadowRoot.querySelector('.name').textContent === '拡張機能名') {
        return extension.getAttribute('id');
      }
    }
    return null;
  });
  return id;
}

test('拡張機能のポップアップをテスト', async ({ page }) => {
  // 拡張機能のIDを取得
  const extensionId = await getExtensionId(page);
  
  // 拡張機能のポップアップページを開く
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  
  // ポップアップ内の要素をテスト
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
});
```

#### 注意点

- Chrome拡張機能のテストは、Chromiumブラウザでのみ動作します
- 拡張機能は永続的なコンテキスト（persistent context）で起動する必要があります
- 一部の拡張機能機能（バックグラウンドスクリプトなど）は直接テストが難しい場合があります

## 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/docs/intro)
- [APIリファレンス](https://playwright.dev/docs/api/class-playwright)
- [テストの書き方](https://playwright.dev/docs/writing-tests)
- [アサーション](https://playwright.dev/docs/test-assertions)
- [ベストプラクティス](https://playwright.dev/docs/best-practices)
- [VS Code拡張機能ガイド](https://playwright.dev/docs/getting-started-vscode)
- [Chrome拡張機能のテスト](https://playwright.dev/docs/chrome-extensions)
