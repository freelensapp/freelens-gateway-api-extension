import { Renderer } from "@freelensapp/extensions";
import {
  type BackendObjectReference,
  type GatewayCondition,
  type GatewayKubeObjectCRD,
  type ParentReference,
} from "./types";

export interface TCPRouteSpec {
  hostnames?: string[];
  parentRefs?: ParentReference[];
  rules?: Array<{
    backendRefs?: BackendObjectReference[];
    filters?: Array<{ type: string }>;
  }>;
}

export interface TCPRouteStatus {
  parents?: Array<{
    conditions?: GatewayCondition[];
  }>;
}

export class TCPRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  TCPRouteStatus,
  TCPRouteSpec
> {
  static readonly kind = "TCPRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1alpha2/tcproutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1alpha2"],
    plural: "tcproutes",
    singular: "tcproute",
    shortNames: ["tcpr"],
    title: "TCP Routes",
  };
}

export class TCPRouteApi extends Renderer.K8sApi.KubeApi<TCPRoute> {}
export class TCPRouteStore extends Renderer.K8sApi.KubeObjectStore<TCPRoute, TCPRouteApi> {}
