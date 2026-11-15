// Applies db/schema.sql to DATABASE_URL. Usage: node --env-file=.env.local scripts/db-init.mjs
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
try {
  const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await sql.unsafe(schema);
  console.log("schema applied");
} finally {
  await sql.end();
}
