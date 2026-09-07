import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { ownerInput } from "./owner-input";

nextEnv.loadEnvConfig(process.cwd());
async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error("Run pnpm setup:owner in an interactive terminal.");
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in .env.local first.");
  const sql = neon(process.env.DATABASE_URL);
  const [existing] = await sql`select exists(select 1 from "user") or exists(select 1 from couples) as initialized`;
  if (existing.initialized) throw new Error("Setup has already started or completed. No accounts were changed.");
  let hidden = false;
  const output = new Writable({ write(chunk, _encoding, callback) {
    if (!hidden) process.stdout.write(chunk);
    callback();
  }});
  const rl = createInterface({ input: process.stdin, output, terminal: true, historySize: 0 });
  rl.on("SIGINT", () => rl.close());
  try {
    console.log("Create the first owner in the database configured in .env.local.");
    const name = await rl.question("Your name: ");
    const email = await rl.question("Login email: ");
    const coupleName = await rl.question("Couple space name: ");
    const togetherSince = await rl.question("Together since (YYYY-MM-DD): ");
    const timezone = (await rl.question("Timezone [Asia/Bangkok]: ")) || "Asia/Bangkok";
    process.stdout.write("Password (12–128 characters, hidden): ");
    hidden = true;
    const password = await rl.question("");
    process.stdout.write("\nConfirm password (hidden): ");
    const confirmation = await rl.question("");
    hidden = false;
    process.stdout.write("\n");
    if (password !== confirmation) throw new Error("Passwords do not match. Nothing was saved.");
    const parsed = ownerInput.safeParse({ name, email, password, coupleName, togetherSince, timezone });
    if (!parsed.success) throw new Error("Invalid input: " + parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; "));
    const input = parsed.data;
    if ((await rl.question("Type CREATE to save this first account: ")) !== "CREATE") {
      console.log("Cancelled. Nothing was saved."); return;
    }
    const userId = randomUUID(), accountId = randomUUID(), coupleId = randomUUID();
    // Use Better Auth's own hash format; never store or log the plaintext password.
    const hash = await hashPassword(input.password);
    // One transaction, with a lock shared by simultaneous setup attempts. The
    // guarded insert refuses to bootstrap a second space even after a race.
    const results = await sql.transaction([
      sql`select pg_advisory_xact_lock(731094821)`,
      sql`insert into "user" (id,name,email,email_verified)
          select ${userId},${input.name},${input.email},false
          where not exists(select 1 from "user") and not exists(select 1 from couples)
          returning id`,
      sql`insert into account (id,account_id,provider_id,user_id,password)
          select ${accountId},id,'credential',id,${hash} from "user" where id=${userId}`,
      sql`insert into couples (id,name,together_since,timezone)
          select ${coupleId}::uuid,${input.coupleName},${input.togetherSince}::date,${input.timezone}
          from "user" where id=${userId}`,
      sql`insert into couple_members (couple_id,user_id,role)
          select ${coupleId}::uuid,id,'owner' from "user" where id=${userId}`,
    ]);
    if (!results[1].length) throw new Error("Another setup already completed. Nothing was changed.");
    console.log("Owner and couple created. Start pnpm dev, then open /login.");
  } finally { hidden = false; rl.close(); }
}
main().catch((error: unknown) => {
  // Database errors can include query parameters, so never print their details.
  const message = error instanceof Error && !('severity' in error) && !('query' in error) ? error.message : "Database setup failed. Check connection and migrations; no partial account was saved.";
  console.error(message.startsWith("Invalid input") || /^(Run |Set |Setup |Passwords |Another )/.test(message) ? message : "Setup failed. Check database connection and migrations. No credentials were printed.");
  process.exitCode = 1;
});
