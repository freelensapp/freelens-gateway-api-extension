import { describe, expect, test } from "vitest";
import { maybe } from "./utils";

describe("maybe", () => {
  test("returns the value when the callback succeeds", () => {
    expect(maybe(() => 42)).toBe(42);
  });

  test("returns null when the callback throws", () => {
    expect(
      maybe(() => {
        throw new Error("boom");
      }),
    ).toBeNull();
  });

  test("preserves falsy non-throwing values", () => {
    expect(maybe(() => 0)).toBe(0);
    expect(maybe(() => "")).toBe("");
    expect(maybe(() => false)).toBe(false);
  });

  test("returns the resolved object reference unchanged", () => {
    const value = { a: 1 };
    expect(maybe(() => value)).toBe(value);
  });
});
