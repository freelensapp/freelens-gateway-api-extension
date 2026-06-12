import { Renderer } from "@freelensapp/extensions";
import { type BackendRef, type CommonRouteSpec, type GatewayKubeObjectCRD, type RouteStatus } from "./types";

export interface TCPRouteRule {
  name?: string;
  backendRefs?: BackendRef[];
}

export interface TCPRouteSpec extends CommonRouteSpec {
  rules: TCPRouteRule[];
}

export interface TCPRouteStatus extends RouteStatus {}

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
    title: "TCP Routes",
  };
}

export class TCPRouteApi extends Renderer.K8sApi.KubeApi<TCPRoute> {}
export class TCPRouteStore extends Renderer.K8sApi.KubeObjectStore<TCPRoute, TCPRouteApi> {}
