import { Renderer } from "@freelensapp/extensions";
import {
  type BackendRef,
  type CommonRouteSpec,
  type GatewayKubeObjectCRD,
  type LocalObjectReference,
  type RouteStatus,
  type SessionPersistence,
} from "./types";

import type { HTTPHeaderFilter, HTTPRequestMirrorFilter } from "./http-route-v1";

export type GRPCMethodMatchType = "Exact" | "RegularExpression";

export type GRPCRouteFilterType = "RequestHeaderModifier" | "ResponseHeaderModifier" | "RequestMirror" | "ExtensionRef";

export interface GRPCMethodMatch {
  type?: GRPCMethodMatchType;
  service?: string;
  method?: string;
}

export interface GRPCHeaderMatch {}

export interface GRPCRouteMatch {
  method?: GRPCMethodMatch;
  headers?: GRPCHeaderMatch[];
}

export interface GRPCRouteFilter {
  type: GRPCRouteFilterType;
  requestHeaderModifier?: HTTPHeaderFilter;
  responseHeaderModifier?: HTTPHeaderFilter;
  requestMirror?: HTTPRequestMirrorFilter;
  extensionRef?: LocalObjectReference;
}

export interface GRPCBackendRef extends BackendRef {
  filters?: GRPCRouteFilter[];
}

export interface GRPCRouteRule {
  name?: string;
  matches?: GRPCRouteMatch[];
  filters?: GRPCRouteFilter[];
  backendRefs?: GRPCBackendRef[];
  sessionPersistence?: SessionPersistence;
}

export interface GRPCRouteSpec extends CommonRouteSpec {
  hostnames?: string[];
  rules?: GRPCRouteRule[];
}

export interface GRPCRouteStatus extends RouteStatus {}

export class GRPCRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  GRPCRouteStatus,
  GRPCRouteSpec
> {
  static readonly kind = "GRPCRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/grpcroutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "grpcroutes",
    singular: "grpcroute",
    title: "gRPC Routes",
  };
}

export class GRPCRouteApi extends Renderer.K8sApi.KubeApi<GRPCRoute> {}
export class GRPCRouteStore extends Renderer.K8sApi.KubeObjectStore<GRPCRoute, GRPCRouteApi> {}
