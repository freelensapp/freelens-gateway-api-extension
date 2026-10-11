import { describe, expect, test } from "vitest";
import { formatCondition, formatValueMatch, hasTrueCondition, isPolicyAccepted } from "./types";

describe("formatCondition", () => {
  test("shows the type and the status", () => {
    expect(formatCondition({ type: "Accepted", status: "True" })).toBe("Accepted: True");
  });

  test("adds the reason when there is one", () => {
    expect(formatCondition({ type: "Accepted", status: "False", reason: "Invalid" })).toBe("Accepted: False (Invalid)");
  });
});

describe("formatValueMatch", () => {
  test("shows the name, the value and the type", () => {
    expect(formatValueMatch({ type: "RegularExpression", name: "x-version", value: "v[0-9]+" })).toBe(
      "x-version=v[0-9]+ (RegularExpression)",
    );
  });

  test("takes Exact when the type is not set", () => {
    expect(formatValueMatch({ name: "x-env", value: "canary" })).toBe("x-env=canary (Exact)");
  });
});

describe("hasTrueCondition", () => {
  test("returns true when a matching condition is True", () => {
    expect(hasTrueCondition([{ type: "Accepted", status: "True" }], "Accepted")).toBe(true);
  });

  test("returns false when the matching condition is not True", () => {
    expect(hasTrueCondition([{ type: "Accepted", status: "False" }], "Accepted")).toBe(false);
    expect(hasTrueCondition([{ type: "Accepted", status: "Unknown" }], "Accepted")).toBe(false);
  });

  test("returns false when no condition has the requested type", () => {
    expect(hasTrueCondition([{ type: "Programmed", status: "True" }], "Accepted")).toBe(false);
  });

  test("matches the requested type among several conditions", () => {
    expect(
      hasTrueCondition(
        [
          { type: "Accepted", status: "False" },
          { type: "Programmed", status: "True" },
        ],
        "Programmed",
      ),
    ).toBe(true);
  });

  test("returns false for an empty or undefined condition list", () => {
    expect(hasTrueCondition([], "Accepted")).toBe(false);
    expect(hasTrueCondition(undefined, "Accepted")).toBe(false);
  });
});

describe("isPolicyAccepted", () => {
  const ancestorRef = { name: "gateway" };

  test("returns true when an ancestor has accepted the policy", () => {
    expect(
      isPolicyAccepted({
        ancestors: [
          { ancestorRef, controllerName: "example.net/a", conditions: [{ type: "Accepted", status: "False" }] },
          { ancestorRef, controllerName: "example.net/b", conditions: [{ type: "Accepted", status: "True" }] },
        ],
      }),
    ).toBe(true);
  });

  test("returns false when no ancestor has accepted the policy", () => {
    expect(
      isPolicyAccepted({
        ancestors: [
          { ancestorRef, controllerName: "example.net/a", conditions: [{ type: "Accepted", status: "False" }] },
        ],
      }),
    ).toBe(false);
  });

  test("returns false without ancestors or status", () => {
    expect(isPolicyAccepted({ ancestors: [] })).toBe(false);
    expect(isPolicyAccepted(undefined)).toBe(false);
  });
});
