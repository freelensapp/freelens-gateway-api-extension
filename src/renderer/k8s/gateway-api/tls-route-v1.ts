import { Renderer } from "@freelensapp/extensions";
import { type BackendRef, type CommonRouteSpec, type GatewayKubeObjectCRD, type RouteStatus } from "./types";

export interface TLSRouteRule {
  name?: string;
  backendRefs?: BackendRef[];
}

export interface TLSRouteSpec extends CommonRouteSpec {
  hostnames?: string[];
  rules?: TLSRouteRule[];
}

export interface TLSRouteStatus extends RouteStatus {}

export class TLSRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  TLSRouteStatus,
  TLSRouteSpec
> {
  static readonly kind = "TLSRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/tlsroutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "tlsroutes",
    singular: "tlsroute",
    title: "TLS Routes",
  };
}

export class TLSRouteApi extends Renderer.K8sApi.KubeApi<TLSRoute> {}
export class TLSRouteStore extends Renderer.K8sApi.KubeObjectStore<TLSRoute, TLSRouteApi> {}
