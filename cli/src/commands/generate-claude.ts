/**
 * Claude設定生成コマンド
 * .claude_preferences ファイルを生成するコマンド
 */
import path from "path";
import { FileSystem } from "../adapters/file-system";
import { combineMarkdownFiles, processTemplate } from "../domain/markdown";
import { ConfigResult, TemplateVariables } from "../domain/types";
import { Logger } from "../utils/logger";

/**
 * Claude設定を生成する
 * @param fileSystem ファイルシステムアダプター
 * @param logger ロガー
 * @param claudeDir Claude設定ディレクトリ
 * @param claudeOutputPath Claude設定出力パス
 * @param variablesPath 変数ファイルのパス（オプション）
 * @returns 生成結果
 */
export async function generateClaude(
  fileSystem: FileSystem,
  logger: Logger,
  claudeDir: string,
  claudeOutputPath: string,
  variablesPath?: string
): Promise<ConfigResult> {
  logger.info(`Generating Claude preferences from ${claudeDir}...`);

  // テンプレート変数を読み込む
  const variables: TemplateVariables = variablesPath
    ? fileSystem.loadTemplateVariables(variablesPath)
    : {};

  if (Object.keys(variables).length > 0) {
    logger.info(`Loaded template variables from ${variablesPath}`);
  }

  // Claude設定ディレクトリからファイル一覧を取得
  const files = fileSystem.readDir(claudeDir);
  const contents: string[] = [];

  // 各ファイルの内容を読み込む
  for (const file of files) {
    const filePath = path.join(claudeDir, file);
    let content = fileSystem.readFile(filePath);

    // テンプレート変数が存在する場合、テンプレート処理を行う
    if (Object.keys(variables).length > 0) {
      content = processTemplate(content, variables);
    }

    contents.push(content);
  }

  // ファイルの内容を結合
  const output = combineMarkdownFiles(contents);

  // 結果をファイルに書き込む
  fileSystem.writeFile(claudeOutputPath, output);

  return {
    outputPath: claudeOutputPath,
    fileCount: files.length,
  };
}
