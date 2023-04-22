import { join } from "path";

export const SRC_PATH = "src";
export const TS_CONFIG_PATH = join(SRC_PATH, "tsconfig.json");
export const BUILD_PATH = "build";
export const WATCHED_TS_TYPES = [
  join(SRC_PATH, "utils", "*.ts"),
  join(SRC_PATH, "api", "*.ts"),
];

export const EXPORT_REGEXP = /^(export\s{[^;]*};?)$/gm;
export const IMPORT_REGEXP = /^(import\s[^;]*";?)$/gm;
