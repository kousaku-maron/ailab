/**
 * CLI ドメインモデルの型定義
 */

/**
 * Markdownコンテンツの型定義
 * コンテンツ本体とフロントマターを含む
 */
export interface MarkdownContent {
  content: string;
  frontMatter: Record<string, unknown>;
}

/**
 * テンプレート変数の型定義
 * Mustacheテンプレートに渡す変数
 */
export interface TemplateVariables {
  [key: string]: unknown;
}

/**
 * Rooモードの型定義
 */
export interface RooMode {
  slug: string;
  name: string;
  roleDefinition: string;
  groups: string[];
  source: string;
  __filename?: string;
  [key: string]: unknown;
}

/**
 * Rooモードのコレクション
 */
export interface RooModes {
  customModes: RooMode[];
}

/**
 * 設定生成結果の型定義
 */
export interface ConfigResult {
  outputPath: string;
  fileCount: number;
}

/**
 * パス設定の型定義
 */
export interface PathConfig {
  rulesDir: string;
  rulesOutputPath: string;
  modesDir: string;
  modesOutputPath: string;
  claudeDir: string;
  claudeOutputPath: string;
  variablesPath?: string;
}
