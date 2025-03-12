#!/usr/bin/env node
/**
 * CLIエントリーポイント
 * 設定ファイル生成ツールのメインエントリーポイント
 */
import { createFileSystemAdapter } from "./adapters/file-system";
import { createMarkdownParser } from "./adapters/markdown-parser";
import { generateClaude } from "./commands/generate-claude";
import { generateModes } from "./commands/generate-modes";
import { generateRules } from "./commands/generate-rules";
import { getDefaultPaths } from "./config/paths";
import { handleError } from "./utils/errors";
import { createConsoleLogger } from "./utils/logger";

/**
 * メイン関数
 * アプリケーションのエントリーポイント
 */
async function main() {
  // アダプターとユーティリティの初期化
  const fileSystem = createFileSystemAdapter();
  const markdownParser = createMarkdownParser();
  const logger = createConsoleLogger();
  const paths = getDefaultPaths();

  try {
    // 変数ファイルの存在確認
    const variablesPath = paths.variablesPath;
    const hasVariables = variablesPath && fileSystem.exists(variablesPath);

    if (hasVariables) {
      logger.info(`Using template variables from ${variablesPath}`);
    }

    // モードを生成
    const { result: modesResult, modes } = await generateModes(
      fileSystem,
      markdownParser,
      logger,
      paths.modesDir,
      paths.modesOutputPath,
      hasVariables ? variablesPath : undefined
    );
    logger.info(
      `Generated ${paths.modesOutputPath} from ${modesResult.fileCount} mode files`
    );

    // ルールを生成
    const rulesResult = await generateRules(
      fileSystem,
      logger,
      paths.rulesDir,
      paths.rulesOutputPath,
      modes,
      process.cwd(),
      hasVariables ? variablesPath : undefined
    );
    logger.info(
      `Generated ${paths.rulesOutputPath} from ${rulesResult.fileCount} prompt files`
    );

    // Claude設定を生成
    const claudeResult = await generateClaude(
      fileSystem,
      logger,
      paths.claudeDir,
      paths.claudeOutputPath,
      hasVariables ? variablesPath : undefined
    );
    logger.info(
      `Generated ${paths.claudeOutputPath} from ${claudeResult.fileCount} markdown files`
    );
  } catch (error) {
    handleError(error);
  }
}

// メイン関数を実行
main().catch(handleError);
