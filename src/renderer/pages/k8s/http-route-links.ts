import type { Listener } from "../../api/k8s/gateway-v1";
import type { HTTPRouteRule } from "../../api/k8s/http-route-v1";
import type { ParentReference } from "../../api/k8s/types";

const gatewayApiGroup = "gateway.networking.k8s.io";

interface HTTPRouteForLinks {
  getNs(): string | undefined;
  spec?: {
    hostnames?: string[];
    parentRefs?: ParentReference[];
    rules?: HTTPRouteRule[];
  };
}

interface GatewayForLinks {
  getName(): string;
  getNs(): string | undefined;
  spec?: {
    listeners?: Listener[];
  };
}

interface RouteEndpoint {
  scheme: "http" | "https";
  port: number;
}

export interface HTTPRouteLink {
  displayAsLink: boolean;
  url: string;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getPaths(rules: HTTPRouteRule[] | undefined): string[] {
  if (!rules || rules.length === 0) {
    return ["/"];
  }

  return unique(
    rules.flatMap((rule) => {
      if (!rule.matches || rule.matches.length === 0) {
        return ["/"];
      }

      return rule.matches.map((match) => (match.path?.type === "RegularExpression" ? "/" : (match.path?.value ?? "/")));
    }),
  );
}

function isGatewayReference(parentRef: ParentReference): boolean {
  return (parentRef.group ?? gatewayApiGroup) === gatewayApiGroup && (parentRef.kind ?? "Gateway") === "Gateway";
}

function listenerMatchesReference(listener: Listener, parentRef: ParentReference): boolean {
  return (
    (!parentRef.sectionName || listener.name === parentRef.sectionName) &&
    (!parentRef.port || listener.port === parentRef.port)
  );
}

function listenerMatchesHostname(listenerHostname: string | undefined, routeHostname: string): boolean {
  if (!listenerHostname) {
    return true;
  }

  if (!listenerHostname.startsWith("*.")) {
    return listenerHostname === routeHostname;
  }

  return routeHostname.endsWith(listenerHostname.slice(1));
}

function getEndpoints(route: HTTPRouteForLinks, gateways: GatewayForLinks[], hostname: string): RouteEndpoint[] {
  const routeNamespace = route.getNs();

  const endpoints = (route.spec?.parentRefs ?? []).filter(isGatewayReference).flatMap((parentRef) => {
    const gatewayNamespace = parentRef.namespace ?? routeNamespace;
    const gateway = gateways.find(
      (candidate) => candidate.getName() === parentRef.name && candidate.getNs() === gatewayNamespace,
    );

    return (gateway?.spec?.listeners ?? [])
      .filter((listener) => listenerMatchesReference(listener, parentRef))
      .filter((listener) => listenerMatchesHostname(listener.hostname, hostname))
      .flatMap((listener): RouteEndpoint[] => {
        if (listener.protocol === "HTTP") {
          return [{ scheme: "http", port: listener.port }];
        }

        if (listener.protocol === "HTTPS") {
          return [{ scheme: "https", port: listener.port }];
        }

        return [];
      });
  });

  if (endpoints.length === 0) {
    return [{ scheme: "http", port: 80 }];
  }

  const uniqueEndpoints = new Map(endpoints.map((endpoint) => [`${endpoint.scheme}:${endpoint.port}`, endpoint]));

  return [...uniqueEndpoints.values()].sort((left, right) => {
    if (left.scheme !== right.scheme) {
      return left.scheme === "https" ? -1 : 1;
    }

    return left.port - right.port;
  });
}

function formatUrl(hostname: string, path: string, endpoint: RouteEndpoint): string {
  const defaultPort = endpoint.scheme === "https" ? 443 : 80;
  const port = endpoint.port === defaultPort ? "" : `:${endpoint.port}`;

  return `${endpoint.scheme}://${hostname}${port}${path}`;
}

export function getHTTPRouteLinks(route: HTTPRouteForLinks, gateways: GatewayForLinks[]): HTTPRouteLink[] {
  const paths = getPaths(route.spec?.rules);

  return unique(
    (route.spec?.hostnames ?? []).flatMap((hostname) =>
      getEndpoints(route, gateways, hostname).flatMap((endpoint) =>
        paths.map((path) => formatUrl(hostname, path, endpoint)),
      ),
    ),
  ).map((url) => ({
    displayAsLink: !url.includes("*"),
    url,
  }));
}
