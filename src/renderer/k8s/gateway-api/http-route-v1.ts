import { Renderer } from "@freelensapp/extensions";
import {
  type BackendObjectReference,
  type BackendRef,
  type CommonRouteSpec,
  type Fraction,
  type GatewayKubeObjectCRD,
  type LocalObjectReference,
  type RouteStatus,
  type SessionPersistence,
} from "./types";

export type PathMatchType = "Exact" | "PathPrefix" | "RegularExpression";

export type HeaderMatchType = "Exact" | "RegularExpression";

export type QueryParamMatchType = "Exact" | "RegularExpression";

export type HTTPMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";

export type HTTPMethodWithWildcard = HTTPMethod | "*";

export type HTTPPathModifierType = "ReplaceFullPath" | "ReplacePrefixMatch";

export type HTTPRouteFilterType =
  | "RequestHeaderModifier"
  | "ResponseHeaderModifier"
  | "RequestRedirect"
  | "URLRewrite"
  | "RequestMirror"
  | "CORS"
  | "ExternalAuth"
  | "ExtensionRef";

export type HTTPRouteExternalAuthProtocol = "GRPC" | "HTTP";

export type RouteConditionReason =
  | "Accepted"
  | "NotAllowedByListeners"
  | "NoMatchingListenerHostname"
  | "NoMatchingParent"
  | "UnsupportedValue"
  | "Pending"
  | "IncompatibleFilters"
  | "ResolvedRefs"
  | "RefNotPermitted"
  | "InvalidKind"
  | "BackendNotFound"
  | "UnsupportedProtocol";

export type RouteConditionType = "Accepted" | "ResolvedRefs" | "PartiallyInvalid";

export interface HTTPPathMatch {
  /** default: `"PathPrefix"` */
  type?: PathMatchType;
  /** default: `"/"` */
  value?: string;
}

export interface HTTPHeaderMatch {
  /** default: `"Exact"` */
  type?: HeaderMatchType;
  name: string;
  value: string;
}

export interface HTTPQueryParamMatch {
  /** default: `"Exact"` */
  type?: QueryParamMatchType;
  name: string;
  value: string;
}

export interface HTTPRouteMatch {
  /** default: `"/"` */
  path?: HTTPPathMatch;
  headers?: HTTPHeaderMatch[];
  queryParams?: HTTPQueryParamMatch[];
  method?: HTTPMethod;
}

export interface HTTPHeader {
  name: string;
  value: string;
}

export interface HTTPHeaderFilter {
  set?: HTTPHeader[];
  add?: HTTPHeader[];
  remove?: string[];
}

export interface HTTPRouteRule {
  name?: string;
  matches?: HTTPRouteMatch[];
  filters?: HTTPRouteFilter[];
  backendRefs?: HTTPBackendRef[];
  timeouts?: HTTPRouteTimeouts;
  retry?: HTTPRouteRetry;
  sessionPersistence?: SessionPersistence;
}

export interface HTTPRequestMirrorFilter {
  backendRef?: BackendObjectReference;
  percent?: number;
  fraction?: Fraction;
}

export interface GRPCAuthConfig {
  allowedHeaders?: string[];
}

export interface HTTPAuthConfig {
  path?: string;
  allowedHeaders?: string[];
  allowedResponseHeaders?: string[];
}

export interface ForwardBodyConfig {
  maxSize?: number;
}

export interface HTTPCORSFilter {
  allowOrigins?: string[];
  allowCredentials?: boolean;
  allowMethods?: HTTPMethodWithWildcard[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
  /** default: `5` */
  maxAge?: number;
}

export interface HTTPBackendRef extends BackendRef {
  filters?: HTTPRouteFilter[];
}

export interface HTTPExternalAuthFilter {
  protocol?: HTTPRouteExternalAuthProtocol;
  backendRef?: BackendObjectReference;
  grpc?: GRPCAuthConfig;
  http?: HTTPAuthConfig;
  forwardBody?: ForwardBodyConfig;
}

export interface HTTPRouteFilter {
  type: HTTPRouteFilterType;
  requestHeaderModifier?: HTTPHeaderFilter;
  responseHeaderModifier?: HTTPHeaderFilter;
  requestMirror?: HTTPRequestMirrorFilter;
  requestRedirect?: HTTPRequestRedirectFilter;
  urlRewrite?: HTTPURLRewriteFilter;
  cors?: HTTPCORSFilter;
  externalAuth?: HTTPExternalAuthFilter;
  extensionRef?: LocalObjectReference;
}

export interface HTTPRouteTimeouts {
  request?: string;
  backendRequest?: string;
}

export interface HTTPRouteRetry {
  codes?: number[];
  attempt?: number;
  backoff?: string;
}

export interface HTTPPathModifier {
  type: HTTPPathModifierType;
  replaceFullPath?: string;
  replacePrefixMatch?: string;
}

export interface HTTPRequestRedirectFilter {
  scheme?: "http" | "https";
  hostname?: string;
  path?: HTTPPathModifier;
  port?: number;
  /** default: `302` */
  statusCode?: 301 | 302 | 303 | 307 | 308;
}

export interface HTTPURLRewriteFilter {
  hostname?: string;
  path?: HTTPPathModifier;
}

export interface HTTPRouteSpec extends CommonRouteSpec {
  hostnames?: string[];
  rules?: HTTPRouteRule[];
}

export interface HTTPRouteStatus extends RouteStatus {}

export class HTTPRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  HTTPRouteStatus,
  HTTPRouteSpec
> {
  static readonly kind = "HTTPRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/httproutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "httproutes",
    singular: "httproute",
    title: "HTTP Routes",
  };
}

export class HTTPRouteApi extends Renderer.K8sApi.KubeApi<HTTPRoute> {}
export class HTTPRouteStore extends Renderer.K8sApi.KubeObjectStore<HTTPRoute, HTTPRouteApi> {}
