import { describe, expect, test } from "vitest";
import { createHash } from "./utils";

describe("createHash", () => {
  test("is a 16-character lowercase hex string", () => {
    expect(createHash({ a: 1 })).toMatch(/^[0-9a-f]{16}$/);
  });

  test("is stable for equal input", () => {
    expect(createHash({ a: 1 })).toBe(createHash({ a: 1 }));
  });

  test("differs for different input", () => {
    expect(createHash({ a: 1 })).not.toBe(createHash({ a: 2 }));
  });

  test("is sensitive to key order, matching JSON.stringify semantics", () => {
    expect(createHash({ a: 1, b: 2 })).not.toBe(createHash({ b: 2, a: 1 }));
  });

  test("handles primitive and array input", () => {
    expect(createHash("hello")).toMatch(/^[0-9a-f]{16}$/);
    expect(createHash([1, 2, 3])).toMatch(/^[0-9a-f]{16}$/);
  });
});
