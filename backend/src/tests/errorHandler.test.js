import test from "node:test";
import assert from "node:assert";
import errorHandler from "../middleware/errorHandler.js";

test("errorHandler maps duplicate key error to 409", () => {
  const err = { code: 11000, message: "duplicate" };
  const req = {};
  let statusCode, body;
  const res = {
    status(code) { statusCode = code; return this; },
    json(payload) { body = payload; },
  };
  errorHandler(err, req, res, () => {});
  assert.strictEqual(statusCode, 409);
  assert.match(body.error, /already exists/);
});

test("errorHandler defaults to 500 for unknown errors", () => {
  const err = new Error("boom");
  const req = {};
  let statusCode, body;
  const res = {
    status(code) { statusCode = code; return this; },
    json(payload) { body = payload; },
  };
  errorHandler(err, req, res, () => {});
  assert.strictEqual(statusCode, 500);
});
