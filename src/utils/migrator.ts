import { dapi } from "../dapi";

function getMigrations(previousMigrations: string[]) {
  const files = ReadDirectory("./migrations");
  const migrations = [];
  let migration;

  for (let i = 0; i < files.length; i++) {
    migration = files[i];

    if (previousMigrations.indexOf(migration) !== -1) {
      continue;
    }

    migrations.push(migration);
  }

  return migrations;
}

export function init() {
  if (!UrlExists(dapi.config.migrations.url)) {
    PutUrlData(dapi.config.migrations.url, "[]");
  }

  const previousMigrations = tools.read_object<string[]>(LoadFileData(dapi.config.migrations.url));
  const migrations = getMigrations(previousMigrations);
  const appliedMigrations = make(migrations, "up");

  PutUrlData(
    dapi.config.migrations.url,
    tools.object_to_text(ArrayUnion(previousMigrations, appliedMigrations), "json")
  );
}

function make(migrations: string[], action: "up" | "down") {
  let migration;
  const appliedMigrations = [];

  for (let i = 0; i < migrations.length; i++) {
    migration = OpenCodeLib(migrations[i]);

    try {
      CallObjectMethod(migration, action);
      appliedMigrations.push(migrations[i]);
    } catch (error) {
      dapi.utils.log.error(`Произошла ошибка при применении "${action}" миграции "${migration}": ${error}`, "migrator");
    }
  }

  return appliedMigrations;
}
