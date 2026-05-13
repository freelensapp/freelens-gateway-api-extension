import { Renderer } from "@freelensapp/extensions";
import {
  type GatewayBackendRef,
  type GatewayCondition,
  type GatewayKubeObjectCRD,
  type GatewayParentRef,
  hasTrueCondition,
} from "./types";

export interface HTTPRouteSpec {
  hostnames?: string[];
  parentRefs?: GatewayParentRef[];
  commonParentRefs?: GatewayParentRef[];
  rules?: Array<{
    backendRefs?: GatewayBackendRef[];
    filters?: Array<{ type: string }>;
  }>;
}

export interface HTTPRouteStatus {
  parents?: Array<{
    conditions?: GatewayCondition[];
  }>;
}

export class HTTPRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  HTTPRouteStatus,
  HTTPRouteSpec
> {
  static readonly kind = "HTTPRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/httproutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "httproutes",
    singular: "httproute",
    shortNames: ["httpr"],
    title: "HTTP Routes",
  };

  getHostnames(): string[] {
    return this.spec.hostnames ?? [];
  }

  getParentRefs(): GatewayParentRef[] {
    return [...(this.spec.commonParentRefs ?? []), ...(this.spec.parentRefs ?? [])];
  }

  getRulesCount(): number {
    return this.spec.rules?.length ?? 0;
  }

  getBackendRefs(): GatewayBackendRef[] {
    return (this.spec.rules ?? []).flatMap((rule) => rule.backendRefs ?? []);
  }

  isAccepted(): boolean {
    return this.status?.parents?.some((parent) => hasTrueCondition(parent.conditions, "Accepted")) ?? false;
  }
}

export class HTTPRouteApi extends Renderer.K8sApi.KubeApi<HTTPRoute> {}
export class HTTPRouteStore extends Renderer.K8sApi.KubeObjectStore<HTTPRoute, HTTPRouteApi> {}
