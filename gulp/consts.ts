import { join } from "path";

const PROJECT_PATH = join(__dirname, "..");
export const SRC_PATH = join(PROJECT_PATH, "src");
export const TS_CONFIG_PATH = join(SRC_PATH, "tsconfig.json");
export const INSTALL_SH = join(SRC_PATH, "install.sh");
export const INSTALL_PS1 = join(SRC_PATH, "install.ps1");
export const API_TS = join(SRC_PATH, "api.ts");
export const INDEX_XML = join(SRC_PATH, "index.xml");
export const INDEX_TS = join(SRC_PATH, "index.ts");
export const CONFIG_JSON = join(SRC_PATH, "config.json");
export const MIGRATIONS_PATH = join(SRC_PATH, "migrations");

const MISC_PATH = join(PROJECT_PATH, "misc");

const OPENAPI_PATH = join(MISC_PATH, "openapi");
export const OPENAPI_JSON = join(OPENAPI_PATH, "openapi.json");
export const OPENAPI_HTML = join(OPENAPI_PATH, "openapi.html");

export const MIGRATION_TEMPLATE_PATH = join(MISC_PATH, "migrations", "migration.template.ts");

export const BUILD_PATH = join(PROJECT_PATH, "build");

export const OPENAPI_BUILD_PATH = join(BUILD_PATH, "openapi");
export const BUILD_OPENAPI_JSON_PATH = join(OPENAPI_BUILD_PATH, "openapi.json");
export const BUILD_OPENAPI_HTML_PATH = join(OPENAPI_BUILD_PATH, "openapi.html");

export const PACKAGES_PATH = join(PROJECT_PATH, "packages");

export const WATCHED_TS_TYPES = [
  join(SRC_PATH, "controllers", "*.ts"),
  join(SRC_PATH, "services", "*.ts"),
  join(SRC_PATH, "utils", "*.ts"),
];

export const DEPLOY_URL = "deploy";
export const BUILD_URL = join("deploy", "build");

export const EXPORT_REGEXP = /^(export\s{[^;]*};?)$/gm;
export const IMPORT_REGEXP = /^(import\s[^;]*";?)$/gm;
