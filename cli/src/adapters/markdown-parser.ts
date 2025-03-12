/**
 * Markdownパーサーアダプター
 * Markdownの解析を抽象化するためのインターフェースとその実装
 */
import { parseFrontMatter, processMarkdownTemplate } from "../domain/markdown";
import { MarkdownContent, TemplateVariables } from "../domain/types";

/**
 * Markdownパーサーインターフェース
 * Markdownの解析を抽象化する
 */
export interface MarkdownParser {
  /**
   * Markdownコンテンツを解析する
   * @param content Markdownコンテンツ
   * @returns 解析結果
   */
  parse(content: string): MarkdownContent;

  /**
   * Markdownコンテンツをテンプレートとして処理する
   * @param content Markdownコンテンツ
   * @param variables テンプレート変数
   * @returns 処理されたMarkdownコンテンツ
   */
  processTemplate(
    content: MarkdownContent,
    variables: TemplateVariables
  ): MarkdownContent;
}

/**
 * 実際のMarkdownパーサーを使用するアダプターを作成する
 * @returns Markdownパーサーアダプター
 */
export function createMarkdownParser(): MarkdownParser {
  return {
    parse(content: string): MarkdownContent {
      return parseFrontMatter(content);
    },
    processTemplate(
      content: MarkdownContent,
      variables: TemplateVariables
    ): MarkdownContent {
      return processMarkdownTemplate(content, variables);
    },
  };
}
