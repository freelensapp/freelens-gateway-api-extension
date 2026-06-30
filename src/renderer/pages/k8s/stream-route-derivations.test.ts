import { describe, expect, test } from "vitest";
import { getBackendRefs, getParentRefs, isAccepted } from "./stream-route-derivations";

describe("getParentRefs", () => {
  test("returns an empty array when there is no spec", () => {
    expect(getParentRefs({})).toEqual([]);
    expect(getParentRefs({ spec: {} })).toEqual([]);
  });

  test("merges commonParentRefs before parentRefs", () => {
    expect(
      getParentRefs({
        spec: {
          commonParentRefs: [{ name: "common-gw" }],
          parentRefs: [{ name: "own-gw" }],
        },
      }),
    ).toEqual([{ name: "common-gw" }, { name: "own-gw" }]);
  });

  test("handles either source being absent", () => {
    expect(getParentRefs({ spec: { parentRefs: [{ name: "own-gw" }] } })).toEqual([{ name: "own-gw" }]);
    expect(getParentRefs({ spec: { commonParentRefs: [{ name: "common-gw" }] } })).toEqual([{ name: "common-gw" }]);
  });
});

describe("getBackendRefs", () => {
  test("returns an empty array when there are no rules", () => {
    expect(getBackendRefs({})).toEqual([]);
    expect(getBackendRefs({ spec: {} })).toEqual([]);
    expect(getBackendRefs({ spec: { rules: [] } })).toEqual([]);
  });

  test("flattens backendRefs across rules", () => {
    expect(
      getBackendRefs({
        spec: {
          rules: [{ backendRefs: [{ name: "svc-a" }] }, { backendRefs: [{ name: "svc-b" }, { name: "svc-c" }] }],
        },
      }),
    ).toEqual([{ name: "svc-a" }, { name: "svc-b" }, { name: "svc-c" }]);
  });

  test("ignores rules without backendRefs", () => {
    expect(
      getBackendRefs({
        spec: {
          rules: [{}, { backendRefs: [{ name: "svc-a" }] }],
        },
      }),
    ).toEqual([{ name: "svc-a" }]);
  });
});

describe("isAccepted", () => {
  test("returns false when there is no status or no parents", () => {
    expect(isAccepted({})).toBe(false);
    expect(isAccepted({ status: {} })).toBe(false);
    expect(isAccepted({ status: { parents: [] } })).toBe(false);
  });

  test("returns true when any parent has an Accepted=True condition", () => {
    expect(
      isAccepted({
        status: {
          parents: [
            { conditions: [{ type: "ResolvedRefs", status: "True" }] },
            { conditions: [{ type: "Accepted", status: "True" }] },
          ],
        },
      }),
    ).toBe(true);
  });

  test("returns false when Accepted is present but not True", () => {
    expect(
      isAccepted({
        status: {
          parents: [{ conditions: [{ type: "Accepted", status: "False" }] }],
        },
      }),
    ).toBe(false);
  });

  test("returns false when a parent has no conditions", () => {
    expect(isAccepted({ status: { parents: [{}] } })).toBe(false);
  });
});
