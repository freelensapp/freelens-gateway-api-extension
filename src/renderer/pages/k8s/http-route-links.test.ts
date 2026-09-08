import { describe, expect, test } from "vitest";
import { getHTTPRouteLinks } from "./http-route-links";

function route(spec: Parameters<typeof getHTTPRouteLinks>[0]["spec"] = {}) {
  return {
    getNs: () => "apps",
    spec,
  };
}

function gateway(
  name: string,
  listeners: NonNullable<Parameters<typeof getHTTPRouteLinks>[1][number]["spec"]>["listeners"],
  namespace = "apps",
) {
  return {
    getName: () => name,
    getNs: () => namespace,
    spec: { listeners },
  };
}

describe("getHTTPRouteLinks", () => {
  test("returns no links when the route has no hostnames", () => {
    expect(getHTTPRouteLinks(route(), [])).toEqual([]);
  });

  test("uses an HTTP root URL when no Gateway is available", () => {
    expect(getHTTPRouteLinks(route({ hostnames: ["app.example.com"] }), [])).toEqual([
      { displayAsLink: true, url: "http://app.example.com/" },
    ]);
  });

  test("includes unique non-regex match paths", () => {
    expect(
      getHTTPRouteLinks(
        route({
          hostnames: ["app.example.com"],
          rules: [
            { matches: [{ path: { type: "PathPrefix", value: "/admin" } }, { path: { value: "/" } }] },
            { matches: [{ path: { type: "RegularExpression", value: "/users/[0-9]+" } }] },
          ],
        }),
        [],
      ),
    ).toEqual([
      { displayAsLink: true, url: "http://app.example.com/admin" },
      { displayAsLink: true, url: "http://app.example.com/" },
    ]);
  });

  test("uses matching Gateway listener protocols and ports", () => {
    expect(
      getHTTPRouteLinks(
        route({
          hostnames: ["app.example.com"],
          parentRefs: [
            { name: "public", sectionName: "websecure" },
            { name: "public", port: 8080 },
          ],
        }),
        [
          gateway("public", [
            { name: "web", port: 8080, protocol: "HTTP" },
            { name: "websecure", port: 443, protocol: "HTTPS" },
            { name: "tcp", port: 9000, protocol: "TCP" },
          ]),
        ],
      ),
    ).toEqual([
      { displayAsLink: true, url: "https://app.example.com/" },
      { displayAsLink: true, url: "http://app.example.com:8080/" },
    ]);
  });

  test("matches the referenced Gateway namespace and listener hostname", () => {
    expect(
      getHTTPRouteLinks(
        route({
          hostnames: ["app.example.com"],
          parentRefs: [{ name: "public", namespace: "infra" }],
        }),
        [
          gateway("public", [{ name: "wrong-host", hostname: "other.example.com", port: 443, protocol: "HTTPS" }]),
          gateway("public", [{ name: "wildcard", hostname: "*.example.com", port: 8443, protocol: "HTTPS" }], "infra"),
        ],
      ),
    ).toEqual([{ displayAsLink: true, url: "https://app.example.com:8443/" }]);
  });

  test("does not make wildcard hostnames clickable", () => {
    expect(getHTTPRouteLinks(route({ hostnames: ["*.example.com"] }), [])).toEqual([
      { displayAsLink: false, url: "http://*.example.com/" },
    ]);
  });
});
