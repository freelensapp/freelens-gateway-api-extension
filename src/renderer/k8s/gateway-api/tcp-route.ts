import { Renderer } from "@freelensapp/extensions";
import { BaseStreamRoute } from "./base-stream-route";
import { type GatewayKubeObjectCRD } from "./types";

export class TCPRoute extends BaseStreamRoute {
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
