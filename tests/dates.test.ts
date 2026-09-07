import { test } from "node:test";
import assert from "node:assert/strict";
import { anniversaryStats, calendarDate } from "../src/lib/dates";
test("anniversary today is zero", () =>
  assert.equal(anniversaryStats("2025-09-14", "2026-09-14").daysUntil, 0));
test("rolls to next year", () =>
  assert.equal(
    anniversaryStats("2025-09-14", "2026-09-15").nextDate,
    "2027-09-14",
  ));
test("leap anniversary uses February 28", () =>
  assert.equal(anniversaryStats("2024-02-29", "2025-02-27").daysUntil, 1));
test("calendar date respects couple timezone", () =>
  assert.equal(
    calendarDate(new Date("2026-09-13T18:00:00Z"), "Asia/Bangkok"),
    "2026-09-14",
  ));
test("invalid date rejected", () =>
  assert.throws(() => anniversaryStats("2025-02-30", "2026-01-01")));
test("future start never gives negative together days", () =>
  assert.deepEqual(anniversaryStats("2027-01-01", "2026-12-31"), {
    daysTogether: 0,
    daysUntil: 1,
    nextDate: "2027-01-01",
  }));
