import { Renderer } from "@freelensapp/extensions";
import {
  type BackendObjectReference,
  type GatewayCondition,
  type GatewayKubeObjectCRD,
  type ParentReference,
} from "./types";

export interface UDPRouteSpec {
  hostnames?: string[];
  parentRefs?: ParentReference[];
  rules?: Array<{
    backendRefs?: BackendObjectReference[];
    filters?: Array<{ type: string }>;
  }>;
}

export interface UDPRouteStatus {
  parents?: Array<{
    conditions?: GatewayCondition[];
  }>;
}

export class UDPRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  UDPRouteStatus,
  UDPRouteSpec
> {
  static readonly kind = "UDPRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1alpha2/udproutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1alpha2"],
    plural: "udproutes",
    singular: "udproute",
    shortNames: ["udpr"],
    title: "UDP Routes",
  };
}

export class UDPRouteApi extends Renderer.K8sApi.KubeApi<UDPRoute> {}
export class UDPRouteStore extends Renderer.K8sApi.KubeObjectStore<UDPRoute, UDPRouteApi> {}
