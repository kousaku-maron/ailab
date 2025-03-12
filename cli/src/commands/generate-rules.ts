/**
 * ルール生成コマンド
 * .clinerules ファイルを生成するコマンド
 */
import path from "path";
import { FileSystem } from "../adapters/file-system";
import { combineMarkdownFiles, processTemplate } from "../domain/markdown";
import { formatModesForRules } from "../domain/modes";
import { ConfigResult, RooMode, TemplateVariables } from "../domain/types";
import { Logger } from "../utils/logger";

/**
 * ルールを生成する
 * @param fileSystem ファイルシステムアダプター
 * @param logger ロガー
 * @param rulesDir ルールディレクトリ
 * @param rulesOutputPath ルール出力パス
 * @param modes Rooモードの配列
 * @param basePath 基準パス
 * @param variablesPath 変数ファイルのパス（オプション）
 * @returns 生成結果
 */
export async function generateRules(
  fileSystem: FileSystem,
  logger: Logger,
  rulesDir: string,
  rulesOutputPath: string,
  modes: RooMode[],
  basePath: string,
  variablesPath?: string
): Promise<ConfigResult> {
  logger.info(`Generating rules from ${rulesDir}...`);

  // テンプレート変数を読み込む
  const variables: TemplateVariables = variablesPath
    ? fileSystem.loadTemplateVariables(variablesPath)
    : {};

  if (Object.keys(variables).length > 0) {
    logger.info(`Loaded template variables from ${variablesPath}`);
  }

  // ルールディレクトリからファイル一覧を取得
  const files = fileSystem.readDir(rulesDir);
  const contents: string[] = [];

  // 各ファイルの内容を読み込む
  for (const file of files) {
    const filePath = path.join(rulesDir, file);
    let content = fileSystem.readFile(filePath);

    // テンプレート変数が存在する場合、テンプレート処理を行う
    if (Object.keys(variables).length > 0) {
      content = processTemplate(content, variables);
    }

    contents.push(content);
  }

  // ファイルの内容を結合
  let output = combineMarkdownFiles(contents);

  // モード情報を追加
  if (modes.length > 0) {
    output += formatModesForRules(modes, basePath);
  }

  // 結果をファイルに書き込む
  fileSystem.writeFile(rulesOutputPath, output);

  return {
    outputPath: rulesOutputPath,
    fileCount: files.length,
  };
}
