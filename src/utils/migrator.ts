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

  const previousMigrations = tools.read_object(LoadFileData(dapi.config.migrations.url));
  const migrations = getMigrations(previousMigrations);
  make(migrations, "up");
}

function make(migrations: string[], action: "up" | "down") {
  let migration;

  for (let i = 0; i < migrations.length; i++) {
    migration = OpenCodeLib(migrations[i]);

    try {
      CallObjectMethod(migration, action);
    } catch (error) {
      dapi.utils.log.error(`Произошла ошибка при применении "${action}" миграции "${migration}": ${error}`, "migrator");
    }
  }
}
