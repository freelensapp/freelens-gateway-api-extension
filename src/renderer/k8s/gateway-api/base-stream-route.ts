import { Renderer } from "@freelensapp/extensions";
import { type GatewayBackendRef, type GatewayCondition, type GatewayParentRef, hasTrueCondition } from "./types";

export interface StreamRouteSpec {
  parentRefs?: GatewayParentRef[];
  commonParentRefs?: GatewayParentRef[];
  hostnames?: string[];
  rules?: Array<{
    backendRefs?: GatewayBackendRef[];
  }>;
}

export interface StreamRouteStatus {
  parents?: Array<{
    conditions?: GatewayCondition[];
  }>;
}

export class BaseStreamRoute extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  StreamRouteStatus,
  StreamRouteSpec
> {
  getParentRefs(): GatewayParentRef[] {
    return [...(this.spec.commonParentRefs ?? []), ...(this.spec.parentRefs ?? [])];
  }

  getBackendRefs(): GatewayBackendRef[] {
    return (this.spec.rules ?? []).flatMap((rule) => rule.backendRefs ?? []);
  }

  getRulesCount(): number {
    return this.spec.rules?.length ?? 0;
  }

  getHostnames(): string[] {
    return this.spec.hostnames ?? [];
  }

  isAccepted(): boolean {
    return this.status?.parents?.some((parent) => hasTrueCondition(parent.conditions, "Accepted")) ?? false;
  }
}
