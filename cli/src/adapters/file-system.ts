/**
 * ファイルシステムアダプター
 * ファイルシステム操作を抽象化するためのインターフェースとその実装
 */
import fs from "fs";
import path from "path";
import { TemplateVariables } from "../domain/types";

/**
 * ファイルシステムインターフェース
 * ファイルシステム操作を抽象化する
 */
export interface FileSystem {
  /**
   * ディレクトリ内のファイル一覧を取得する
   * @param dir ディレクトリパス
   * @returns ファイル名の配列
   */
  readDir(dir: string): string[];

  /**
   * ファイルの内容を読み込む
   * @param filePath ファイルパス
   * @returns ファイルの内容
   */
  readFile(filePath: string): string;

  /**
   * ファイルに内容を書き込む
   * @param filePath ファイルパス
   * @param content 書き込む内容
   */
  writeFile(filePath: string, content: string): void;

  /**
   * ファイルまたはディレクトリが存在するかを確認する
   * @param filePath ファイルまたはディレクトリのパス
   * @returns 存在する場合はtrue、存在しない場合はfalse
   */
  exists(filePath: string): boolean;

  /**
   * JSONファイルからテンプレート変数を読み込む
   * @param filePath JSONファイルのパス
   * @returns テンプレート変数
   */
  loadTemplateVariables(filePath: string): TemplateVariables;
}

/**
 * 実際のファイルシステムを使用するアダプターを作成する
 * @returns ファイルシステムアダプター
 */
export function createFileSystemAdapter(): FileSystem {
  return {
    readDir(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries
        .filter(
          (entry) =>
            entry.isFile() &&
            entry.name.endsWith(".md") &&
            !entry.name.startsWith("_")
        )
        .map((entry) => entry.name)
        .sort();
    },

    readFile(filePath: string): string {
      return fs.readFileSync(filePath, "utf-8");
    },

    writeFile(filePath: string, content: string): void {
      fs.writeFileSync(filePath, content);
    },

    exists(filePath: string): boolean {
      return fs.existsSync(filePath);
    },

    loadTemplateVariables(filePath: string): TemplateVariables {
      if (!fs.existsSync(filePath)) {
        return {};
      }
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as TemplateVariables;
      } catch (error) {
        console.error(`Error loading template variables: ${error}`);
        return {};
      }
    },
  };
}
