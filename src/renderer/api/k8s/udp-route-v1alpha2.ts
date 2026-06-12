import { Renderer } from "@freelensapp/extensions";
import { type BackendRef, type CommonRouteSpec, type GatewayKubeObjectCRD, type RouteStatus } from "./types";

export interface UDPRouteRule {
  name?: string;
  backendRefs?: BackendRef[];
}

export interface UDPRouteSpec extends CommonRouteSpec {
  rules?: UDPRouteRule[];
}

export interface UDPRouteStatus extends RouteStatus {}

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
    title: "UDP Routes",
  };
}

export class UDPRouteApi extends Renderer.K8sApi.KubeApi<UDPRoute> {}
export class UDPRouteStore extends Renderer.K8sApi.KubeObjectStore<UDPRoute, UDPRouteApi> {}
