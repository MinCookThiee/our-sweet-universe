import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerInput } from "../scripts/owner-input";
import { hashPassword, verifyPassword } from "better-auth/crypto";
const valid = { name: "Owner", email: "owner@example.com", password: "test-only-password-123", coupleName: "Our space", togetherSince: "2024-02-29", timezone: "Asia/Bangkok" };
test("owner setup rejects invalid dates, timezone, short passwords and blank names", () => {
  for (const change of [{togetherSince:"2025-02-29"},{timezone:"not/a-zone"},{password:"short"},{name:" "}])
    assert.equal(ownerInput.safeParse({...valid,...change}).success,false);
});
test("owner email is normalized for Better Auth login", () => {
  assert.equal(ownerInput.parse({...valid,email:"OWNER@example.com"}).email,"owner@example.com");
});
test("bootstrap hash works with Better Auth verifier and rejects incorrect password", async () => {
  const hash = await hashPassword(valid.password);
  assert.notEqual(hash, valid.password);
  assert.equal(await verifyPassword({hash,password:valid.password}),true);
  assert.equal(await verifyPassword({hash,password:"wrong-password"}),false);
});
