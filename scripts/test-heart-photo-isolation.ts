// All fixture rows are in one transaction and intentionally rolled back.
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { randomUUID } from "node:crypto";
import { couples } from "../src/lib/db/schema";
import { defaultCrop } from "../src/lib/heart-photo-input";
nextEnv.loadEnvConfig(process.cwd());
async function main() {
  const { photoScope } = await import("../src/lib/heart-photo");
  const sql = neon(process.env.DATABASE_URL!); const db = drizzle(sql);
  const a=randomUUID(),b=randomUUID(),u=randomUUID(),v=randomUUID(),id=randomUUID();
  const actor={coupleId:a,userId:u,photos:[],legacyPhoto:null,revision:0};
  const photo={id,width:100,height:100,format:"jpg" as const,crop:defaultCrop};
  const mutation=(who:typeof actor, revision:number) => db.update(couples).set({heartPhotos:[photo],heartPhoto:null,photoRevision:1}).where(photoScope(who,revision)).returning({id:couples.id}).toSQL();
  const assertWrite=(q:{sql:string;params:unknown[]},count:number)=>sql.query(`with changed as (${q.sql}) select 1 / ((count(*) = ${count})::int) from changed`,q.params);
  try {
    await sql.transaction([
      sql`insert into "user" (id,name,email) values (${u},'Fixture',${u+'@example.invalid'}),(${v},'Fixture',${v+'@example.invalid'})`,
      sql`insert into couples (id,name,together_since) values (${a}::uuid,'Fixture A','2024-01-01'),(${b}::uuid,'Fixture B','2024-01-01')`,
      sql`insert into couple_members (couple_id,user_id,role) values (${a}::uuid,${u},'owner'),(${b}::uuid,${v},'partner')`,
      assertWrite(mutation({...actor,coupleId:b},0),0),
      assertWrite(mutation({...actor,userId:v},0),0),
      assertWrite(mutation(actor,0),1),
      assertWrite(mutation(actor,0),0),
      sql`delete from couple_members where user_id=${u}`,
      assertWrite(mutation(actor,1),0),
      sql.query("DO $$ BEGIN RAISE EXCEPTION 'Intentional rollback' USING ERRCODE = 'ZX002'; END $$"),
    ]);
    throw new Error("missing-rollback");
  } catch(error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ZX002")) throw new Error("isolation-failed");
  }
  const rows=await sql`select id from "user" where id in (${u},${v})`;
  if(rows.length) throw new Error("cleanup-failed");
  console.log("PASS: own photo update; cross-couple/nonmember denial; stale revision denial; revoked membership denial; rollback verified.");
}
main().catch(()=>{console.error("Photo isolation test failed. No database details printed.");process.exitCode=1;});
