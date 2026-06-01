import { Renderer } from "@freelensapp/extensions";
import { type GatewayCondition, type GatewayKubeObjectCRD, hasTrueCondition } from "./types";

export interface ParametersReference {
  group: string;
  kind: string;
  name: string;
  namespace?: string;
}

export interface GatewayClassSpec {
  controllerName: string;
  parametersRef?: ParametersReference;
  description?: string;
}

export interface GatewayClassStatus {
  conditions?: GatewayCondition[];
}

export class GatewayClass extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  GatewayClassStatus,
  GatewayClassSpec
> {
  static readonly kind = "GatewayClass";
  static readonly namespaced = false;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/gatewayclasses";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "gatewayclasses",
    singular: "gatewayclass",
    title: "Gateway Classes",
  };

  getControllerName(): string {
    return this.spec.controllerName;
  }

  isAccepted(): boolean {
    return hasTrueCondition(this.status?.conditions, "Accepted");
  }
}

export class GatewayClassApi extends Renderer.K8sApi.KubeApi<GatewayClass> {}
export class GatewayClassStore extends Renderer.K8sApi.KubeObjectStore<GatewayClass, GatewayClassApi> {}
