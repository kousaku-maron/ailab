/**
 * モードドメインロジック
 * Rooモードの処理に関する純粋関数を提供
 */
import path from "path";
import { MarkdownContent, RooMode, RooModes } from "./types";

/**
 * Rooモードを作成する
 * @param slug モードのスラッグ
 * @param content Markdownコンテンツ
 * @param filePath ファイルパス
 * @returns Rooモードオブジェクト
 */
export function createRooMode(
  slug: string,
  content: MarkdownContent,
  filePath: string
): RooMode {
  return {
    ...content.frontMatter,
    slug,
    roleDefinition: content.content,
    __filename: filePath,
  } as RooMode;
}

/**
 * Rooモードのコレクションを作成する
 * @param modes Rooモードの配列
 * @returns Rooモードのコレクション
 */
export function createRooModesOutput(modes: RooMode[]): RooModes {
  return { customModes: modes };
}

/**
 * Rooモードの情報をルールファイル用にフォーマットする
 * @param modes Rooモードの配列
 * @param basePath 基準パス
 * @returns フォーマットされたテキスト
 */
export function formatModesForRules(
  modes: RooMode[],
  basePath: string
): string {
  if (modes.length === 0) return "";

  let output = `\n\nこのプロジェクトには以下のモードが定義されています:`;
  for (const mode of modes) {
    output += `\n- ${mode.slug} ${mode.name || ""} at ${path.relative(
      basePath,
      mode.__filename || ""
    )}`;
  }
  return output;
}
