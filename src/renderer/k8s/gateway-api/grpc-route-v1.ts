import { Renderer } from "@freelensapp/extensions";
import {
  type GatewayBackendRef,
  type GatewayCondition,
  type GatewayKubeObjectCRD,
  type GatewayParentRef,
  hasTrueCondition,
} from "./types";

export interface GRPCRouteSpec {
  hostnames?: string[];
  parentRefs?: GatewayParentRef[];
  commonParentRefs?: GatewayParentRef[];
  rules?: Array<{
    backendRefs?: GatewayBackendRef[];
    filters?: Array<{ type: string }>;
  }>;
}

export interface GRPCRouteStatus {
  parents?: Array<{
    conditions?: GatewayCondition[];
  }>;
}

export class GRPCRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  GRPCRouteStatus,
  GRPCRouteSpec
> {
  static readonly kind = "GRPCRoute";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/grpcroutes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "grpcroutes",
    singular: "grpcroute",
    shortNames: ["grpcr"],
    title: "gRPC Routes",
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

export class GRPCRouteApi extends Renderer.K8sApi.KubeApi<GRPCRoute> {}
export class GRPCRouteStore extends Renderer.K8sApi.KubeObjectStore<GRPCRoute, GRPCRouteApi> {}
