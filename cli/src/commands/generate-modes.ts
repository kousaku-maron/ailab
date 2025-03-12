/**
 * モード生成コマンド
 * .roomodes ファイルを生成するコマンド
 */
import path from "path";
import { FileSystem } from "../adapters/file-system";
import { MarkdownParser } from "../adapters/markdown-parser";
import { createRooMode, createRooModesOutput } from "../domain/modes";
import { ConfigResult, RooMode, TemplateVariables } from "../domain/types";
import { Logger } from "../utils/logger";

/**
 * モードを生成する
 * @param fileSystem ファイルシステムアダプター
 * @param markdownParser Markdownパーサー
 * @param logger ロガー
 * @param modesDir モードディレクトリ
 * @param modesOutputPath モード出力パス
 * @param variablesPath 変数ファイルのパス（オプション）
 * @returns 生成結果とモードの配列
 */
export async function generateModes(
  fileSystem: FileSystem,
  markdownParser: MarkdownParser,
  logger: Logger,
  modesDir: string,
  modesOutputPath: string,
  variablesPath?: string
): Promise<{ result: ConfigResult; modes: RooMode[] }> {
  logger.info(`Generating modes from ${modesDir}...`);

  const modes: RooMode[] = [];

  // テンプレート変数を読み込む
  const variables: TemplateVariables = variablesPath
    ? fileSystem.loadTemplateVariables(variablesPath)
    : {};

  if (Object.keys(variables).length > 0) {
    logger.info(`Loaded template variables from ${variablesPath}`);
  }

  // モードディレクトリが存在する場合のみ処理
  if (fileSystem.exists(modesDir)) {
    // モードディレクトリからファイル一覧を取得
    const files = fileSystem.readDir(modesDir);

    // 各ファイルの内容を読み込み、モードを作成
    for (const file of files) {
      const filePath = path.join(modesDir, file);
      const content = fileSystem.readFile(filePath);
      const slug = file.replace(".md", "");
      let parsedContent = markdownParser.parse(content);

      // テンプレート変数が存在する場合、テンプレート処理を行う
      if (Object.keys(variables).length > 0) {
        parsedContent = markdownParser.processTemplate(
          parsedContent,
          variables
        );
      }

      const mode = createRooMode(slug, parsedContent, filePath);
      modes.push(mode);
    }
  }

  // モードの出力を作成
  const modesOutput = createRooModesOutput(modes);

  // 結果をファイルに書き込む
  fileSystem.writeFile(modesOutputPath, JSON.stringify(modesOutput, null, 2));

  return {
    result: {
      outputPath: modesOutputPath,
      fileCount: modes.length,
    },
    modes,
  };
}
