/**
 * エラー処理ユーティリティ
 * アプリケーション固有のエラー型とエラーハンドリング関数を提供
 */

/**
 * 設定エラー
 * 設定に関するエラーを表す
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * ファイルシステムエラー
 * ファイルシステム操作に関するエラーを表す
 */
export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileSystemError";
  }
}

/**
 * エラーを処理する
 * エラーの種類に応じて適切なメッセージを表示し、プロセスを終了する
 * @param error エラーオブジェクト
 */
export function handleError(error: unknown): never {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error(`Unknown error: ${error}`);
  }
  process.exit(1);
}
