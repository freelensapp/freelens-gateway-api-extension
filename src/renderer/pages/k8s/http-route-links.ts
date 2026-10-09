import type { Listener } from "../../api/k8s/gateway-v1";
import type { HTTPRouteRule } from "../../api/k8s/http-route-v1";
import type { ParentReference } from "../../api/k8s/types";

const gatewayApiGroup = "gateway.networking.k8s.io";

// The objects come from the host's stores, so only the methods of the host's
// `KubeObject` are called on them.
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

type Scheme = "http" | "https";

export interface HTTPRouteLink {
  // The URL when the scheme is known, otherwise the hostname and path.
  text: string;
  // Set only when the text is a URL to open.
  url?: string;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

// A regular expression is not a path to open; a route with no other path
// links to the root.
function getPaths(rules: HTTPRouteRule[] | undefined): string[] {
  const paths = (rules ?? []).flatMap((rule) => {
    if (!rule.matches || rule.matches.length === 0) {
      return ["/"];
    }

    return rule.matches.flatMap((match) => {
      if (match.path?.type === "RegularExpression") {
        return [];
      }

      return [match.path?.value ?? "/"];
    });
  });

  return paths.length > 0 ? unique(paths) : ["/"];
}

function isGatewayReference(parentRef: ParentReference): boolean {
  return (parentRef.group ?? gatewayApiGroup) === gatewayApiGroup && (parentRef.kind ?? "Gateway") === "Gateway";
}

function listenerMatchesReference(listener: Listener, parentRef: ParentReference): boolean {
  return (
    (parentRef.sectionName === undefined || listener.name === parentRef.sectionName) &&
    (parentRef.port === undefined || listener.port === parentRef.port)
  );
}

// A listener without a hostname accepts any; `*.example.com` accepts any
// hostname below `example.com`, but not `example.com` itself.
function listenerMatchesHostname(listener: Listener, hostname: string): boolean {
  if (!listener.hostname) {
    return true;
  }

  if (listener.hostname.startsWith("*.")) {
    return hostname.endsWith(listener.hostname.slice(1));
  }

  return listener.hostname === hostname;
}

// HTTPS when any listener the route is attached to serves the hostname over
// HTTPS, otherwise HTTP when any serves it over HTTP. Without such a listener
// in `gateways` the scheme is unknown.
function getScheme(route: HTTPRouteForLinks, gateways: GatewayForLinks[], hostname: string): Scheme | undefined {
  const protocols = (route.spec?.parentRefs ?? []).filter(isGatewayReference).flatMap((parentRef) => {
    const namespace = parentRef.namespace ?? route.getNs();
    const gateway = gateways.find(
      (candidate) => candidate.getName() === parentRef.name && candidate.getNs() === namespace,
    );

    return (gateway?.spec?.listeners ?? [])
      .filter(
        (listener) => listenerMatchesReference(listener, parentRef) && listenerMatchesHostname(listener, hostname),
      )
      .map((listener) => listener.protocol);
  });

  if (protocols.includes("HTTPS")) {
    return "https";
  }

  if (protocols.includes("HTTP")) {
    return "http";
  }

  return undefined;
}

// One entry per hostname and path of the route. An entry is a link only when
// the scheme is known from a listener, and never for a wildcard hostname.
// `gateways` is undefined when the cluster serves no Gateway. No port is
// added: a listener's port is the Gateway's, which is not always the one that
// clients reach.
export function getHTTPRouteLinks(route: HTTPRouteForLinks, gateways: GatewayForLinks[] | undefined): HTTPRouteLink[] {
  const hostnames = unique(route.spec?.hostnames ?? []);

  if (hostnames.length === 0) {
    return [{ text: "*" }];
  }

  const paths = getPaths(route.spec?.rules);

  return hostnames.flatMap((hostname) => {
    const scheme = hostname.includes("*") || !gateways ? undefined : getScheme(route, gateways, hostname);

    return paths.map((path) => {
      if (!scheme) {
        return { text: `${hostname}${path}` };
      }

      const url = `${scheme}://${hostname}${path}`;

      return { text: url, url };
    });
  });
}
