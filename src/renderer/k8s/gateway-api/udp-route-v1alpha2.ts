import { Renderer } from "@freelensapp/extensions";
import { BaseStreamRoute } from "./base-stream-route";
import { type GatewayKubeObjectCRD } from "./types";

export class UDPRoute extends BaseStreamRoute {
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
