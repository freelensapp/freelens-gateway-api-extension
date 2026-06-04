import { Renderer } from "@freelensapp/extensions";
import {
  type BackendObjectReference,
  type GatewayCondition,
  type GatewayKubeObjectCRD,
  type ParentReference,
} from "./types";

export interface TLSRouteSpec {
  hostnames?: string[];
  parentRefs?: ParentReference[];
  rules?: Array<{
    backendRefs?: BackendObjectReference[];
    filters?: Array<{ type: string }>;
  }>;
}

export interface TLSRouteStatus {
  parents?: Array<{
    conditions?: GatewayCondition[];
  }>;
}

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
    shortNames: ["tlsr"],
    title: "TLS Routes",
  };
}

export class TLSRouteApi extends Renderer.K8sApi.KubeApi<TLSRoute> {}
export class TLSRouteStore extends Renderer.K8sApi.KubeObjectStore<TLSRoute, TLSRouteApi> {}
