/**
 * ロギングユーティリティ
 * アプリケーションのログ出力を抽象化するためのインターフェースとその実装を提供
 */

/**
 * ロガーインターフェース
 * ログ出力を抽象化する
 */
export interface Logger {
  /**
   * 情報ログを出力する
   * @param message ログメッセージ
   */
  info(message: string): void;

  /**
   * エラーログを出力する
   * @param message ログメッセージ
   */
  error(message: string): void;
}

/**
 * コンソールを使用するロガーを作成する
 * @returns コンソールロガー
 */
export function createConsoleLogger(): Logger {
  return {
    info(message: string): void {
      console.log(message);
    },

    error(message: string): void {
      console.error(message);
    },
  };
}
