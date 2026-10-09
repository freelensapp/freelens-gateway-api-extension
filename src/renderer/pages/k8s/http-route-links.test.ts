import { describe, expect, test } from "vitest";
import { getHTTPRouteLinks } from "./http-route-links";

import type { Listener } from "../../api/k8s/gateway-v1";

type RouteSpec = NonNullable<Parameters<typeof getHTTPRouteLinks>[0]["spec"]>;

function route(spec: RouteSpec = {}, namespace = "apps") {
  return {
    getNs: () => namespace,
    spec,
  };
}

function gateway(name: string, listeners: Listener[], namespace = "apps") {
  return {
    getName: () => name,
    getNs: () => namespace,
    spec: { listeners },
  };
}

const http: Listener = { name: "web", port: 8000, protocol: "HTTP" };
const https: Listener = { name: "websecure", port: 8443, protocol: "HTTPS" };

describe("getHTTPRouteLinks", () => {
  test("shows * for a route without hostnames", () => {
    expect(getHTTPRouteLinks(route(), [])).toEqual([{ text: "*" }]);
  });

  test("prefers HTTPS over HTTP and adds no port", () => {
    expect(
      getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public" }] }), [
        gateway("public", [http, https, { name: "tcp", port: 9000, protocol: "TCP" }]),
      ]),
    ).toEqual([{ text: "https://app.example.com/", url: "https://app.example.com/" }]);
  });

  test("uses HTTP when no matching listener is HTTPS", () => {
    expect(
      getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public" }] }), [
        gateway("public", [http]),
      ]),
    ).toEqual([{ text: "http://app.example.com/", url: "http://app.example.com/" }]);
  });

  test("finds a Gateway in the namespace of the parent reference", () => {
    expect(
      getHTTPRouteLinks(
        route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public", namespace: "infra" }] }),
        [gateway("public", [http]), gateway("public", [https], "infra")],
      ),
    ).toEqual([{ text: "https://app.example.com/", url: "https://app.example.com/" }]);
  });

  test("does not match a Gateway of the same name in another namespace", () => {
    expect(
      getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public" }] }), [
        gateway("public", [https], "infra"),
      ]),
    ).toEqual([{ text: "app.example.com/" }]);
  });

  test("shows plain text when the Gateway is not loaded", () => {
    expect(getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public" }] }), [])).toEqual([
      { text: "app.example.com/" },
    ]);
  });

  test("shows plain text when there is no Gateway store", () => {
    expect(
      getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public" }] }), undefined),
    ).toEqual([{ text: "app.example.com/" }]);
  });

  test("shows plain text when no matching listener is HTTP or HTTPS", () => {
    expect(
      getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public" }] }), [
        gateway("public", [{ name: "tls", port: 443, protocol: "TLS" }]),
      ]),
    ).toEqual([{ text: "app.example.com/" }]);
  });

  test("ignores parent references that are not Gateways", () => {
    expect(
      getHTTPRouteLinks(
        route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public", kind: "ListenerSet" }] }),
        [gateway("public", [https])],
      ),
    ).toEqual([{ text: "app.example.com/" }]);
  });

  test("matches listeners by sectionName", () => {
    expect(
      getHTTPRouteLinks(
        route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public", sectionName: "web" }] }),
        [gateway("public", [http, https])],
      ),
    ).toEqual([{ text: "http://app.example.com/", url: "http://app.example.com/" }]);
  });

  test("matches listeners by port", () => {
    expect(
      getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public", port: 8000 }] }), [
        gateway("public", [http, https]),
      ]),
    ).toEqual([{ text: "http://app.example.com/", url: "http://app.example.com/" }]);
  });

  test("matches an exact listener hostname", () => {
    const gateways = [
      gateway("public", [
        { ...https, hostname: "other.example.com" },
        { ...http, hostname: "app.example.com" },
      ]),
    ];

    expect(
      getHTTPRouteLinks(route({ hostnames: ["app.example.com"], parentRefs: [{ name: "public" }] }), gateways),
    ).toEqual([{ text: "http://app.example.com/", url: "http://app.example.com/" }]);
  });

  test("matches a wildcard listener hostname by suffix", () => {
    const gateways = [gateway("public", [{ ...https, hostname: "*.example.com" }])];

    expect(
      getHTTPRouteLinks(
        route({ hostnames: ["app.example.com", "example.com"], parentRefs: [{ name: "public" }] }),
        gateways,
      ),
    ).toEqual([{ text: "https://app.example.com/", url: "https://app.example.com/" }, { text: "example.com/" }]);
  });

  test("shows a wildcard route hostname as plain text", () => {
    expect(
      getHTTPRouteLinks(route({ hostnames: ["*.example.com"], parentRefs: [{ name: "public" }] }), [
        gateway("public", [https]),
      ]),
    ).toEqual([{ text: "*.example.com/" }]);
  });

  test("makes one entry per hostname and unique path", () => {
    expect(
      getHTTPRouteLinks(
        route({
          hostnames: ["a.example.com", "b.example.com"],
          parentRefs: [{ name: "public" }],
          rules: [
            { matches: [{ path: { type: "PathPrefix", value: "/admin" } }, { path: { type: "Exact", value: "/" } }] },
            { matches: [{ path: { type: "PathPrefix", value: "/admin" } }] },
          ],
        }),
        [gateway("public", [https])],
      ).map((link) => link.url),
    ).toEqual([
      "https://a.example.com/admin",
      "https://a.example.com/",
      "https://b.example.com/admin",
      "https://b.example.com/",
    ]);
  });

  test("uses / for a rule without a path match", () => {
    expect(
      getHTTPRouteLinks(
        route({
          hostnames: ["app.example.com"],
          rules: [{ matches: [{ method: "GET" }] }, { backendRefs: [{ name: "app" }] }],
        }),
        [],
      ),
    ).toEqual([{ text: "app.example.com/" }]);
  });

  test("does not turn a RegularExpression path into a URL", () => {
    expect(
      getHTTPRouteLinks(
        route({
          hostnames: ["app.example.com"],
          parentRefs: [{ name: "public" }],
          rules: [
            { matches: [{ path: { type: "RegularExpression", value: "/users/[0-9]+" } }] },
            { matches: [{ path: { value: "/api" } }] },
          ],
        }),
        [gateway("public", [https])],
      ),
    ).toEqual([{ text: "https://app.example.com/api", url: "https://app.example.com/api" }]);
  });

  test("uses / when every path is a RegularExpression", () => {
    expect(
      getHTTPRouteLinks(
        route({
          hostnames: ["app.example.com"],
          parentRefs: [{ name: "public" }],
          rules: [{ matches: [{ path: { type: "RegularExpression", value: "/users/[0-9]+" } }] }],
        }),
        [gateway("public", [https])],
      ),
    ).toEqual([{ text: "https://app.example.com/", url: "https://app.example.com/" }]);
  });
});
