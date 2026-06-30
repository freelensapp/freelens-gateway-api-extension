import { describe, expect, test } from "vitest";
import { getStatusCategory } from "./statuses";

describe("getStatusCategory", () => {
  test("returns Unknown when there is no status", () => {
    expect(getStatusCategory({})).toBe("Unknown");
    expect(getStatusCategory({ status: undefined })).toBe("Unknown");
    expect(getStatusCategory({ status: {} })).toBe("Unknown");
  });

  test("treats a Gateway with all top-level conditions True as Ready", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [
            { type: "Accepted", status: "True", reason: "Accepted" },
            { type: "Programmed", status: "True", reason: "Programmed" },
          ],
        },
      }),
    ).toBe("Ready");
  });

  test("treats a False condition as NotReady", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [
            { type: "Accepted", status: "True", reason: "Accepted" },
            { type: "Programmed", status: "False", reason: "Invalid" },
          ],
        },
      }),
    ).toBe("NotReady");
  });

  test("treats an Unknown condition status as InProgress", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [{ type: "Accepted", status: "Unknown", reason: "Pending" }],
        },
      }),
    ).toBe("InProgress");
  });

  test("treats transient reasons as InProgress even when the status is False", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [{ type: "Programmed", status: "False", reason: "Pending" }],
        },
      }),
    ).toBe("InProgress");
  });

  test("aggregates route conditions from parents", () => {
    expect(
      getStatusCategory({
        status: {
          parents: [
            {
              conditions: [
                { type: "Accepted", status: "True", reason: "Accepted" },
                { type: "ResolvedRefs", status: "True", reason: "ResolvedRefs" },
              ],
            },
          ],
        },
      }),
    ).toBe("Ready");
  });

  test("reports a route as NotReady when any parent has a failing condition", () => {
    expect(
      getStatusCategory({
        status: {
          parents: [
            { conditions: [{ type: "Accepted", status: "True", reason: "Accepted" }] },
            { conditions: [{ type: "ResolvedRefs", status: "False", reason: "BackendNotFound" }] },
          ],
        },
      }),
    ).toBe("NotReady");
  });

  test("aggregates policy conditions from nested ancestor entries", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [
            {
              ancestorRef: { name: "gateway" },
              controllerName: "example.com/controller",
              conditions: [{ type: "Accepted", status: "True", reason: "Accepted" }],
            },
          ],
        },
      }),
    ).toBe("Ready");
  });

  test("reports a policy as NotReady when a nested ancestor condition is False", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [
            {
              ancestorRef: { name: "gateway" },
              controllerName: "example.com/controller",
              conditions: [{ type: "Accepted", status: "False", reason: "Invalid" }],
            },
          ],
        },
      }),
    ).toBe("NotReady");
  });

  test("prefers NotReady over InProgress when both a terminal failure and an Unknown condition are present", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [
            { type: "Accepted", status: "False", reason: "Invalid" },
            { type: "Programmed", status: "Unknown", reason: "Pending" },
          ],
        },
      }),
    ).toBe("NotReady");
  });

  test.each([
    "GatewayNotProgrammed",
    "Reconciling",
    "NotReconciled",
    "Waiting",
    "Pending",
  ])("treats the transient reason %s as InProgress even when the status is False", (reason) => {
    expect(
      getStatusCategory({
        status: {
          conditions: [{ type: "Programmed", status: "False", reason }],
        },
      }),
    ).toBe("InProgress");
  });

  test("treats a mix of True and Unknown conditions (no failures) as InProgress", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [
            { type: "Accepted", status: "True", reason: "Accepted" },
            { type: "Programmed", status: "Unknown", reason: "Pending" },
          ],
        },
      }),
    ).toBe("InProgress");
  });

  test("returns Unknown for a non-object status", () => {
    expect(getStatusCategory({ status: "ready" })).toBe("Unknown");
    expect(getStatusCategory({ status: 42 })).toBe("Unknown");
    expect(getStatusCategory({ status: null })).toBe("Unknown");
  });

  test("ignores conditions that are missing a status field", () => {
    expect(
      getStatusCategory({
        status: {
          conditions: [{ type: "Accepted", reason: "Accepted" }],
        },
      }),
    ).toBe("Unknown");
  });

  test("returns Unknown for empty parents and empty nested condition arrays", () => {
    expect(getStatusCategory({ status: { parents: [] } })).toBe("Unknown");
    expect(getStatusCategory({ status: { parents: [{ conditions: [] }] } })).toBe("Unknown");
    expect(getStatusCategory({ status: { conditions: [{ ancestorRef: { name: "gw" }, conditions: [] }] } })).toBe(
      "Unknown",
    );
  });
});
