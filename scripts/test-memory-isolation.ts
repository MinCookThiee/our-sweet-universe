// Explicit integration check. All fixtures and mutations are rolled back.
import nextEnv from "@next/env";
import {neon} from "@neondatabase/serverless";
import {drizzle} from "drizzle-orm/neon-http";
import {randomUUID} from "node:crypto";
import {memories} from "../src/lib/db/schema";
import {memoryScope} from "../src/lib/db/memory-scope";
nextEnv.loadEnvConfig(process.cwd());
async function main() {
 const sql=neon(process.env.DATABASE_URL!); const db=drizzle(sql);
 const a=randomUUID(),b=randomUUID(),u=randomUUID(),v=randomUUID(),m=randomUUID(),n=randomUUID();
 const actor={coupleId:a,userId:u};
 const foreignRead=db.select().from(memories).where(memoryScope(actor,n)).toSQL();
 const foreignUpdate=db.update(memories).set({body:"forbidden"}).where(memoryScope(actor,n)).returning().toSQL();
 const foreignDelete=db.delete(memories).where(memoryScope(actor,n)).returning().toSQL();
 const ownRead=db.select().from(memories).where(memoryScope(actor,m)).toSQL();
 const ownUpdate=db.update(memories).set({body:"edited"}).where(memoryScope(actor,m)).returning().toSQL();
 const ownDelete=db.delete(memories).where(memoryScope(actor,m)).returning().toSQL();
 const revoked=db.select().from(memories).where(memoryScope({coupleId:a,userId:v},m)).toSQL();
 const assertRead=(query:{sql:string;params:unknown[]}, count:number)=>sql.query(`select 1 / ((count(*) = ${count})::int) from (${query.sql}) as checked`,query.params);
 const assertWrite=(query:{sql:string;params:unknown[]}, count:number)=>sql.query(`with changed as (${query.sql}) select 1 / ((count(*) = ${count})::int) from changed`,query.params);
 try {
  await sql.transaction([
   sql`insert into "user" (id,name,email) values (${u},'Test',${u+'@example.invalid'}),(${v},'Test',${v+'@example.invalid'})`,
   sql`insert into couples (id,name,together_since) values (${a}::uuid,'Test A','2024-01-01'),(${b}::uuid,'Test B','2024-01-01')`,
   sql`insert into couple_members(couple_id,user_id,role) values (${a}::uuid,${u},'owner'),(${b}::uuid,${v},'owner')`,
   sql`insert into memories(id,couple_id,created_by,title,body,happened_on) values (${m}::uuid,${a}::uuid,${u},'Test','original','2024-01-01'),(${n}::uuid,${b}::uuid,${v},'Test','original','2024-01-01')`,
   assertRead(ownRead,1),assertRead(foreignRead,0),assertRead(revoked,0),
   assertWrite(foreignUpdate,0),assertWrite(foreignDelete,0),assertWrite(ownUpdate,1),
   assertWrite(ownDelete,1),assertRead(ownRead,0),
   sql.query("DO $$ BEGIN RAISE EXCEPTION 'Intentional test rollback' USING ERRCODE = 'ZX001'; END $$"),
  ]);
  throw new Error("Expected rollback missing");
 } catch(error) {
  if (!(error && typeof error === "object" && "code" in error && error.code === "ZX001")) throw new Error("Isolation assertion failed; transaction rolled back.");
 }
 const rows=await sql`select id from "user" where id in (${u},${v})`;
 if(rows.length) throw new Error("Fixture cleanup failed");
 console.log("PASS: own-couple reads/updates/deletes; cross-couple and nonmember denied; fixtures rolled back.");
}
main().catch(()=>{console.error("Isolation check failed. No query parameters printed.");process.exitCode=1;});
