import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { findControllers } from "@misc/utils";

const PROJECT_PATH = join(__dirname, "..", "..");
const e2eTestsPath = join(PROJECT_PATH, "cypress", "e2e");

export async function dirtyCheckCoverage() {
  const controllers = (await findControllers()).filter(x => x.functions.filter(y => y.access !== "dev").length > 0);
  const tests = readdirSync(e2eTestsPath);

  console.log(chalk.greenBright(`Собрано ${controllers} контроллеров`));
  console.log(chalk.greenBright(`Собрано ${controllers} тестов`));

  const uncovered = controllers.filter(x => tests.indexOf(`${x.name}.cy.ts`) === -1).map(x => x.name);

  if (tests.length < controllers.length) {
    console.log(chalk.redBright("⚠️ Необходимо покрыть все контроллеры тестами e2e."));
    console.log(chalk.redBright(`Остались непокрытые тестами:\n${uncovered.join("\n")}`));
    process.exit(1);
  }
}
