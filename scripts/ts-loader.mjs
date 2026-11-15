// Lets plain Node run lib/*.ts with no build step and no new dependency: extensionless
// relative imports resolve to .ts, and Node's built-in stripper removes the types.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { fileURLToPath } from "node:url";

const HAS_EXT = /\.(c|m)?(j|t)sx?$|\.json$/;

export async function resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !HAS_EXT.test(specifier) && context.parentURL) {
    const url = new URL(specifier + ".ts", context.parentURL);
    if (existsSync(fileURLToPath(url))) return { url: url.href, format: "module", shortCircuit: true };
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (!url.endsWith(".ts")) return next(url, context);
  const source = await readFile(fileURLToPath(url), "utf8");
  return { format: "module", source: stripTypeScriptTypes(source), shortCircuit: true };
}
