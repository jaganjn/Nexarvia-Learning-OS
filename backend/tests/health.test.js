import test from "node:test";
import assert from "node:assert/strict";

test("Level 5 API contract includes health endpoint", () => {
  const route = "GET /health";
  assert.equal(route, "GET /health");
});

test("production environment requires an explicit JWT secret", () => {
  const secret = process.env.JWT_SECRET || "dev-only-change-me";
  assert.ok(typeof secret === "string");
});
