import { describe, expect, test } from "vitest";
import { getReferenceGrantRowSummaries } from "./reference-grant-summaries";

describe("ReferenceGrant summaries", () => {
  test("formats a single from entry as namespace and kind", () => {
    expect(
      getReferenceGrantRowSummaries({
        from: [{ group: "gateway.networking.k8s.io", kind: "HTTPRoute", namespace: "infra" }],
      }).from,
    ).toBe("infra/HTTPRoute");
  });

  test("formats multiple from entries as a comma-separated full summary", () => {
    expect(
      getReferenceGrantRowSummaries({
        from: [
          { group: "gateway.networking.k8s.io", kind: "HTTPRoute", namespace: "infra" },
          { group: "gateway.networking.k8s.io", kind: "GRPCRoute", namespace: "shared" },
        ],
      }).from,
    ).toBe("infra/HTTPRoute, shared/GRPCRoute");
  });

  test("formats an unnamed to target as kind only", () => {
    expect(
      getReferenceGrantRowSummaries({
        to: [{ group: "", kind: "Service" }],
      }).to,
    ).toBe("Service");
  });

  test("formats a named to target as kind and name", () => {
    expect(
      getReferenceGrantRowSummaries({
        to: [{ group: "", kind: "Secret", name: "tls-cert" }],
      }).to,
    ).toBe("Secret/tls-cert");
  });

  test("formats multiple to entries as a comma-separated full summary", () => {
    expect(
      getReferenceGrantRowSummaries({
        to: [
          { group: "", kind: "Service" },
          { group: "", kind: "Secret", name: "tls-cert" },
        ],
      }).to,
    ).toBe("Service, Secret/tls-cert");
  });

  test("formats an empty from list as a dash", () => {
    expect(getReferenceGrantRowSummaries({ from: [] }).from).toBe("-");
  });

  test("formats an empty to list as a dash", () => {
    expect(getReferenceGrantRowSummaries({ to: [] }).to).toBe("-");
  });

  test("returns short and full row summaries for both from and to", () => {
    expect(
      getReferenceGrantRowSummaries({
        from: [
          { group: "gateway.networking.k8s.io", kind: "HTTPRoute", namespace: "infra" },
          { group: "gateway.networking.k8s.io", kind: "GRPCRoute", namespace: "shared" },
        ],
        to: [
          { group: "", kind: "Service" },
          { group: "", kind: "Secret", name: "tls-cert" },
        ],
      }),
    ).toEqual({
      from: "infra/HTTPRoute, shared/GRPCRoute",
      to: "Service, Secret/tls-cert",
    });
  });
});
