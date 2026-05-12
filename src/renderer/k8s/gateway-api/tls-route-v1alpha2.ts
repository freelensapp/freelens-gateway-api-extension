import { Renderer } from "@freelensapp/extensions";
import { BaseStreamRoute } from "./base-stream-route";
import { type GatewayKubeObjectCRD } from "./types";

export class TLSRoute extends BaseStreamRoute {
  static readonly kind = "TLSRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1alpha2/tlsroutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1alpha2"],
    plural: "tlsroutes",
    singular: "tlsroute",
    shortNames: ["tlsr"],
    title: "TLS Routes",
  };
}

export class TLSRouteApi extends Renderer.K8sApi.KubeApi<TLSRoute> {}
export class TLSRouteStore extends Renderer.K8sApi.KubeObjectStore<TLSRoute, TLSRouteApi> {}
