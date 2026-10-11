import { describe, expect, it } from "vitest";
import { formatBackendPort, isBackendAccepted } from "./xbackend-v1alpha1";

const parentRef = { name: "gateway" };

describe("isBackendAccepted", () => {
  it("returns true when a parent has accepted the backend", () => {
    expect(
      isBackendAccepted({
        parents: [
          { controllerName: "example.net/a", parentRef, conditions: [{ type: "Accepted", status: "False" }] },
          { controllerName: "example.net/b", parentRef, conditions: [{ type: "Accepted", status: "True" }] },
        ],
      }),
    ).toBe(true);
  });

  it("returns false when no parent has accepted the backend", () => {
    expect(
      isBackendAccepted({
        parents: [{ controllerName: "example.net/a", parentRef, conditions: [{ type: "Accepted", status: "False" }] }],
      }),
    ).toBe(false);
    expect(isBackendAccepted({ parents: [{ controllerName: "example.net/a", parentRef }] })).toBe(false);
  });

  it("returns false without parents or status", () => {
    expect(isBackendAccepted({ parents: [] })).toBe(false);
    expect(isBackendAccepted({})).toBe(false);
    expect(isBackendAccepted(undefined)).toBe(false);
  });
});

describe("formatBackendPort", () => {
  it("shows the port number", () => {
    expect(formatBackendPort({ port: 443 })).toBe("443");
    expect(formatBackendPort({ name: "", port: 443 })).toBe("443");
  });

  it("adds the port's name", () => {
    expect(formatBackendPort({ name: "https", port: 443 })).toBe("443 (https)");
  });

  it("shows a dash without a port", () => {
    expect(formatBackendPort(undefined)).toBe("-");
  });
});
