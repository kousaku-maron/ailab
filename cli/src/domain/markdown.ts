/**
 * Markdownドメインロジック
 * Markdownファイルの処理に関する純粋関数を提供
 */
import yaml from "js-yaml";
import Mustache from "mustache";
import { MarkdownContent, TemplateVariables } from "./types";

/**
 * Markdownコンテンツからフロントマターを解析する
 * @param content Markdownコンテンツ
 * @returns フロントマターとコンテンツ本体を含むオブジェクト
 */
export function parseFrontMatter(content: string): MarkdownContent {
  const frontMatter = content.match(/^---\n([\s\S]+?)\n---\n/);
  if (!frontMatter) {
    return { frontMatter: {}, content };
  }
  const parsed = yaml.load(frontMatter[1]) as Record<string, unknown>;
  return {
    frontMatter: parsed,
    content: content.replace(frontMatter[0], ""),
  };
}

/**
 * 複数のMarkdownファイルの内容を結合する
 * @param contents Markdownコンテンツの配列
 * @returns 結合されたMarkdownコンテンツ
 */
export function combineMarkdownFiles(contents: string[]): string {
  return contents.join("\n\n");
}

/**
 * Mustacheテンプレートを処理する
 * @param content テンプレートコンテンツ
 * @param variables テンプレート変数
 * @returns 処理されたコンテンツ
 */
export function processTemplate(
  content: string,
  variables: TemplateVariables
): string {
  // HTMLエスケープを無効化
  Mustache.escape = (text) => text;
  return Mustache.render(content, variables);
}

/**
 * Markdownコンテンツをテンプレートとして処理する
 * @param content Markdownコンテンツ
 * @param variables テンプレート変数
 * @returns 処理されたMarkdownコンテンツ
 */
export function processMarkdownTemplate(
  content: MarkdownContent,
  variables: TemplateVariables
): MarkdownContent {
  return {
    frontMatter: content.frontMatter,
    content: processTemplate(content.content, variables),
  };
}
