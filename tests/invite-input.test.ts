import { test } from "node:test";
import assert from "node:assert/strict";
import { inviteEmailInput, inviteTokenInput, partnerSignupInput } from "../src/lib/invite-input";

const token = "a".repeat(43);

test("partner invite emails normalize and reject invalid addresses", () => {
  assert.equal(inviteEmailInput.parse({ email: "  HER@Example.com " }).email, "her@example.com");
  assert.equal(inviteEmailInput.safeParse({ email: "not-an-email" }).success, false);
});

test("invite account setup accepts only a full token and matching safe password", () => {
  assert.equal(inviteTokenInput.safeParse(token).success, true);
  assert.equal(inviteTokenInput.safeParse("short").success, false);
  assert.equal(partnerSignupInput.safeParse({ token, name: "Jing", password: "a-private-password", confirmation: "a-private-password" }).success, true);
  assert.equal(partnerSignupInput.safeParse({ token, name: "Jing", password: "a-private-password", confirmation: "not-the-same" }).success, false);
});
