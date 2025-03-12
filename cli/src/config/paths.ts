/**
 * アプリケーションで使用されるパス設定
 */
import path from "path";
import { PathConfig } from "../domain/types";

/**
 * デフォルトのパス設定を取得する
 * 現在の作業ディレクトリを基準にパスを設定
 */
export function getDefaultPaths(): PathConfig {
  const cwd = process.cwd();

  return {
    rulesDir: path.join(cwd, "../.cline/rules"),
    rulesOutputPath: path.join(cwd, "../.clinerules"),
    modesDir: path.join(cwd, "../.cline/roomodes"),
    modesOutputPath: path.join(cwd, "../.roomodes"),
    claudeDir: path.join(cwd, "../.claude"),
    claudeOutputPath: path.join(cwd, "../.claude_preferences"),
    variablesPath: path.join(cwd, "../variables.json"),
  };
}
