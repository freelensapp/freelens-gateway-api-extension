import { describe, expect, test } from "vitest";
import { formatBackendRefs, formatParentRefs } from "./route-summaries";

describe("formatParentRefs", () => {
  test("returns a dash for an empty list", () => {
    expect(formatParentRefs([])).toBe("-");
  });

  test("defaults a missing kind to Gateway", () => {
    expect(formatParentRefs([{ name: "my-gateway" }])).toBe("Gateway/my-gateway");
  });

  test("uses the provided kind when present", () => {
    expect(formatParentRefs([{ kind: "Mesh", name: "my-mesh" }])).toBe("Mesh/my-mesh");
  });

  test("joins multiple parent refs with a comma", () => {
    expect(formatParentRefs([{ name: "gw-a" }, { kind: "Mesh", name: "mesh-b" }])).toBe("Gateway/gw-a, Mesh/mesh-b");
  });
});

describe("formatBackendRefs", () => {
  test("returns a dash for an empty list", () => {
    expect(formatBackendRefs([])).toBe("-");
  });

  test("defaults a missing kind to Service", () => {
    expect(formatBackendRefs([{ name: "my-service" }])).toBe("Service/my-service");
  });

  test("uses the provided kind when present", () => {
    expect(formatBackendRefs([{ kind: "Backend", name: "my-backend" }])).toBe("Backend/my-backend");
  });

  test("joins multiple backend refs with a comma", () => {
    expect(formatBackendRefs([{ name: "svc-a" }, { kind: "Backend", name: "backend-b" }])).toBe(
      "Service/svc-a, Backend/backend-b",
    );
  });
});
