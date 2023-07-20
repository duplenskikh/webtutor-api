import { join } from "path";

export const SRC_PATH = "src";
export const TS_CONFIG_PATH = join(SRC_PATH, "tsconfig.json");
export const INSTALL_SCRIPT = join(SRC_PATH, "install.sh");
export const API_TS = join(SRC_PATH, "api.ts");
export const INDEX_XML = join(SRC_PATH, "index.xml");
export const INDEX_TS = join(SRC_PATH, "index.ts");
export const CONFIG_JSON = join(SRC_PATH, "config.json");

export const BUILD_PATH = "build";

export const WATCHED_TS_TYPES = [
  join(SRC_PATH, "api", "*.ts"),
  join(SRC_PATH, "services", "*.ts"),
  join(SRC_PATH, "utils", "*.ts"),
];

export const EXPORT_REGEXP = /^(export\s{[^;]*};?)$/gm;
export const IMPORT_REGEXP = /^(import\s[^;]*";?)$/gm;
