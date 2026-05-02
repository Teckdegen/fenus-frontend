/**
 * Entry shim — run from repo root: `node bot.js`
 * Delegates to bot/bot.js with cwd = bot/ so .env and node_modules resolve correctly.
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import process from "node:process";

const root = dirname(fileURLToPath(import.meta.url));
const botDir = join(root, "bot");
process.chdir(botDir);
await import(pathToFileURL(join(botDir, "bot.js")).href);
