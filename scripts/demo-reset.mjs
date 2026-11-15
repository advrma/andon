// Clears the board for a fresh demo run: empties events and resumes the line.
// Usage: node --env-file=.env.local scripts/demo-reset.mjs
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
try {
  await sql`truncate events`;
  // The board's totals read from the aggregate, so it must be refreshed or stale counts linger.
  await sql`call refresh_continuous_aggregate('checks_per_minute', null, null)`;
  await sql`update line set stopped = false, reason = null, event_id = null, since = null, note = 'demo reset' where id = 1`;
  console.log("events cleared, line resumed");
} finally {
  await sql.end();
}
